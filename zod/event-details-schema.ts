import {z} from "zod";

export const event_details_schema = z.object({
  exhibition_name: z
    .string()
    .describe("the full name of the exhibition")
    .nullable(),
  start_date: z.string().describe("the date the event begins").nullable(),
  end_date: z.string().describe("the date the event ends").nullable(),
  private_view: z
    .object({
      start_date: z
        .string()
        .describe("the private view start date of the event")
        .nullable(),
      end_date: z
        .string()
        .describe("the private view end date of the event")
        .nullable(),
    })
    .nullable(),
  featured_artists: z
    .array(z.string())
    .describe("the names of all the artists in the event")
    .nullable(),
  info: z.string().describe("The information surrounding the event").nullable(),
  image_urls: z
    .array(z.string())
    .describe("The url of the image of the event")
    .nullable(),
  ticket: z
    .object({
      is_ticketed: z
        .boolean()
        .describe("Whether you need a ticket to attend this event")
        .nullable(),
    })
    .nullable(),
  // schedule: z
  //   .array(
  //     z
  //       .object({
  //         start_time: z
  //           .string()
  //           .describe("The scheduled start time of the event")
  //           .nullable(),
  //         end_time: z
  //           .string()
  //           .describe("The scheduled end time of the event")
  //           .nullable(),
  //         label: z.string().describe("The label of the schedule").nullable(),
  //       })
  //       .describe("Event timings")
  //       .nullable()
  //   )
  //   .describe("A list of event timings")
  //   .nullable(),
  // ticket: z
  //   .object({
  //     is_ticketed: z
  //       .boolean()
  //       .describe("Whether you need a ticket to attend this event")
  //       .nullable(),
  //     description: z
  //       .string()
  //       .describe("The description of the ticket")
  //       .nullable(),
  //     tickets: z
  //       .array(
  //         z
  //           .object({
  //             price: z.number().describe("The price of the ticket").nullable(),
  //             ticket_url: z
  //               .string()
  //               .describe("A url to purchase the ticket")
  //               .nullable(),
  //           })
  //           .nullable()
  //       )
  //       .nullable(),
  //   })
  //   .nullable(),
});
