import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { DatabaseService } from "./services/database";
import { EventScraper } from "./services/event-scraper";
import { PrivateViewScraper } from "./services/private-view-scraper";
import { ReviewScraper } from "./services/reviews-scraper";

const app = new Hono().basePath("/api");

app.get("/event-scraper", async (context) => {
	const db = new DatabaseService();
	const galleries = await db.get_galleries();
	console.log("galleries", galleries.length);
	const scraper = new EventScraper();

	const from = galleries.slice(115);

	const white_cube_gallery_id = 185;
	const workplace_gallery_id = 125;

	const single = galleries.filter(
		(gallery) => gallery.id === white_cube_gallery_id,
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
