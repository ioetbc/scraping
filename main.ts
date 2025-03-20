import {generateObject} from "ai";
import {ObserveResult, Page} from "@browserbasehq/stagehand";
import dotenv from "dotenv";
import {z} from "zod";
import {openai} from "@ai-sdk/openai";
import {launch} from "puppeteer";

dotenv.config();

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
          .describe("The start time of the event")
          .nullable(),
        end_time: z.string().describe("The end time of the event").nullable(),
        description: z
          .string()
          .describe("The description of the event")
          .nullable(),
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
              .default("webpage url"),
          })
          .nullable()
      ),
    })
    .nullable(),
  image_urls: z
    .array(z.string())
    .describe("The url of the image of the event")
    .nullable(),
  selector: z.string().describe("The selector of the event").nullable(),
});

const extractImageUrls = async (page: Page) => {
  const images = await page.evaluate(() => {
    const imageElements = document.querySelectorAll("img") ?? [];
    return Array.from(imageElements).map((element) => element.src);
  });

  // return images.filter((image) => image.endsWith(".svg"));
  return images;
};

const extractEventData = async (page: Page, observation: ObserveResult) => {
  try {
    const extracted = await page.extract({
      useTextExtract: true,
      instruction:
        "You are a diligent researcher tasked with collecting information about art exhibitions in London." +
        "Your task is to extract specific details about exhibitions" +
        "Please convert string dates to date objects using the Date constructor" +
        "The page_url will be the current url of the page you are on" +
        "So that your document is informative and complete, please extract ALL the text on the page" +
        "The schedule MUST NOT include information for other events!" +
        "Ensure you capture the event image URL. Look for images within the event section, especially ones inside <img> tags. " +
        "Ensure the extracted image URL ends in .jpg, .jpeg, .png, .webp, etc.",
      schema,
    });

    const imageUrls = await extractImageUrls(page);
    extracted.image_urls = imageUrls;
    extracted.selector = observation.description;

    return extracted;
  } catch (error) {
    console.log("Error extracting data:", error);
  }
};

const navigateToEvent = async (page: Page, observation: ObserveResult) => {
  try {
    return await page.act(observation);
  } catch (error) {
    console.log("Error navigating to event:", error);
  }
};

// https://ab-anbar.com/exhibitions/
// https://www.standpointlondon.co.uk/
// https://www.standpointlondon.co.uk/events/
// https://www.studiochapple.com/blank
// https://www.bombfactory.org.uk/news // i think the context is too large
// https://www.thehorsehospital.com/whats-on
// https://www.ica.art/exhibitions
// https://www.barbican.org.uk/whats-on/art-design
// https://gasworks.org.uk/exhibitions/
// https://grimmgallery.com/exhibitions/
// https://gazelliarthouse.com/exhibitions/location/london/
// https://www.grosvenorgallery.com/exhibitions/
// https://gagosian.com/exhibitions/upcoming/
// https://heraldst.com
// https://huxleyparlour.com/exhibitions/
// https://hyphastudios.com/events/
// https://www.joshlilley.com/exhibitions
// https://www.modernart.net/exhibitions/future
// https://www.nightcafe.gallery/exhibition
// https://noshowspace.com/show
// https://www.ohshprojects.com
// https://www.pilarcorrias.com/exhibitions/
// https://public.gallery/exhibitions
// https://www.saatchigallery.com/whats-on/upcoming

const url = "https://www.saatchigallery.com/whats-on/upcoming";

