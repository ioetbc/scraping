import {Browser, launch, Page} from "puppeteer";
import {GALLERY_URL} from "../const.js";
import {generateObject} from "ai";
import {openai} from "@ai-sdk/openai";
import {format, isAfter} from "date-fns";
import {DatabaseService} from "./database.js";

import {
  details_schema,
  exhibition_name_schema,
  featured_artist_schema,
  image_url_schema,
  is_ticketed_schema,
  private_view_schema,
  start_date_end_date_schema,
  event_map_schema,
  event_image_schema,
  type Event,
  type MegaSchema,
} from "../zod/index.js";

import {
  find_events_prompt,
  details_prompt,
  exhibition_name_prompt,
  extract_private_view_prompt,
  featured_artists_prompt,
  image_url_prompt,
  is_ticketed_prompt,
  start_and_end_date_prompt,
} from "../prompts/index.js";

export class EventScraper {
  pages: Map<string, Page>;
  browser: Browser | undefined;
  current_date: string;

  constructor() {
    this.pages = new Map();
    this.browser = undefined;
    this.current_date = format(new Date(), "yyyy-MM-dd");
  }

  launchBrowser = async () => {
    console.log("launching new browser");
    this.browser = await launch({
      headless: true,
      args: ["--no-sandbox", "--disable-gpu"],
    });
  };

