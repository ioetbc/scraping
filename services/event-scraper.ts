import {Browser, launch, Page} from "puppeteer";
import {GALLERY_URL} from "../const.js";
import {generateObject} from "ai";
import {openai} from "@ai-sdk/openai";
import {event_details_schema} from "../zod/event-details-schema.js";
import {event_map_schema} from "../zod/event-map-schema.js";
import {DatabaseService} from "./database.js";
import {z} from "zod";

import {encoding_for_model} from "tiktoken";
import {isAfter} from "date-fns";

type Event = z.infer<typeof event_map_schema.shape.events>[number];

export class EventScraper {
  pages: Map<string, Page>;
  browser: Browser | undefined;

  constructor() {
    this.pages = new Map();
    this.browser = undefined;
  }

  launchBrowser = async () => {
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
      console.log("error visiting", url);
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

    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a")).map((a) => a.href)
    );

    return hrefs ?? [];
  }

  truncatePrompt = (text: string) => {
    const encoding = encoding_for_model("gpt-4");
    // const maxTokens = get_encoding("gpt-4").length;
    const tokens = encoding.encode(text);
    const MAX_PROMPT_TOKENS = 3000;

    let truncatedPrompt: string | Uint8Array = text;

    // console.log("tokens", tokens.length);
    // console.log("max tokens", MAX_PROMPT_TOKENS);

    if (tokens.length > MAX_PROMPT_TOKENS) {
      const truncatedTokens = tokens.slice(0, MAX_PROMPT_TOKENS);
      truncatedPrompt = encoding.decode(truncatedTokens);
    }

    // console.log("truncated prompt", truncatedPrompt);

    encoding.free();
    return truncatedPrompt;
  };

  async findEvents(
    text: string | undefined,
    hrefs: string[]
  ): Promise<Event[]> {
    if (!text) {
      console.log("no text passed to findEvents");
      return [];
    }

    const truncateHtml = this.truncatePrompt(text);

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      system:
        "Find all the upcoming events on the page. The current year is 2025. DO NOT include events from previous years. e.g. 2024. The event must be Located in London, UK. DO NOT include events outside of London, UK. e.g. Seoul, Paris, New York etc.",
      prompt: `${truncateHtml}\n\nHere is a list of urls ${JSON.stringify(
        hrefs
      )}`,
      schema: event_map_schema,
    });

    if (!result) {
      console.log("llm unable to parse", GALLERY_URL);
      return [];
    }

    return result.object.events;
  }

  extractDetails = async (text: string | undefined) => {
    if (!text) {
      console.log("no text passed to extractDetails");
      return undefined;
    }

    try {
      const data = await generateObject({
        model: openai("gpt-4o-mini"),
        system:
          "You are a diligent researcher tasked with collecting information about art exhibitions in London." +
          "Your task is to extract specific details about exhibitions",
        prompt: text,
        schema: event_details_schema,
      });

      return data.object;
    } catch (error) {
      console.log("Error extracting data:", error);
    }
  };

  getImages = async (key: string) => {
    const page = this.getPage(key);

    const imageElements = await page?.evaluate(() =>
      Array.from(document.querySelectorAll("img")).map((element) => element.src)
    );

    const jpgs =
      imageElements?.filter((image) => !image.endsWith(".svg")) ?? [];

    const firstFive = jpgs.slice(0, 5);

    return firstFive;
  };

  convertDate = (date: string | null) => {
    if (!date) return null;

    const converted = new Date(date);
    return isNaN(converted.getTime()) ? null : converted;
  };

  checkWork = async (
    record: z.infer<typeof event_details_schema>,
    text: string | undefined
  ) => {
    if (!text) {
      console.log("no text passed to checkWork");
      return undefined;
    }

    try {
      const data = await generateObject({
        model: openai("gpt-4o-mini"),
        system: `
          You are a diligent lead researcher.
          You have received a "Submitted record" (the junior researcher's work) and a "Source of truth".
          Your job is to:
            1. Carefully compare each property of the submitted record with the source of truth.
            2. If a property is correct, do not change it.
            3. If a property is incorrect, update it using ONLY the source of truth.
            4. If the source of truth contradicts the submitted record, favor the source of truth.
            5. If the source of truth does not provide enough information to correct a given property, leave it as-is or remove it.
            6. Always output a JSON object that follows the "event_details_schema" exactly.

          Important:
            - DO NOT include line breaks in strings e.g. /n
            - Ignore the start date and end date formatting! if the date is technically the same then favour the submitted record. for example 2025-02-20 is the same as 20th February 2025 here you should favour the submitted record and not update the date.
            - It is preferable that you do not make any changes. Only make changes if the record is categorically incorrect.
        `,
        prompt: `
          Submitted record:
          #####${record}#####
          Source of truth:
          #####${text}#####
        `,
        schema: event_details_schema,
      });

      return data.object;
    } catch (error) {
      console.log("Error extracting data:", error);
    }
  };

  insertDbRecord = async (
    record: z.infer<typeof event_details_schema>,
    url: string,
    gallery_id: string
  ) => {
    const db = new DatabaseService();

    await db.insert_exhibition({
      exhibition_name: record.exhibition_name,
      info: record.info,
      featured_artists: JSON.stringify(record.featured_artists ?? []),
      exhibition_page_url: url,
      image_urls: JSON.stringify(record.image_urls ?? []),
      schedule: "",
      is_ticketed: record.ticket?.is_ticketed ?? false,
      ticket_description: "",
      // schedule: JSON.stringify(record.schedule ?? []),
      // is_ticketed: record.ticket?.is_ticketed ?? false,
      // ticket_description: record.ticket?.description ?? "",
      start_date: this.convertDate(record.start_date),
      end_date: this.convertDate(record.end_date),
      private_view_start_date: this.convertDate(
        record.private_view?.start_date ?? null
      ),
      private_view_end_date: this.convertDate(
        record.private_view?.end_date ?? null
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

    if (this.hasEventEnded(event.end_date)) {
      return {
        should_skip: true,
        reason: "Event already ended",
      };
    }

    if (event.name === "Private view") {
      return {
        should_skip: true,
        reason: "Private view",
      };
    }

    if (seen_exhibitions.includes(event.name)) {
      return {
        should_skip: true,
        reason: "Already seen",
      };
    }

    return {
      should_skip: false,
      reason: undefined,
    };
  };

  closePage = async (key: string, reason?: string) => {
    const page = this.getPage(key);
    if (page) {
      try {
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

  hasEventEnded = (endDate: string | null): boolean => {
    if (!endDate) {
      return false;
    }

    const now = new Date();
    const eventEndDate = this.convertDate(endDate);

    if (!eventEndDate) {
      return false;
    }

    return !isAfter(eventEndDate, now);
  };

  async handler(url: string, gallery_id: string) {
    await this.launchBrowser();
    console.time("scraping time");
    console.log("scraping url", url);

    if (!this.browser) {
      console.log("no browser found");
      return;
    }

    const page_key = url;

    await this.visitWebsite(url);

    const page_text = await this.getInnerText(page_key);
    const hrefs = await this.getHrefs(page_key);
    const events = await this.findEvents(page_text, hrefs);

    const db = new DatabaseService();
    const seen_exhibitions = await db.get_seen_exhibitions();

    console.log("seen exhibitions", seen_exhibitions.length);

    console.log("events", events);

    await Promise.all(
      events.map(async (event) => {
        const {should_skip, reason} = await this.blockEvent(
          event,
          seen_exhibitions
        );

        if (should_skip) {
          console.log("skipping event:", event.name, "reason:", reason);
          return;
        }

        const page_key = event.url;

        await this.visitWebsite(event.url);

        const page_text = await this.getInnerText(page_key);
        const details = await this.extractDetails(page_text);

        if (!details) {
          await this.closePage(page_key, `no details found ${event.url}`);
          return;
        }

        details.exhibition_name = event.name;

        const checked = await this.checkWork(details, page_text);
        const images = await this.getImages(page_key);

        if (!checked) {
          await this.closePage(page_key, `no checked work ${event.url}`);
          return;
        }

        if (this.hasEventEnded(checked.end_date)) {
          await this.closePage(
            page_key,
            `event already ended. name: ${event.name} / url: ${event.url}`
          );
          return;
        }

        checked.image_urls = images;

        console.log(`checked work`, checked);

        await this.insertDbRecord(checked, event.url, gallery_id);
        await this.insert_seen_exhibition(event.name, gallery_id);

        await this.closePage(page_key, `inserted record, done`);
      })
    );

    await this.closePage(page_key, `scraping done`);

    this.browser?.close();
    console.timeEnd("scraping time");

    return events;
  }
}
