import { z } from "zod";

// TODO: Add Online or inperson enum https://www.workplace.art/exhibitions/focus-amy-winstanley (Online)

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

export const private_view_schema = z.object({
  private_view_start_date: z.string().nullable(),
  private_view_end_date: z.string().nullable(),
});

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
    .nullable()
    .default(false),
});
