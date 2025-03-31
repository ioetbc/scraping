import {Browser, launch, Page} from "puppeteer";
import {GALLERY_URL} from "../const.js";
import {generateObject} from "ai";
import {openai} from "@ai-sdk/openai";
import {DatabaseService} from "./database.js";
import {z} from "zod";

export class PrivateViewScraper {
  page: Page | null;
  browser: Browser | null;

  constructor() {
    this.page = null;
    this.browser = null;
  }

  launchBrowser = async () => {
    this.browser = await launch({
      headless: true,
      args: ["--no-sandbox", "--disable-gpu"],
    });
  };

  async visitWebsite(url: string) {
    try {
      await this.page?.goto(url, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });
    } catch (error) {
      console.log("error visiting", url);
      return;
    }
  }

  async getHTML() {
    const html = await this.page?.evaluate(() => document.body.innerText);
    return html?.trim();
  }

  async extractPrivateView(text: string) {
    const result = await generateObject({
      model: openai("gpt-4o"),
      system:
        "You are a diligent researcher tasked with collecting private view dates about an art exhibition in London." +
        "Please convert string dates to date objects using the Date constructor",
      prompt: text,
      schema: z.object({
        private_view_start_date: z.string(),
        private_view_end_date: z.string(),
      }),
    });

    if (!result) {
      console.log("llm unable to parse", GALLERY_URL);
      return undefined;
    }

    return result.object;
  }

  async handler() {
    const db = new DatabaseService();
    const event_urls = await db.get_events_opening_soon();

    console.log("event_urls", event_urls);

    await this.launchBrowser();

    if (!this.browser) {
      console.log("no browser found");
      return;
    }

    this.page = await this.browser.newPage();

    for (const event_url of event_urls) {
      await this.visitWebsite(event_url);
      const html = await this.getHTML();

      if (!html) {
        console.log("no text found on page", event_url);
        continue;
      }

      const private_view = await this.extractPrivateView(html);

      if (!private_view) {
        console.log("no private view found", event_url);
        continue;
      }

      console.log("private_view hahahah", private_view);

      return private_view;
    }
  }
}
