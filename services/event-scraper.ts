import { writeFileSync } from "node:fs";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import * as cheerio from "cheerio";
import { format, isAfter } from "date-fns";
import { type Browser, type Page, launch } from "puppeteer";

import { snake_case } from "../helpers/snake-case";
import prompts from "../llm/prompts/index";
import schemas, { type Event } from "../schema/index";
import { blocked_image_domains, blocked_image_extensions } from "./consts";
import { DatabaseService } from "./database";

type PageMap = {
	page: Page;
	cheerio: { dom: cheerio.CheerioAPI; page_text: string };
};

export class EventScraper {
	pages: Map<string, PageMap>;
	browser: Browser | undefined;
	current_date: string;
	dom: cheerio.CheerioAPI;

	constructor() {
		this.pages = new Map<string, PageMap>();
		this.browser = undefined;
		this.current_date = format(new Date(), "yyyy-MM-dd");
		this.dom = undefined;
	}

	launch_browser = async () => {
		console.log("launching new browser");
		this.browser = await launch({
			headless: true,
			args: ["--no-sandbox", "--disable-gpu"],
		});
		this.pages = new Map();
	};

	async visit_website(url: string): Promise<void> {
		if (!this.browser) {
			console.log("no browser found");
			return;
		}

		const newPage = await this.browser.newPage();

		try {
			await newPage.goto(url, {
				waitUntil: "networkidle2",
				timeout: 60000,
			});

			const html = await newPage?.evaluate(() => document.body.innerHTML);

			const $ = cheerio.load(html);

			$("iframe").remove();
			$("script").remove();
			$("style").remove();

			const text = $("body").text();

			const cleaned_text = text
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.length > 0)
				.join("\n");

			this.pages.set(url, {
				page: newPage,
				cheerio: {
					dom: $,
					page_text: cleaned_text,
				},
			});
		} catch (error) {
			console.log("error visiting", error);
			await this.close_page(url, "error during navigation");
			return;
		}
	}

	async get_hrefs(key: string) {
		const current_page = this.get_current_page(key);

		// must use puppeteer here to get domain part of url as well as href. Cheerio only gets the href
		const hrefs = await current_page?.page.evaluate(() => {
			const links = document.querySelectorAll("a");

			if (links.length === 0) {
				return [];
			}

			const unique = new Set(Array.from(links).map((a) => a.href));

			const blocked_domains = [
				"mailto:",
				"tel:",
				"javascript:",
				"https://instagram.com",
				"https://www.instagram.com",
				"https://www.facebook.com",
				"https://www.linkedin.com",
				"https://www.twitter.com",
				"https://www.x.com",
				"https://www.youtube.com",
				"https://www.tiktok.com",
				"https://www.pinterest.com",
				"https://www.snapchat.com",
				"https://www.artsy.net/",
				"https://maps.app.goo.gl",
				"http://www.google.com",
			];

			const urls = Array.from(unique).filter(
				(href) => !blocked_domains.some((domain) => href.startsWith(domain)),
			);

			return urls;
		});

		return hrefs ?? [];
	}

	async get_image_urls(key: string) {
		const current_page = this.get_current_page(key);

		const dom = current_page?.cheerio.dom;

		const image_urls = dom("img")
			.map((_, img) => dom(img).attr("data-srcset") ?? dom(img).attr("src"))
			.get();

		const filtered_image_urls = image_urls.filter(
			(url) =>
				!blocked_image_extensions.some((extension) =>
					url.endsWith(extension),
				) && !blocked_image_domains.some((domain) => url.startsWith(domain)),
		);

		const unique_image_urls = new Set(filtered_image_urls);

		return Array.from(unique_image_urls);
	}

	async find_events(
		text: string | undefined,
		hrefs: string[],
	): Promise<Event[]> {
		if (!text) {
			console.log("no text passed to findEvents");
			return [];
		}

		const { system_prompt, user_prompt } = prompts.find_events_prompt({
			source_of_truth: text,
			hrefs,
			current_date: this.current_date,
		});

		try {
			const result = await generateObject({
				model: openai("gpt-4.1-mini"),
				system: system_prompt,
				prompt: user_prompt,
				schema: schemas.event_map_schema,
			});

			if (!result) {
				console.log("unable to create results from find events");
				return [];
			}

			return result.object.events;
		} catch (error) {
			console.error("error calling LLM to find events", error);
			return [];
		}
	}

	async extract_private_view(page_text: string) {
		const { system_prompt, user_prompt } = prompts.extract_private_view_prompt({
			markdown: page_text,
		});

		try {
			const data = await generateObject({
				model: openai("gpt-4.1-mini"),
				system: system_prompt,
				prompt: user_prompt,
				schema: schemas.private_view_schema,
			});

			return data.object;
		} catch (error) {
			console.log("Error extracting data:", error);
		}
	}

	async extract_start_end_date(page_text: string) {
		const { system_prompt, user_prompt } = prompts.start_and_end_date_prompt({
			markdown: page_text,
		});

		try {
			const data = await generateObject({
				model: openai("gpt-4.1-mini"),
				system: system_prompt,
				prompt: user_prompt,
				schema: schemas.start_date_end_date_schema,
			});

			return data.object;
		} catch (error) {
			console.log("Error extracting data:", error);
			return null;
		}
	}

	async extract_exhibition_name(page_text: string) {
		const { system_prompt, user_prompt } = prompts.exhibition_name_prompt({
			markdown: page_text,
		});

		try {
			const data = await generateObject({
				model: openai("gpt-4.1-mini"),
				system: system_prompt,
				prompt: user_prompt,
				schema: schemas.exhibition_name_schema,
			});

			return data.object;
		} catch (error) {
			console.log("Error extracting data:", error);
			return null;
		}
	}

	async extract_featured_artists(page_text: string) {
		const { system_prompt, user_prompt } = prompts.featured_artists_prompt({
			markdown: page_text,
		});

		try {
			const data = await generateObject({
				model: openai("gpt-4.1-mini"),
				system: system_prompt,
				prompt: user_prompt,
				schema: schemas.featured_artist_schema,
			});

			return data.object;
		} catch (error) {
			console.log("Error extracting data:", error);
		}
	}

	async extract_details(page_text: string) {
		const { system_prompt, user_prompt } = prompts.details_prompt({
			markdown: page_text,
		});

		try {
			const data = await generateObject({
				model: openai("gpt-4.1-mini"),
				system: system_prompt,
				prompt: user_prompt,
				schema: schemas.details_schema,
			});

			return data.object;
		} catch (error) {
			console.log("Error extracting data:", error);
		}
	}

	async extract_image_urls(image_urls: string[]) {
		const { system_prompt, user_prompt } = prompts.image_url_prompt({
			image_urls,
		});

		try {
			const data = await generateObject({
				model: openai("gpt-4.1-mini"),
				system: system_prompt,
				prompt: user_prompt,
				schema: schemas.image_url_schema,
			});

			return data.object;
		} catch (error) {
			console.log("Error extracting data:", error);
		}
	}

	async extract_is_ticketed(page_text: string) {
		const { system_prompt, user_prompt } = prompts.is_ticketed_prompt({
			markdown: page_text,
		});

		try {
			const data = await generateObject({
				model: openai("gpt-4.1-mini"),
				system: system_prompt,
				prompt: user_prompt,
				schema: schemas.is_ticketed_schema,
			});

			return data.object;
		} catch (error) {
			console.log("Error extracting data:", error);
		}
	}

	convert_date(date: string | null) {
		if (!date) return null;

		const converted = new Date(date);
		return Number.isNaN(converted.getTime()) ? null : converted;
	}

	async block_event(
		event: Event,
		seen_exhibitions: string[],
	): Promise<{ should_skip: boolean; reason?: string }> {
		if (!event.name) {
			return {
				should_skip: true,
				reason: "No event name found",
			};
		}

		// if (this.hasEventEnded(event.end_date)) {
		//   return {
		//     should_skip: true,
		//     reason: "Event already ended",
		//   };
		// }

		if (event.name === "Private view") {
			return {
				should_skip: true,
				reason: "Private view",
			};
		}

		// if (seen_exhibitions.includes(event.name)) {
		//   return {
		//     should_skip: true,
		//     reason: "Already seen",
		//   };
		// }

		return {
			should_skip: false,
			reason: undefined,
		};
	}

	async insert_seen_exhibition(exhibition_name: string, gallery_id: string) {
		const db = new DatabaseService();
		await db.insert_seen_exhibition(exhibition_name, gallery_id);
	}

	get_current_page(key: string) {
		const current_page = this.pages.get(key);
		if (!current_page?.page) {
			console.log("no page found, unable to get current page. for key:", key);
			return;
		}

		return current_page;
	}

	async close_page(key: string, reason?: string) {
		const current_page = this.get_current_page(key);

		try {
			await current_page?.page.close();
		} catch (error) {
			console.log("error closing page:", error);
		}

		this.pages.delete(key);

		if (reason) {
			console.log("closed page reason:", reason);
		}
	}

	has_event_ended(endDate: string | Date | null): boolean {
		if (!endDate) {
			return false;
		}

		const now = new Date();
		const eventEndDate =
			typeof endDate === "object" ? endDate : this.convert_date(endDate);

		if (!eventEndDate) {
			return false;
		}

		return !isAfter(eventEndDate, now);
	}

	async extract_event(page_text: string, images: string[]) {
		const [
			private_view,
			start_and_end_date,
			featured_artists,
			exhibition_name,
			image_urls,
			details,
			is_ticketed,
		] = await Promise.all([
			this.extract_private_view(page_text),
			this.extract_start_end_date(page_text),
			this.extract_featured_artists(page_text),
			this.extract_exhibition_name(page_text),
			this.extract_image_urls(images),
			this.extract_details(page_text),
			this.extract_is_ticketed(page_text),
		]);

		return {
			private_view,
			start_and_end_date,
			featured_artists: featured_artists?.featured_artists ?? [],
			exhibition_name: exhibition_name?.exhibition_name ?? null,
			image_urls: image_urls?.urls ?? [],
			details: details?.details ?? null,
			is_ticketed: is_ticketed?.is_ticketed ?? null,
		};
	}

	async write_mocks({
		event_name,
		markdown,
		folder,
		page_key,
	}: {
		event_name: string;
		markdown: string;
		folder: "extract-details" | "find-events";
		page_key: string;
	}) {
		if (!process.env.WRITE_MOCKS) return;

		console.log("writing source of truth", event_name);
		const snake_case_event_name = snake_case(event_name);

		const path = `./__tests__/generated/mocks/${folder}/${snake_case_event_name}.ts`;
		const hrefs = await this.get_hrefs(page_key);
		const content =
			`export const ${snake_case_event_name}_source_of_truth = ` +
			`\`${markdown}\`` +
			`${folder === "find-events" ? `export const ${snake_case_event_name}_hrefs = ${JSON.stringify(hrefs)};` : ""}`;

		writeFileSync(path, content);
	}

	async handler(url: string, gallery_id: string, gallery_name: string) {
		await this.launch_browser();

		console.time("scraping time");
		console.log("scraping url", url);

		if (!this.browser) {
			console.log("no browser found");
			return;
		}

		const page_key = url;

		try {
			await this.visit_website(url);

			const all_events_page_text = this.pages.get(page_key)?.cheerio.page_text;
			console.log("all_events_page_text", all_events_page_text);
			const hrefs = await this.get_hrefs(page_key);
			console.log("hrefs", hrefs);
			const events = await this.find_events(all_events_page_text, hrefs);

			console.log("events.length", events.length);
			console.log("events", events);

			if (events.length === 0) {
				console.log("no events found for:", url);
				await this.close_page(page_key, "No events found");
				return;
			}

			this.write_mocks({
				event_name: gallery_name,
				markdown: all_events_page_text,
				folder: "find-events",
				page_key,
			});

			const db = new DatabaseService();
			const seen_exhibitions = await db.get_seen_exhibitions(); // this.db

			await Promise.allSettled(
				events.map(async (event) => {
					// filter events instead of this
					const { should_skip, reason } = await this.block_event(
						event,
						seen_exhibitions,
					);

					if (should_skip) {
						console.log(`skipping event ${event.name}`, reason);
						return;
					}

					console.log("visiting event details page", event.event_page_url);

					await this.visit_website(event.event_page_url);

					const markdown = this.pages.get(event.event_page_url)?.cheerio
						.page_text;

					if (!markdown) {
						await this.close_page(
							event.event_page_url,
							"No markdown found for event details page",
						);
						return;
					}

					this.write_mocks({
						event_name: event.name,
						markdown,
						folder: "extract-details",
						page_key: event.event_page_url,
					});

					const images = await this.get_image_urls(event.event_page_url);

					// TODO: first get the legit end date of the event and if in past then don't bother with the other checks

					const details = await this.extract_event(markdown, images);

					const payload = {
						exhibition_name: details.exhibition_name ?? null,
						info: details?.details ?? null,
						featured_artists: JSON.stringify(details.featured_artists ?? []),
						exhibition_page_url: event.event_page_url,
						image_urls: JSON.stringify(details.image_urls ?? []),
						is_ticketed: !!details.is_ticketed,
						start_date: this.convert_date(
							details.start_and_end_date?.start_date ??
								event.start_date ??
								null,
						),
						end_date: this.convert_date(
							details.start_and_end_date?.end_date ?? event.end_date ?? null,
						),
						private_view_start_date: this.convert_date(
							details.private_view?.private_view_start_date ??
								event.private_view_start_date ??
								null,
						),
						private_view_end_date: this.convert_date(
							details.private_view?.private_view_end_date ??
								event.private_view_end_date ??
								null,
						),
						gallery_id,
					};

					// TODO: These two blocking statements might not need to exist if the prompt for getting the events is better. e.g. saying the page is unstructured??

					if (this.has_event_ended(payload?.end_date ?? null)) {
						await this.close_page(
							event.event_page_url,
							`Blocking: event has ended ${event.name} ${payload.end_date}`,
						);
						return;
					}

					if (!details.exhibition_name) {
						await this.close_page(
							event.event_page_url,
							`Blocking: no exhibition name found ${event.name}`,
						);
						return;
					}

					await db.insert_exhibition(payload);
					await this.insert_seen_exhibition(event.name, gallery_id);
					await this.close_page(event.event_page_url, "Done");
				}),
			);

			return events;
		} catch (error) {
			console.log("error scraping url:", error);
			console.error("Error processing main page:", error);
		} finally {
			console.timeEnd("scraping time");
			await this.close_page(page_key, "Done");
			await this.browser.close();
		}
	}
}
