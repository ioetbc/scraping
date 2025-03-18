import {ObserveResult, Page} from "@browserbasehq/stagehand";
import dotenv from "dotenv";
import {z} from "zod";

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
        z.object({
          price: z.number().describe("The price of the ticket").nullable(),
          ticket_url: z
            .string()
            .describe("A url to purchase the ticket")
            .default("webpage url"),
        })
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
  return await page.evaluate(() => {
    const imageElements = document.querySelectorAll("img") ?? [];
    return Array.from(imageElements).map((element) => element.src);
  });
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
    console.log("imageUrls", imageUrls);
    extracted.image_urls = imageUrls;
    extracted.selector = observation.description;

    return extracted;
  } catch (error) {
    console.log("Error extracting data:", error);
  }
};

const navigateToEvent = async (page: Page, observation: ObserveResult) => {
  return await page.act(observation);
};

// "https://ab-anbar.com/exhibitions/";
// "https://www.standpointlondon.co.uk/";
// "https://www.standpointlondon.co.uk/events/";
// "https://www.studiochapple.com/blank";
// "https://www.bombfactory.org.uk/news";
// "https://www.thehorsehospital.com/whats-on"
// "https://www.ica.art/exhibitions";

const url = "https://www.standpointlondon.co.uk/events/";

export async function main({page}: {page: Page}) {
  await page.goto(url);
  const final = [];

  const observations = await page.observe({
    instruction:
      "Find all the upcoming events on the page. The current year is 2025. DO NOT include events from previous years. e.g. 2024.",
  });

  console.log("observations", observations);

  for (const observation of observations) {
    console.log("observation", observation);

    await navigateToEvent(page, observation);
    const extracted = await extractEventData(page, observation);
    console.log("extracted", extracted);

    if (extracted?.end_date && new Date(extracted.end_date) > new Date()) {
      final.push(extracted);
    }

    await page.goto(url);
  }

  console.log("final", JSON.stringify(final, null, 2));
}
