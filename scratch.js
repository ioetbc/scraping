import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const record = {
  exhibition_name: "In the long silenc",
  start_date: "2025-02-13",
  end_date: "2025-03-03",
  private_view_start_date: "2025-03-03",
  private_view_end_date: null,
  featured_artists: ["Milly Williams"],
  info: "Workplace is pleased to present In the long silence by Welsh artist Dylan Williams. Drawing from a disparate range of sources, including film stills, memories, and transient scenes observed in everyday life, Williams new works are a reconciliation of intimate, familiar moments that evoke feelings of anticipation, suspense, and psychological tension - revealing the sublime in the mundane.",
  image_urls: [],
  is_ticketed: false,
  schedule: [
    {
      start_time: "2025-02-13T00:00:00.000Z",
      end_time: "2025-03-03T00:00:00.000Z",
      label: "Exhibition open",
    },
  ],
};

const checked_work_schena = z.object({
  exhibition_name: z.string().default(null).nullable(),
  start_date: z.date().or(z.string()).default(null).nullable(),
  end_date: z.date().or(z.string()).default(null).nullable(),
  private_view_start_date: z.date().or(z.string()).default(null).nullable(),
  private_view_end_date: z.date().or(z.string()).default(null).nullable(),
  featured_artists: z.array(z.string()).default(null).or(z.string()).nullable(),
  info: z.string().default(null).nullable(),
  is_ticketed: z.boolean().or(z.string()).default(null).nullable(),
  schedule: z
    .array(
      z
        .object({
          start_time: z.string().default(null).nullable(),
          end_time: z.string().default(null).nullable(),
          label: z.string().default(null).nullable(),
        })
        .default(null)
        .nullable(),
    )
    .or(z.string())
    .default([])
    .nullable(),
});

const page_text = `Open sign in modal
Dylan Williams
In the long silence

13 February - 3 March 2025

12 Blandford Square, Newcastle upon Tyne

Dylan Williams
In the long silence
Venue
12 Blandford Square

Newcastle upon Tyne,

United Kingdom

Date
13 February – 3 March 2025

Workplace is pleased to present In the long silence by Welsh artist Dylan Williams.

Drawing from a disparate range of sources, including film stills, memories, and transient scenes observed in everyday life, Williams new works are a reconciliation of intimate, familiar moments that evoke feelings of anticipation, suspense, and psychological tension - revealing the sublime in the mundane.

Read more
Artworks
Dylan Williams
Loved, 2024
Oil on linen
25.4cm x 20.3cm
Enquire
Dylan Williams
The flower fadeth, 2024
Oil on linen
35cm x 20cm
Enquire
Dylan Williams
Setting leaves on fire, 2023
Oil on linen
26cm x 21cm
Enquire
Dylan Williams
Moonlight makes me transparent, 2023
Oil on canvas
30.5cm x 25.4cm
Enquire
Dylan Williams
Colder than darkness, 2023
Oil on canvas
27.9cm x 22.9cm
Enquire
Dylan Williams
Drowning in moonlight, 2023
Oil on linen
26cm x 21cm
Enquire
Dylan Williams
Night blindness, 2023
Oil on canvas
22.9cm x 15.2cm
Enquire
Related Artists
Dylan Williams
Stay connected with WORKPLACE:
Subscribe
Locations
London

50 Mortimer Street
Fitzrovia
London
W1W 7RP, UK


Contact: +44 (0)207 631 3497


Newcastle

12 Blandford Square
Newcastle
Tyne & Wear
NE1 4HZ, UK


Contact: +44 (0)191 535 8115


Copyright © 2025 WORKPLACEAll Rights Reserved

Your experience on workplace.art as well as your rights as a user matter to us. Cookies help us track general user behaviour, to enhance and simplify our user's journey. This website uses cookies to improve user experience. You can change your consent by visiting Cookie Settings here. For more information visit our Privacy Policy.

Deny
Manage
Accept`;

async function check_work(record, page_text) {
  try {
    const data = await generateObject({
      model: openai("gpt-4o"),
      schema: checked_work_schena,
      system: `
      You are a lead data analyst, responsible for ensuring the accuracy and consistency of exhibition data across our platform.

      You are provided with three inputs:

      1. Submitted record: A JSON object that contains structured data about an exhibition.
      2. Source of truth: A block of plain text extracted from a webpage that provides the accurate exhibition details.
      3. Schema: A Zod schema that defines the properties to be verified.

      Your task is as follows:

      Compare Properties:
      For each property defined in the "Schema", compare the value in the "Submitted record" with the corresponding information in the "Source of truth".

      Exact String Matching for Non-Date Fields:
      For string properties (e.g. exhibition_name, info etc.), perform an exact string comparison. If the Submitted record’s value is exactly the same as the value found in the "Source of truth", then return null for that property. Note that the string values must be an exact match, a partial match is NOT good enough it must be an exact match.

      Handle start_date & end_dates:
      If the start_date, end_date differs only by formatting—for example, if they represent the same date in different text formats—do not treat it as incorrect. For example, if the "Source of truth" contains "2023-01-01" and the "Submitted record" contains "01/01/2023", treat them as a match and return null for that property.

      Handle private_view_start_date & private_view_end_date:
      A private view typically occurs the day before the start_date of the exhibition and must include a time. DO NOT use the start_date as the private_view_start_date and the end_date as the private_view_end_date for the private view properties. If the private_view_start_date & private_view_end_date do not exist in the "Source of truth" but they exist in the "Submitted record", provide a short feedback message.

      If a property in the Submitted record is null, treat it as "not provided." Do not consider it "present in the record." If the Source of truth also does not mention it, then there is no discrepancy (return null).


      Provide Actionable Feedback Only:
      If a property exists in the "Source of truth" and its value in the "Submitted record" is missing or definitely incorrect, provide a short, concise feedback message indicating the discrepancy.

      Important:
      1. Do not output any message for properties that are correct or if the property is not mentioned in the "Source of truth". Instead, return null for that property.
      2. Do not include any statements like matches the "Source of truth." Only output feedback messages for actionable discrepancies.
      3. If you're unsure about the correctness of a property, provide a feedback message indicating that you're unsure.
      4. It is preferable to not provide any feedback. Only provide feedback on properties you are 100% sure are incorrect or missing.
      5. Before returning feedback, double check that the feedback messages are accurate and explain fully what the problem(s) are. Remember your feedback will be used by a junior analyst to review and correct their submission.
      6. If the Source of truth also does not mention that property, return null for that property (no feedback).

      Example scenario:
      - "Submitted record": { private_view_start_date: null }
      - "Source of truth": (No mention of private view dates)
      In this scenario, you must return:
      { private_view_start_date: null }
      +not a discrepancy message, because the record’s value is null and the Source of truth does not mention it.
      `,
      prompt: `
      "Submitted record": ${JSON.stringify(record)}
      "Source of truth": ${page_text}
      "Schema": ${checked_work_schena.shape}`,
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
}

const feedback = await check_work(record, page_text);

console.log("feedback", feedback);

async function actionFeedback({ feedback, source_of_truth, original_record }) {
  try {
    const data = await generateObject({
      model: openai("gpt-4o"),
      schema: checked_work_schena,
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
}

const updated_record = await actionFeedback({
  feedback,
  source_of_truth: page_text,
  original_record: record,
});

console.log("whoop updated record", updated_record);

// TODO
// The schema in event_scraper might need to change if private view is now flat
// Consider channging dates to a date object instead of string in the schema & perhaps changes dates using js before comparison
