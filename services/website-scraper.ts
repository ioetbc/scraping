import {launch, Page} from "puppeteer";
import {GALLERY_URL} from "../const.js";
import {generateObject} from "ai";
import {openai} from "@ai-sdk/openai";
import {z} from "zod";

const schema = z.object({
  exhibition_name: z.string().describe("the name of the event").nullable(),
  start_date: z.string().describe("the start date of the event").nullable(),
  end_date: z.string().describe("the end date of the event").nullable(),
  private_view_start_date: z
    .string()
    .describe("the private view start date of the event")
    .nullable(),
  private_view_end_date: z
    .string()
    .describe("the private view end date of the event")
    .nullable(),
  featured_artists: z
    .array(z.string())
    .describe("the names of all the artists in the event")
    .nullable(),
  schedule: z.array(
    z
      .object({
        start_time: z
          .string()
          .describe("The scheduled start time of the event")
          .nullable(),
        end_time: z
          .string()
          .describe("The scheduled end time of the event")
          .nullable(),
        label: z.string().describe("The label of the schedule").nullable(),
      })
      .describe("Event timings excluding the private view")
      .nullable()
  ),
  info: z.string().describe("The information surrounding the event").nullable(),
  ticket: z
    .object({
      is_ticketed: z
        .boolean()
        .describe("Whether you need a ticket to attend this event")
        .nullable(),
      description: z
        .string()
        .describe("The description of the ticket")
        .nullable(),
      tickets: z.array(
        z
          .object({
            price: z.number().describe("The price of the ticket").nullable(),
            ticket_url: z
              .string()
              .describe("A url to purchase the ticket")
              .nullable(),
          })
          .nullable()
      ),
    })
    .nullable(),
  image_urls: z
    .array(z.string())
    .describe("The url of the image of the event")
    .nullable(),
});

export class WebsiteScraper {
  page: Page | null;

  constructor() {
    this.page = null;
  }

  async visitWebsite(url: string) {
    if (!this.page) {
      console.log("no page found");
      return;
    }

    try {
      await this.page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });
    } catch (error) {
      console.log("error visiting", url);
      return;
    }
  }

  async getHTML() {
    if (!this.page) {
      console.log("no page found");
      return;
    }
    const html = await this.page.evaluate(() => document.body.innerText);
    return html;
  }

  async getHrefs() {
    if (!this.page) {
      console.log("no page found");
      return [];
    }

    const hrefs = await this.page.evaluate(() =>
      Array.from(document.querySelectorAll("a")).map((a) => a.href)
    );

    return hrefs;
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
      schema: z.object({
        events: z.array(
          z.object({
            name: z.string().describe("the name of the event"),
            url: z.string().url().describe("the url of the event"),
          })
        ),
      }),
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
        schema,
      });

      return data.object;
    } catch (error) {
      console.log("Error extracting data:", error);
    }
  };

  getImages = async () => {
    if (!this.page) {
      console.log("no page found");
      return [];
    }
    const imageElements = await this.page.evaluate(() =>
      Array.from(document.querySelectorAll("img")).map((element) => element.src)
    );
    return imageElements.filter((image) => !image.endsWith(".svg"));
  };

  async handler() {
    const browser = await launch({
      headless: true,
      args: ["--no-sandbox", "--disable-gpu"],
    });

    console.time("scraping");

    this.page = await browser.newPage();

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

    browser.close();
    console.timeEnd("scraping");

    return events;
  }
}
