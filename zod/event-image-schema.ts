import { z } from "zod";

export const event_image_schema = z.object({
	image_urls: z
		.array(z.string())
		.describe("Event image urls")
		.max(5)
		.default([]),
});
