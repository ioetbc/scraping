import {z} from "zod";

export const event_map_schema = z.object({
  events: z.array(
    z.object({
      name: z.string().describe("the name of the event"),
      url: z.string().url().describe("the url of the event"),
    })
  ),
});
