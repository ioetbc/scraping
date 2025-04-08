import { Browser, launch, Page } from "puppeteer";
import { GALLERY_URL } from "../const.js";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

// TODO export object from main schema file to avoid multiple imports from different places same for the prompts
import {
  event_details_schema,
  feedback_schema,
} from "../zod/event-details-schema.js";
import { event_map_schema } from "../zod/event-map-schema.js";
import { event_image_schema } from "../zod/event-image-schema.js";

import { provide_feedback_prompt } from "../prompts/provide-feedback-prompt.js";
import { find_events_prompt } from "../prompts/find-events-prompt.js";
import { extract_event_details_prompt } from "../prompts/extract-event-details-prompt.js";

import { DatabaseService } from "./database.js";
import { z } from "zod";

import { encoding_for_model } from "tiktoken";
import { isAfter } from "date-fns";
import { userInfo } from "os";

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

  async findEvents(
    text: string | undefined,
    hrefs: string[],
  ): Promise<Event[]> {
    if (!text) {
      console.log("no text passed to findEvents");
      return [];
    }

    const { system_prompt, user_prompt } = find_events_prompt({
      text: this.truncatePrompt(text),
      hrefs,
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

  extractDetails = async (page_text: string) => {
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

  provide_feedback_on_record = async (
    record: z.infer<typeof event_details_schema>,
    source_of_truth: string | undefined,
  ) => {
    if (!source_of_truth) {
      console.log("no text passed to provide_feedback_on_record");
      return undefined;
    }

    console.log("calling provide_feedback_on_record with record:", !!record);
    console.log(
      "calling provide_feedback_on_record with text:",
      !!source_of_truth,
    );

    const { system_prompt, user_prompt } = provide_feedback_prompt({
      record,
      source_of_truth,
    });

    try {
      const data = await generateObject({
        model: openai("gpt-4"),
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
    console.log("original record hmmmm", original_record);
    try {
      const data = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: event_details_schema,
        system: `
        You are a data accuracy assistant. Your task is to update an existing JSON record "Original record" by applying any actionable feedback received (“Feedback”), cross-referencing the “Source of truth” for the correct values.

        You have three inputs:

        Feedback – A JSON object where each property matches a field in the schema. If the property’s value in the feedback is:
        null: There is no discrepancy or no change needed for that property, so do not alter that property in the “Original record”
        A short feedback string: Indicates something is incorrect or missing. Use the “Source of truth” to supply or fix the property.

        Source of truth – A text block containing the most accurate information about the record. If the "Feedback" indicates a property is wrong or missing, rely on this text block to correct that property.

        Original record – The initial JSON record you must update.

        Instructions:

        Only modify properties that have actionable feedback in the "Feedback".

        If a property’s value in the "Feedback" is null, do not change that property from its value in the "Original record".

        Use the "Source of truth" to find the correct replacement values for properties marked with feedback.

        If the "Source of truth" does not contain enough information to fix the property, return null for that property.`,
        prompt: `
        "Feedback": ${JSON.stringify(feedback)},
        "Source of truth": ${source_of_truth},
        "Original record": ${JSON.stringify(original_record)}`,
      });

      return data.object;
    } catch (error) {
      console.log("Error extracting data:", error);
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

    return !isAfter(eventEndDate, now);
  };

  async handler(url: string, gallery_id: string) {
    console.log("launching browser");
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
    console.log("events", events);
    // TODO create a custom assert method close connection, break and log error
    if (!events.length) {
      this.closePage(page_key, `No events found for ${url}`);
      return;
    }

    const db = new DatabaseService();
    const seen_exhibitions = await db.get_seen_exhibitions();

    console.log("seen exhibitions", seen_exhibitions.length);

    await Promise.all(
      events.map(async (event) => {
        const { should_skip, reason } = await this.blockEvent(
          event,
          seen_exhibitions,
        );

        if (should_skip) {
          console.log("skipping event:", event.name, "reason:", reason);
          return;
        }

        const page_key = event.url;

        await this.visitWebsite(event.url);

        const source_of_truth = await this.getInnerText(page_key);

        if (!source_of_truth) {
          await this.closePage(
            page_key,
            `no source of truth found ${event.url}`,
          );
          return;
        }

        let details = await this.extractDetails(source_of_truth);

        if (!details) {
          await this.closePage(page_key, `no details found ${event.url}`);
          return;
        }

        // details.exhibition_name = event.name;

        // if (this.hasEventEnded(details.end_date)) {
        //   await this.closePage(
        //     page_key,
        //     `event already ended. name: ${event.name} / url: ${event.url}`,
        //   );
        //   return;
        // }

        const feedback = await this.provide_feedback_on_record(
          details,
          source_of_truth,
        );

        if (feedback?.has_feedback) {
          console.log("do something with the feedback m8y");
          console.log("original details", details);
          console.log("feedback", feedback);

          details = await this.action_feedback({
            feedback,
            original_record: details,
            source_of_truth,
          });
        }

        // TODO: These two blocking statements might not need to exist if the prompt for getting the events is better. e.g. saying the page is unstructured??

        if (this.hasEventEnded(details.end_date)) {
          this.closePage(
            page_key,
            `event already ended. name: ${event.name} / url: ${event.url}`,
          );
          return;
        }

        if (!details.exhibition_name) {
          this.closePage(
            page_key,
            `no exhibition name found. name: ${event.name} / url: ${event.url}`,
          );
          return;
        }

        const images = await this.extractImages(page_key, event.name);
        details.image_urls = images;

        await this.insertDbRecord(details, event.url, gallery_id);
        await this.insert_seen_exhibition(event.name, gallery_id);

        await this.closePage(page_key, `inserted record, done`);
      }),
    );

    await this.closePage(page_key, `scraping done`);

    this.browser?.close();
    console.timeEnd("scraping time");

    return events;
  }
}
