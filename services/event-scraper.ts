import { Browser, launch, Page } from "puppeteer";
import { GALLERY_URL } from "../const.js";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { format, isAfter } from "date-fns";

// TODO export object from main schema file to avoid multiple imports from different places same for the prompts
import {
  event_details_schema,
  feedback_schema,
  private_view_schema,
} from "../zod/event-details-schema.js";
import { event_map_schema } from "../zod/event-map-schema.js";
import { event_image_schema } from "../zod/event-image-schema.js";

import { provide_feedback_prompt } from "../prompts/provide-feedback-prompt.js";
import { find_events_prompt } from "../prompts/find-events-prompt.js";
import { extract_event_details_prompt } from "../prompts/extract-event-details-prompt.js";

import { DatabaseService } from "./database.js";
import { z } from "zod";

import { encoding_for_model } from "tiktoken";

type Event = z.infer<typeof event_map_schema.shape.events>[number];

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
        `no page found whilst getting inner text ${key}`,
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
      Array.from(document.querySelectorAll("a")).map((a) => a.href),
    );

    return hrefs ?? [];
  }

  truncatePrompt = (text: string) => {
    const encoding = encoding_for_model("gpt-4"); // TODO pass the model in
    const tokens = encoding.encode(text);
    const MAX_PROMPT_TOKENS = 3000; // TODO This needs to be the max tokens from the model

    let truncatedPrompt: string | Uint8Array = text; // TODO this needs to be string not Uint8Array

    if (tokens.length > MAX_PROMPT_TOKENS) {
      const truncatedTokens = tokens.slice(0, MAX_PROMPT_TOKENS);
      truncatedPrompt = encoding.decode(truncatedTokens);
    }

    encoding.free();
    return truncatedPrompt;
  };

  async find_events(
    text: string | undefined,
    hrefs: string[],
  ): Promise<Event[]> {
    if (!text) {
      console.log("no text passed to findEvents");
      return [];
    }

    const { system_prompt, user_prompt } = find_events_prompt({
      source_of_truth: this.truncatePrompt(text),
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

  extract_details = async (page_text: string) => {
    const { system_prompt, user_prompt } = extract_event_details_prompt({
      page_text,
    });

    try {
      const data = await generateObject({
        model: openai("gpt-4o-mini"),
        system: system_prompt,
        prompt: user_prompt,
        schema: event_details_schema,
      });

      return data.object;
    } catch (error) {
      console.log("Error extracting data:", error);
    }
  };

  extract_private_view = async (page_text: string) => {
    try {
      const data = await generateObject({
        model: openai("gpt-4o-mini"),
        system: `
        You are a diligent lead researcher tasked with collecting information about private viewings from a single input:

        Source of Truth: A block of text from a webpage that accurately describes the event.

        Your Objective:

        Identify a Private Viewing: Check if the source text indicates a private viewing.

        A private viewing can be labeled with terms such as:

        "Private View" "PV" "Opening Night" "Opening Reception" "Opening Party" "First View" "First Viewing" "Launch Night" "Launch Party" "Launch Event" "Drinks Reception" "Reception" "Preview" or any similar phrase.

        Extract Dates: If a private viewing exists, extract two pieces of information:

        private_view_start_date (in ISO 8601 format with time)
        private_view_end_date (in ISO 8601 format with time)

        Do not use any general event start_date or end_date as the private viewing times. Only rely on what is explicitly stated for the private view.

        Example:
        If the Source of Truth says:

        "Opening reception:
        10 April 18:00 - 20:00"

        You should respond with:
        private_view_start_date: "2023-04-10T18:00:00.000Z"
        private_view_end_date:   "2023-04-10T20:00:00.000Z"

        Important:

        1. If a private view is identified, return the private_view_start_date and private_view_end_date in ISO 8601 format with time.
        2. If you find no private view, do not fabricate any dates. Return null.
        3. Use ISO 8601 for all returned dates and times.
        4. No Fabrication: Only use date/time details found in the Source of Truth.
        5. Ignore Example Values: Any dates/times shown in these instructions are for demonstration only. Do not reference them directly in your answer.
        `,
        prompt: `Source of Truth: ${page_text}`,
        schema: private_view_schema,
      });

      return data.object;
    } catch (error) {
      console.log("Error extracting data:", error);
    }
  };

  extractImages = async (
    key: string,
    event_name: string,
  ): Promise<string[]> => {
    const page = this.getPage(key);

    if (!page) {
      this.closePage(key, "No key for page provided to extract image method");
      return [];
    }

    const imageElements = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img")).map(
        (element) => element.src,
      ),
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

  provide_feedback = async (
    record: z.infer<typeof event_details_schema>,
    source_of_truth: string | undefined,
  ) => {
    if (!source_of_truth) {
      console.log("no text passed to provide_feedback");
      return undefined;
    }

    console.log("calling provide_feedback with record:", !!record);
    console.log("calling provide_feedback with text:", !!source_of_truth);

    const { system_prompt, user_prompt } = provide_feedback_prompt({
      record,
      source_of_truth,
    });

    try {
      const data = await generateObject({
        model: openai("gpt-4o"),
        schema: feedback_schema,
        system: system_prompt,
        prompt: user_prompt,
      });

      return {
        ...data.object,
        has_feedback: Object.values(data.object).some(
          (predicate) => predicate !== null,
        ),
      };
    } catch (error) {
      console.log("Error extracting data:", error);
      throw error;
    }
  };

  action_feedback = async ({
    feedback,
    original_record,
    source_of_truth,
  }: {
    feedback: z.infer<typeof feedback_schema>;
    original_record: z.infer<typeof event_details_schema>;
    source_of_truth: string;
  }) => {
    console.log("actioning feedback");
    try {
      const data = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: event_details_schema,
        system: `
        You are a data accuracy assistant. Your task is to update an existing JSON record "Original record" by applying any actionable feedback received (“Feedback”), cross-referencing the “Source of truth” for the correct values.

        You have three inputs:

        Feedback:
        A JSON object where each property matches a field in the schema.

        A short feedback string: Indicates something is incorrect or missing. Use the "Source of truth" to supply a fix for the property.

        If a property does not exist in the feedback object there is no change needed, do not alter the property in the "Original record"

        Source of truth:
        A text block containing the most accurate information about the record. If the "Feedback" indicates a discrepancy, rely on this text block to correct the property.

        Original record:
        The initial JSON record you must update.

        Instructions:

        Only modify properties that have actionable feedback in the "Feedback" object.

        If a property does not exist in the "Feedback" object, do not change the property from its value in the "Original record".

        Use the "Source of truth" to find the correct replacement values for properties marked with feedback.

        If the "Source of truth" does not contain enough information to fix the property, return null for the property.`,
        prompt: `
        "Feedback": ${JSON.stringify(feedback)},
        "Source of truth": ${source_of_truth},
        "Original record": ${JSON.stringify(original_record)}`,
      });

      return data.object;
    } catch (error) {
      console.log("Error actioning feedback:", error);
      throw error;
    }
  };

  convertDate = (date: string | null) => {
    if (!date) return null;

    const converted = new Date(date);
    return isNaN(converted.getTime()) ? null : converted;
  };

  insertDbRecord = async (
    record: z.infer<typeof event_details_schema>,
    url: string,
    gallery_id: string,
  ) => {
    const db = new DatabaseService();

    await db.insert_exhibition({
      exhibition_name: record.exhibition_name,
      info: record.info,
      featured_artists: JSON.stringify(record.featured_artists),
      exhibition_page_url: url,
      image_urls: JSON.stringify(record.image_urls),
      // schedule: JSON.stringify(record.schedule),
      is_ticketed: !!record.is_ticketed,
      start_date: this.convertDate(record?.start_date),
      end_date: this.convertDate(record?.end_date),
      private_view_start_date: this.convertDate(
        record.private_view_start_date ?? null,
      ),
      private_view_end_date: this.convertDate(
        record.private_view_end_date ?? null,
      ),
      gallery_id,
    });
  };

  insert_seen_exhibition = async (
    exhibition_name: string,
    gallery_id: string,
  ) => {
    const db = new DatabaseService();
    await db.insert_seen_exhibition(exhibition_name, gallery_id);
  };

  getPage = (key: string) => {
    return this.pages.get(key);
  };

  blockEvent = async (
    event: Event,
    seen_exhibitions: string[],
  ): Promise<{ should_skip: boolean; reason?: string }> => {
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

    console.log("eventEndDate", eventEndDate);
    console.log("now", now);

    return !isAfter(eventEndDate, now);
  };

  async handler(url: string, gallery_id: string) {
    console.log("launching browser");
    await this.launchBrowser();
    console.time("scraping time");
    console.log("scraping url", url);

    console.log("current_date", this.current_date);

    if (!this.browser) {
      console.log("no browser found");
      return;
    }

    const response = await fetch(`https://r.jina.ai/${url}`);
    const markdown = await response.text();
    // console.log("markdown events", markdown);
    const hrefs = await this.getHrefs(url);
    const events = await this.find_events(markdown, hrefs);
    console.log("events.length", events.length);
    console.log("events", events);

    if (events.length === 0) {
      console.log("no events found for:", url);
      return;
    }

    const db = new DatabaseService();
    const seen_exhibitions = await db.get_seen_exhibitions(); // this.db

    console.log("seen exhibitions", seen_exhibitions.length);

    await Promise.all(
      events.map(async (event) => {
        // filter events instead of this
        const { should_skip, reason } = await this.blockEvent(
          event,
          seen_exhibitions,
        );

        if (should_skip) {
          console.log("skipping event:", event.name, "reason:", reason);
          return;
        }

        console.log("visiting event details page", event.url);

        const response = await fetch(`https://r.jina.ai/${event.url}`);
        const markdown = await response.text();

        console.log("markdown", markdown);

        const details = await this.extract_details(markdown);

        if (!details) {
          await this.closePage(event.url, `no details found ${event.url}`);
          return;
        }

        // TODO: These two blocking statements might not need to exist if the prompt for getting the events is better. e.g. saying the page is unstructured??

        if (this.hasEventEnded(details.end_date)) {
          return;
        }

        if (!details.exhibition_name) {
          return;
        }

        // const images = await this.extractImages(event.url, event.name);
        // details.image_urls = images;

        await this.insertDbRecord(details, event.url, gallery_id);
        await this.insert_seen_exhibition(event.name, gallery_id);
      }),
    );

    console.timeEnd("scraping time");

    return events;
  }
}
