import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { EventScraper } from "./services/event-scraper.js";
import { ReviewScraper } from "./services/reviews-scraper.js";
import { PrivateViewScraper } from "./services/private-view-scraper.js";
import { DatabaseService } from "./services/database.js";

const app = new Hono().basePath("/api");

app.get("/event-scraper", async () => {
  const db = new DatabaseService();
  const galleries = await db.get_galleries();
  console.log("galleries", galleries.length);
  const scraper = new EventScraper();

  const from = galleries.slice(125);
  const single = galleries.filter((gallery) => gallery.id === 125);

  const done = [];

  for (const gallery of single) {
    if (gallery.name === "Cardi Gallery") continue;

    await scraper.handler(gallery.exhibition_page_url, gallery.id);

    done.push(gallery.id);
    console.log(`done ${done.length} / ${single.length}`);
  }
});

app.get("/reviews-scraper", async () => {
  const scraper = new ReviewScraper();
  await scraper.handler();
});

app.get("/private-view-scraper", async () => {
  const scraper = new PrivateViewScraper();
  await scraper.handler();
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  ({ port }) => {
    console.log(`Server is running on http://localhost:${port}`);
  },
);
