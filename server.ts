import {Hono} from "hono";
import {serve} from "@hono/node-server";
import {launch, Page} from "puppeteer";
import {WebsiteScraper} from "./services/website-scraper.js";

import "dotenv/config";
import {GALLERY_URL} from "./const.js";

const app = new Hono().basePath("/api");

const visitGallery = async (page: Page) => {
  await page.goto(GALLERY_URL, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
};

const collectEvents = async () => {
  const browser = await launch({
    headless: false,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
};

app.get("/scrape", async () => {
  const scraper = new WebsiteScraper();
  await scraper.handler();
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  ({port}) => {
    console.log(`Server is running on http://localhost:${port}`);
  }
);
