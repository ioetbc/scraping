import { z } from "zod";

// TODO: Add Online or inperson enum https://www.workplace.art/exhibitions/focus-amy-winstanley (Online)

export const private_view_schema = z.object({
	private_view_start_date: z
		.string()
		.describe("the private view start date of the event")
		.nullable(),
	private_view_end_date: z
		.string()
		.describe("the private view end date of the event")
		.nullable(),
});

export const start_date_end_date_schema = z.object({
	start_date: z.string().describe("the date the event begins").nullable(),
	end_date: z.string().describe("the date the event ends").nullable(),
});

export const exhibition_name_schema = z.object({
	exhibition_name: z
		.string()
		.describe("the full name of the exhibition")
		.nullable(),
});

export const featured_artist_schema = z.object({
	featured_artists: z
		.array(z.string())
		.describe("the names of all the artists in the event")
		.default([])
		.nullable(),
});

export const details_schema = z.object({
	details: z
		.string()
		.describe("The information surrounding the event")
		.nullable(),
});

export const image_url_schema = z.object({
	urls: z
		.array(z.string())
		.describe("The url of the image of the event")
		.default([])
		.nullable(),
});

export const is_ticketed_schema = z.object({
	is_ticketed: z
		.boolean()
		.describe("Whether you need a ticket to attend this event")
		.nullable()
		.default(false),
});

// export const mega_schema = z.union([
//   featured_artist_schema,
//   details_schema,
//   image_url_schema,
//   is_ticketed_schema,
//   private_view_schema,
//   start_and_end_date_schema,
//   exhibition_name_schema,
// ]);

export const mega_schema = featured_artist_schema
	.merge(details_schema)
	.merge(image_url_schema)
	.merge(is_ticketed_schema)
	.merge(private_view_schema)
	.merge(start_date_end_date_schema)
	.merge(exhibition_name_schema);
