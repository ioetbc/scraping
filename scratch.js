import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const record = {
  exhibition_name: "In the long silence",
  start_date: "2025-02-13",
  end_date: "2025-03-03",
  private_view_start_date: "2025-03-03",
  private_view_end_date: null,
  featured_artists: ["Dylan Williams"],
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

export const event_details_schema = z.object({
  exhibition_name: z
    .string()
    .describe("the full name of the exhibition")
    .nullable(),
  start_date: z.string().describe("the date the event begins").nullable(),
  end_date: z.string().describe("the date the event ends").nullable(),
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
    .default([])
    .nullable(),
  info: z.string().describe("The information surrounding the event").nullable(),
  image_urls: z
    .array(z.string())
    .describe("The url of the image of the event")
    .default([])
    .nullable(),
  is_ticketed: z
    .boolean()
    .describe("Whether you need a ticket to attend this event")
    .default(false),
});

export const feedback_schema = z.object({
  exhibition_name: z.string().optional(),
  start_date: z.date().or(z.string()).optional(),
  end_date: z.date().or(z.string()).optional(),
  private_view_start_date: z.date().or(z.string()).optional(),
  private_view_end_date: z.date().or(z.string()).optional(),
  featured_artists: z.array(z.string()).or(z.string()).optional(),
  info: z.string().optional(),
  is_ticketed: z.boolean().or(z.string()).optional(),
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
      schema: feedback_schema,
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
      For string properties (e.g. exhibition_name, info etc.), perform an exact string comparison. If the Submitted record’s value is exactly the same as the value found in the "Source of truth", then do not return that property. Note that the string values must be an exact match, a partial match is NOT good enough it must be an exact match.

      Handle start_date & end_dates:
      If the start_date, end_date differs only by formatting—for example, if they represent the same date in different text formats—do not treat it as incorrect. For example, if the "Source of truth" contains "2023-01-01" and the "Submitted record" contains "01/01/2023", treat them as a match and do not return that property.

      Handle private_view_start_date & private_view_end_date:
      Do not use the start_date as the private_view_start_date and the end_date as the private_view_end_date for the private view properties. If the private_view_start_date & private_view_end_date do not exist in the "Source of truth" but they exist in the "Submitted record", then do not include the properties. Only provide private view start and end dates if they are explicitly 100% in the "Source of truth". Private view start and end dates should include a date along with a timestamp.


      Provide Actionable Feedback Only:
      If a property exists in the "Source of truth" and its value in the "Submitted record" is missing or definitely incorrect, provide a short, concise feedback message indicating the discrepancy.

      Important:

      1. All properties in the schema are optional. If a property is correct or if the property is not mentioned in the "Source of truth", then do not include the property in your response.
      2. Do not include any statements like matches the "Source of truth." Only output feedback messages for actionable discrepancies.
      3. If you're unsure about the correctness of a property, provide a feedback message indicating that you're unsure.
      4. It is preferable to not provide any feedback. Only provide feedback on properties you are 100% sure are incorrect or missing.
      5. Before returning feedback, double check that the feedback messages are accurate and explain fully what the problem(s) are. Remember your feedback will be used by a junior analyst to review and correct their submission.`,
      prompt: `
      "Submitted record": ${JSON.stringify(record)}
      "Source of truth": ${page_text}
      "Schema": ${feedback_schema.shape}`,
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
// Consider channging dates to a date object instead of string in the schema & perhaps changes dates using js before comparison