export async function main({page}: {page: Page}) {
  // await page.goto(url);
  const final: any[] = [];

  // const observations = await page.observe({
  //   instruction:
  //     "Find all the upcoming events on the page. The current year is 2025. DO NOT include events from previous years. e.g. 2024.",
  // });

  const browser = await launch({
    headless: false,
    args: ["--no-sandbox", "--disable-gpu"],
  });

  const ppage = await browser.newPage();

  try {
    await ppage.goto(url, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
  } catch (error) {
    console.log("error visiting", url);
    return;
  }

  // await new Promise((resolve) => setTimeout(resolve, 10000));

  const text = await ppage.evaluate(() => document.body.textContent);

  if (!text) return;

  const html = text.replaceAll(/\s/g, "");
  const urls = await ppage.evaluate(() => {
    return Array.from(document.querySelectorAll("a")).map((a) => a.href);
  });

  console.log("html what", html);
  console.log("urls", urls);

  const result = await generateObject({
    model: openai("gpt-4o"),
    system:
      "Find all the upcoming events on the page. The current year is 2025. DO NOT include events from previous years. e.g. 2024.",
    prompt: `${html}\n\nHere is a list of urls ${JSON.stringify(urls)}`,
    schema: z.object({
      events: z.array(
        z.object({
          name: z.string().describe("the name of the event"),
          url: z.string().url().describe("the url of the event"),
          // selector: z.string().describe("the xpath selector of the event"),
        })
      ),
    }),
  });

  console.log("result", JSON.stringify(result.object, null, 4));

  // const result2 = await generateObject({
  //   model: openai("gpt-4o"),
  //   system: `Here is a list of urls ${JSON.stringify(
  //     result.object.events.map((event) => event.url)
  //   )}. Some of these urls do not exist in the following text. Please update the urls to the correct ones.`,
  //   prompt: text.replaceAll(/\s/g, ""),
  //   schema: z.object({
  //     events: z.array(
  //       z.object({
  //         name: z.string().describe("the name of the event"),
  //         url: z.string().url().describe("the url of the event"),
  //         // selector: z.string().describe("the xpath selector of the event"),
  //       })
  //     ),
  //   }),
  // });

  // console.log("result2", JSON.stringify(result2.object, null, 4));

  // console.log("observations.length", observations.length);
  // console.log("observations", observations);

  // const troublesomeEvent = observations.find(
  //   (observation) =>
  //     observation.description ===
  //     "Noah Davis: Relaxed View from Sat 22 Feb to Mon 21 Apr 2025"
  // );

  // console.log("troublesomeEvent", troublesomeEvent);

  // if (!troublesomeEvent) return;

  // await navigateToEvent(page, troublesomeEvent);
  // const extracted = await extractEventData(page, troublesomeEvent);
  // console.log("extracted", extracted);

  // await page.goto(url);
  // await page.waitForLoadState("networkidle");
  // final.push(extracted);

  // for (const observation of observations) {
  //   if (
  //     observation.selector ===
  //     "Noah Davis: Relaxed View from Sat 22 Feb to Mon 21 Apr 2025"
  //   ) {
  //     console.log("navigating init");
  //     await navigateToEvent(page, observation);
  //     const extracted = await extractEventData(page, observation);
  //     console.log("extracted", extracted);
  //     await page.goto(url);
  //     await page.waitForLoadState("networkidle");
  //     final.push(extracted);
  //     console.log(
  //       "number of events",
  //       `${final.length} / ${observations.length}`
  //     );
  //   }
  // }

  console.log("done", JSON.stringify(final, null, 4));

  // const results = await Promise.allSettled(promises);

  // console.log("results", results);

  // return results;

  // const results = await Promise.allSettled(promises);

  // console.log("results", results);

  // results.forEach((result) => {
  //   if (result.status === "fulfilled") {
  //     console.log("result fulfilled value", result.value);
  //   }
  // });

  // for (const observation of observations) {
  //   console.log("observation", observation);

  //   await navigateToEvent(page, observation);
  //   const extracted = await extractEventData(page, observation);
  //   console.log("extracted", extracted);

  //   // if (extracted?.end_date && new Date(extracted.end_date) > new Date()) {
  //   final.push(extracted);
  //   // }

  //   await page.goto(url);
  // }

  // console.log("final", JSON.stringify(final, null, 2));
}
