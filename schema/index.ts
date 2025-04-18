import type { z } from "zod";

import {
	details_schema,
	exhibition_name_schema,
	featured_artist_schema,
	image_url_schema,
	is_ticketed_schema,
	mega_schema,
	private_view_schema,
	start_date_end_date_schema,
} from "../schema/event-details-schema.js";

import { event_image_schema } from "../schema/event-image-schema.js";
import { event_map_schema } from "../schema/event-map-schema.js";

export type Event = z.infer<typeof event_map_schema.shape.events>[number];
export type MegaSchema = z.infer<typeof mega_schema>;

export default {
	details_schema,
	exhibition_name_schema,
	featured_artist_schema,
	image_url_schema,
	is_ticketed_schema,
	mega_schema,
	private_view_schema,
	start_date_end_date_schema,
	event_map_schema,
	event_image_schema,
};
