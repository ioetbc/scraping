import { z } from "zod";

export const event_map_schema = z.object({
	events: z.array(
		z.object({
			name: z.string().describe("the name of the event"),
			event_page_url: z
				.string()
				.url()
				.describe("the event page url")
				.nullable(),
			start_date: z.string().describe("the start date of the event").nullable(),
			end_date: z.string().describe("the end date of the event").nullable(),
			private_view_start_date: z
				.string()
				.describe("the start date of the private view of the event")
				.nullable(),
			private_view_end_date: z
				.string()
				.describe("the end date of the private view of the event")
				.nullable(),
		}),
	),
});
