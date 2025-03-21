import {Browser, launch, Page} from "puppeteer";
import {GALLERY_URL} from "../const.js";
import {generateObject} from "ai";
import {openai} from "@ai-sdk/openai";
import {event_details_schema} from "../zod/event-details-schema.js";
import {event_map_schema} from "../zod/event-map-schema.js";
export class WebsiteScraper {
  page: Page | null;
  browser: Browser | null;

  constructor() {
    this.page = null;
    this.browser = null;
  }

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
    return html;
  }

  async getHrefs() {
    const hrefs = await this.page?.evaluate(() =>
      Array.from(document.querySelectorAll("a")).map((a) => a.href)
    );

    return hrefs ?? [];
  }

  formatHTML(html: string) {
    return html.trim();
  }

  async findEvents(text: string, hrefs: string[]) {
    const result = await generateObject({
      model: openai("gpt-4o"),
      system:
        "Find all the upcoming events on the page. The current year is 2025. DO NOT include events from previous years. e.g. 2024.",
      prompt: `${text}\n\nHere is a list of urls ${JSON.stringify(hrefs)}`,
      schema: event_map_schema,
    });

    if (!result) {
      console.log("llm unable to parse", GALLERY_URL);
      return undefined;
    }

    return result.object.events;
  }

  extractDetails = async (text: string) => {
    try {
      const data = await generateObject({
        model: openai("gpt-4o"),
        system:
          "You are a diligent researcher tasked with collecting information about art exhibitions in London." +
          "Your task is to extract specific details about exhibitions" +
          "Please convert string dates to date objects using the Date constructor" +
          "The page_url will be the current url of the page you are on" +
          "So that your document is informative and complete, please extract ALL the text on the page" +
          "The schedule MUST NOT include information for other events!" +
          "Ensure you capture the event image URL. Look for images within the event section, especially ones inside <img> tags. " +
          "Ensure the extracted image URL ends in .jpg, .jpeg, .png, .webp, etc.",
        prompt: text,
        schema: event_details_schema,
      });

      return data.object;
    } catch (error) {
      console.log("Error extracting data:", error);
    }
  };

  launchBrowser = async () => {
    this.browser = await launch({
      headless: true,
      args: ["--no-sandbox", "--disable-gpu"],
    });
  };

  getImages = async () => {
    const imageElements = await this.page?.evaluate(() =>
      Array.from(document.querySelectorAll("img")).map((element) => element.src)
    );
    return imageElements?.filter((image) => !image.endsWith(".svg")) ?? [];
  };

  async handler() {
    await this.launchBrowser();
    console.time("scraping");

    if (!this.browser) {
      console.log("no browser found");
      return;
    }

    this.page = await this.browser.newPage();

    await this.visitWebsite(GALLERY_URL);

    const html = await this.getHTML();

    console.log("html", html);

    if (!html) {
      console.log("no text found on page", GALLERY_URL);
      return;
    }

    const text = this.formatHTML(html);

    const hrefs = await this.getHrefs();
    const events = await this.findEvents(text, hrefs);

    console.log("events", events);

    if (!events) {
      console.log("no events found");
      return;
    }

    for (const event of events) {
      await this.visitWebsite(event.url);
      const html = await this.getHTML();

      if (!html) {
        console.log("no text found on page", event.url);
        continue;
      }

      const text = this.formatHTML(html);
      const details = await this.extractDetails(text);
      const images = await this.getImages();

      if (!details) {
        console.log("no details found", event.url);
        continue;
      }

      details.image_urls = images;

      console.log(
        `event details for ${event.name}`,
        JSON.stringify(details, null, 4)
      );
    }

    await this.page.close();

    this.browser.close();
    console.timeEnd("scraping");

    return events;
  }
}
