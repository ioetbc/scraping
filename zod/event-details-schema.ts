import { z } from "zod";

// TODO: Add Online or inperson enum https://www.workplace.art/exhibitions/focus-amy-winstanley (Online)

export const feedback_schema = z.object({
  exhibition_name: z.string().nullable().default(null),
  start_date: z.date().or(z.string()).nullable().default(null),
  end_date: z.date().or(z.string()).nullable().default(null),
  private_view_start_date: z.date().or(z.string()).nullable().default(null),
  private_view_end_date: z.date().or(z.string()).nullable().default(null),
  featured_artists: z.array(z.string()).or(z.string()).nullable().default(null),
  info: z.string().nullable().default(null),
  is_ticketed: z.boolean().or(z.string()).nullable().default(null),
  // schedule: z
  //   .array(
  //     z
  //       .object({
  //         start_time: z.string().nullable().default(null),
  //         end_time: z.string().nullable().default(null),
  //         label: z.string().nullable().default(null),
  //       })
  //       .nullable()
  //       .default(null),
  //   )
  //   .or(z.string())
  //   .default([])
  //   .nullable(),
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
    .default(false)
    .nullable(),
  // schedule: z
  //   .array(
  //     z.object({
  //       start_time: z
  //         .string()
  //         .describe("The scheduled start time of the event")
  //         .nullable(),
  //       end_time: z
  //         .string()
  //         .describe("The scheduled end time of the event")
  //         .nullable(),
  //       label: z
  //         .string()
  //         .describe(
  //           "A short description of what will be happening at this time",
  //         )
  //         .nullable(),
  //     }),
  //   )
  //   .or(z.null())
  //   .describe("A list of event timings")
  //   .default([]),
});