  async visitWebsite(url: string) {
    if (!this.browser) {
      console.log("no browser found");
      return undefined;
    }

    const newPage = await this.browser.newPage();
    this.pages.set(url, newPage);

    try {
      await newPage.goto(url, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });
    } catch (error) {
      console.log("error visiting", error);
      await this.closePage(url, "error during navigation");
      return;
    }
  }

  async getInnerText(key: string) {
    const page = this.pages.get(key);
    if (!page) {
      await this.closePage(
        key,
        `no page found whilst getting inner text ${key}`
      );
      return undefined;
    }

    const html = await page?.evaluate(() => document.body.innerText);
    return html?.trim();
  }

  async getHrefs(key: string) {
    const page = this.pages.get(key);
    if (!page) {
      console.log("no page found for key", key);
      return [];
    }

    const hrefs = await page.evaluate(() => {
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
        (href) => !blocked_domains.some((domain) => href.startsWith(domain))
      );

      return urls;
    });

    return hrefs ?? [];
  }

  async get_image_urls(key: string) {
    const page = this.pages.get(key);
    if (!page) {
      console.log("no page found for key", key);
      return [];
    }

    const image_urls = await page.evaluate(() => {
      const images = document.querySelectorAll("img");
      console.log("images", images);

      const unique = new Set(Array.from(images).map((image) => image.src));

      const blocked_extensions = [".svg", ".gif", ".ico"];

      const urls = Array.from(unique).filter(
        (href) =>
          !blocked_extensions.some((extension) => href.endsWith(extension))
      );

      return urls;
    });

    return image_urls ?? [];
  }

  async find_events(
    text: string | undefined,
    hrefs: string[]
  ): Promise<Event[]> {
    if (!text) {
      console.log("no text passed to findEvents");
      return [];
    }

    console.log("event page text", text);

    const {system_prompt, user_prompt} = find_events_prompt({
      source_of_truth: text,
      hrefs,
      current_date: this.current_date,
    });

    try {
      const result = await generateObject({
        model: openai("gpt-4o-mini"),
        system: system_prompt,
        prompt: user_prompt,
        schema: event_map_schema,
      });

      if (!result) {
        console.log("llm unable to parse", GALLERY_URL);
        return [];
      }

      return result.object.events;
    } catch (error) {
      console.error("error calling LLM to find events", error);
      return [];
    }
  }

  extract_private_view = async (page_text: string) => {
    const {system_prompt, user_prompt} = extract_private_view_prompt({
      markdown: page_text,
    });

    try {
      const data = await generateObject({
        model: openai("gpt-4o-mini"),
        system: system_prompt,
        prompt: user_prompt,
        schema: private_view_schema,
      });

      return data.object;
    } catch (error) {
      console.log("Error extracting data:", error);
    }
  };

  extract_start_end_date = async (page_text: string) => {
    const {system_prompt, user_prompt} = start_and_end_date_prompt({
      markdown: page_text,
    });

    try {
      const data = await generateObject({
        model: openai("gpt-4o-mini"),
        system: system_prompt,
        prompt: user_prompt,
        schema: start_date_end_date_schema,
      });

      return data.object;
    } catch (error) {
      console.log("Error extracting data:", error);
      return null;
    }
  };

  extract_exhibition_name = async (page_text: string) => {
    const {system_prompt, user_prompt} = exhibition_name_prompt({
      markdown: page_text,
    });

    try {
      const data = await generateObject({
        model: openai("gpt-4o-mini"),
        system: system_prompt,
        prompt: user_prompt,
        schema: exhibition_name_schema,
      });

      return data.object;
    } catch (error) {
      console.log("Error extracting data:", error);
      return null;
    }
  };

  extract_featured_artists = async (page_text: string) => {
    const {system_prompt, user_prompt} = featured_artists_prompt({
      markdown: page_text,
    });

    try {
      const data = await generateObject({
        model: openai("gpt-4o-mini"),
        system: system_prompt,
        prompt: user_prompt,
        schema: featured_artist_schema,
      });

      return data.object;
    } catch (error) {
      console.log("Error extracting data:", error);
    }
  };

  extract_details = async (page_text: string) => {
    const {system_prompt, user_prompt} = details_prompt({
      markdown: page_text,
    });

    try {
      const data = await generateObject({
        model: openai("gpt-4o-mini"),
        system: system_prompt,
        prompt: user_prompt,
        schema: details_schema,
      });

      return data.object;
    } catch (error) {
      console.log("Error extracting data:", error);
    }
  };

  extract_image_urls = async (image_urls: string[]) => {
    const {system_prompt, user_prompt} = image_url_prompt({
      image_urls,
    });

    try {
      const data = await generateObject({
        model: openai("gpt-4o-mini"),
        system: system_prompt,
        prompt: user_prompt,
        schema: image_url_schema,
      });

      return data.object;
    } catch (error) {
      console.log("Error extracting data:", error);
    }
  };

  extract_is_ticketed = async (page_text: string) => {
    const {system_prompt, user_prompt} = is_ticketed_prompt({
      markdown: page_text,
    });

    try {
      const data = await generateObject({
        model: openai("gpt-4o-mini"),
        system: system_prompt,
        prompt: user_prompt,
        schema: is_ticketed_schema,
      });

      return data.object;
    } catch (error) {
      console.log("Error extracting data:", error);
    }
  };

  extractImages = async (
    key: string,
    event_name: string
  ): Promise<string[]> => {
    const page = this.getPage(key);

    if (!page) {
      this.closePage(key, "No key for page provided to extract image method");
      return [];
    }

    const imageElements = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img")).map((element) => element.src)
    );

    const jpgs =
      imageElements?.filter((image) => !image.endsWith(".svg")) ?? [];

    // TODO also scrap ones that are tiny e.g. https://a-i-gallery.com/exhibitions/63-feeling-like-home-tenter-ground-london/press_release_text/ returns the related artist images at the bottom of the page which are tiny
    try {
      const data = await generateObject({
        model: openai("gpt-4o-mini"),
        system: `
          You are a diligent lead researcher.
          You have received a "list of image urls".
          Your job is to:
            1. Carefully select the most likely images that correspond to the event
            2. Pick a maximum of 5 images
            3. Reject images that do not correspond to the event for example a logo
            4. Reject image formats that are not a jpg, jpeg, png, webp or similar. For example you should reject .svg and base64 image formats
        `,
        prompt: `The event name is ${event_name}. Here is the "List of images" ${jpgs}`,
        schema: event_image_schema,
      });
      return data.object.image_urls;
    } catch (error) {
      console.log("LLM error, unable to choose most likely images");
      return [];
    }
  };

  convertDate = (date: string | null) => {
    if (!date) return null;

    const converted = new Date(date);
    return isNaN(converted.getTime()) ? null : converted;
  };

  insertDbRecord = async (
    record: MegaSchema,
    url: string,
    gallery_id: string
  ) => {
    const db = new DatabaseService();

    await db.insert_exhibition({
      exhibition_name: record.exhibition_name,
      info: record.details,
      featured_artists: JSON.stringify(record.featured_artists),
      exhibition_page_url: url,
      image_urls: JSON.stringify(record.urls),
      is_ticketed: !!record.is_ticketed,
      start_date: this.convertDate(record?.start_date),
      end_date: this.convertDate(record?.end_date),
      private_view_start_date: this.convertDate(
        record.private_view_start_date ?? null
      ),
      private_view_end_date: this.convertDate(
        record.private_view_end_date ?? null
      ),
      gallery_id,
    });
  };

  insert_seen_exhibition = async (
    exhibition_name: string,
    gallery_id: string
  ) => {
    const db = new DatabaseService();
    await db.insert_seen_exhibition(exhibition_name, gallery_id);
  };

  getPage = (key: string) => {
    return this.pages.get(key);
  };

  blockEvent = async (
    event: Event,
    seen_exhibitions: string[]
  ): Promise<{should_skip: boolean; reason?: string}> => {
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
  };

  closePage = async (key: string, reason?: string) => {
    // const page = this.getPage(key);
    const page = this.pages.get(key);
    if (page) {
      try {
        console.log("closing page for", page);
        await page.close();
      } catch (error) {
        console.log("error closing page:", error);
      }
      this.pages.delete(key);
    } else {
      console.log("no page found, unable to close page. for key:", key);
      return;
    }

    if (reason) {
      console.log("closed page reason:", reason);
    }
  };

  hasEventEnded = (endDate: string | Date | null): boolean => {
    if (!endDate) {
      return false;
    }

    const now = new Date();
    const eventEndDate =
      typeof endDate === "object" ? endDate : this.convertDate(endDate);

    if (!eventEndDate) {
      return false;
    }

    return !isAfter(eventEndDate, now);
  };

  extract_event = async (page_text: string, images: string[]) => {
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
  };

  async handler(url: string, gallery_id: string) {
    console.log("number of this.pages open:", this.pages.size);
    const pages = await this.browser?.pages();
    console.log("number of browser pages open:", pages?.length);

    console.log("launching browser");
    await this.launchBrowser();

    console.time("scraping time");
    console.log("scraping url", url);

    if (!this.browser) {
      console.log("no browser found");
      return;
    }

    const page_key = url;

    try {
      await this.visitWebsite(url);

      console.log("getting page text");
      const page_text = await this.getInnerText(page_key);
      // console.log("page text", page_text);
      console.log("getting hrefs");
      const hrefs = await this.getHrefs(page_key);
      console.log("hrefs", hrefs);

      // TODO remove duplicated from hrefs annakultys seems to have many of them!
      console.log("getting events");
      const events = await this.find_events(page_text, hrefs);

      console.log("events.length", events.length);
      console.log("events", events);

      if (events.length === 0) {
        console.log("no events found for:", url);
        await this.closePage(page_key, "No events found");
        return;
      }

      const db = new DatabaseService();
      const seen_exhibitions = await db.get_seen_exhibitions(); // this.db

      console.log("seen exhibitions", seen_exhibitions.length);

      await Promise.allSettled(
        events.map(async (event) => {
          // filter events instead of this
          const {should_skip, reason} = await this.blockEvent(
            event,
            seen_exhibitions
          );

          if (should_skip) {
            return;
          }

          console.log("visiting event details page", event.event_page_url);

          await this.visitWebsite(event.event_page_url);

          const markdown = await this.getInnerText(event.event_page_url);

          if (!markdown) {
            await this.closePage(
              event.event_page_url,
              "No markdown found for event details page"
            );
            return;
          }

          console.log(`${event.name} markdown:`, markdown);

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
            start_date: this.convertDate(
              details.start_and_end_date?.start_date ?? event.start_date ?? null
            ),
            end_date: this.convertDate(
              details.start_and_end_date?.end_date ?? event.end_date ?? null
            ),
            private_view_start_date: this.convertDate(
              details.private_view?.private_view_start_date ??
                event.private_view_start_date ??
                null
            ),
            private_view_end_date: this.convertDate(
              details.private_view?.private_view_end_date ??
                event.private_view_end_date ??
                null
            ),
            gallery_id,
          };

          // TODO: These two blocking statements might not need to exist if the prompt for getting the events is better. e.g. saying the page is unstructured??

          if (this.hasEventEnded(payload?.end_date ?? null)) {
            await this.closePage(
              event.event_page_url,
              `Blocking: event has ended ${event.name} ${payload.end_date}`
            );
            return;
          }

          if (!details.exhibition_name) {
            await this.closePage(
              event.event_page_url,
              `Blocking: no exhibition name found ${event.name}`
            );
            return;
          }

          await db.insert_exhibition(payload);
          await this.insert_seen_exhibition(event.name, gallery_id);
          await this.closePage(event.event_page_url, "Done");
        })
      );

      return events;
    } catch (error) {
      console.log("error scraping url:", error);
      console.error("Error processing main page:", error);
    } finally {
      console.timeEnd("scraping time");
      await this.closePage(page_key, "Done");
      await this.browser.close();
    }
  }
}
