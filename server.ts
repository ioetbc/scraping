import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { DatabaseService } from "./services/database";
import { EventScraper } from "./services/event-scraper";
import { PrivateViewScraper } from "./services/private-view-scraper";
import { ReviewScraper } from "./services/reviews-scraper";

const app = new Hono().basePath("/api");

app.get("/event-scraper", async (context) => {
	const db = new DatabaseService();
	const scraper = new EventScraper();

	const galleries = await db.get_galleries();
	console.log("galleries", galleries.length);

	const from = galleries.slice(115);

	const white_cube_gallery_id = 185;
	const workplace_gallery_id = 125;
	const the_artist_room_gallery_id = 29;
	const anna_kultys_gallery_id = 19;

	const single = galleries.filter(
		(gallery) => gallery.id === anna_kultys_gallery_id,
	);

	const done = [];

	for (const gallery of galleries) {
		if (gallery.name === "Cardi Gallery") continue;

		await scraper.handler(
			gallery.exhibition_page_url,
			gallery.id,
			gallery.name,
		);

		done.push(gallery.id);
		console.log(`done ${done.length} / ${galleries.length}`);
	}

	// return context.text("Done");
});

app.get("/write-mocks", async (context) => {
	const db = new DatabaseService();
	const scraper = new EventScraper();

	const galleries = await db.get_galleries();
	const anna_kultys_gallery_id = 19;

	const single = galleries.filter(
		(gallery) => gallery.id === anna_kultys_gallery_id,
	)[0];

	await scraper.launch_browser();

	if (!scraper.browser) {
		console.log("no browser found");
		return;
	}

	const url = single.exhibition_page_url;

	await scraper.visit_website(url);

	const all_events_page_text = scraper.pages.get(url)?.cheerio.page_text;
	const hrefs = await scraper.get_hrefs(url);
	const events = await scraper.find_events(all_events_page_text, hrefs);

	console.log("events", events);

	if (events.length === 0) {
		console.log("no events found for:", url);
		await scraper.close_page(url, "No events found");
		return;
	}

	scraper.write_mocks({
		event_name: single.name,
		markdown: all_events_page_text,
		folder: "find-events",
		page_key: url,
	});

	return context.text("Done");
});

app.get("/reviews-scraper", async (context) => {
	const scraper = new ReviewScraper();
	await scraper.handler();
	return context.text("Done");
});

app.get("/private-view-scraper", async (context) => {
	const scraper = new PrivateViewScraper();
	await scraper.handler();
	return context.text("Done");
});

serve(
	{
		fetch: app.fetch,
		port: 8080,
	},
	({ port }) => {
		console.log(`Server is running on http://localhost:${port}`);
	},
);
