import { Factuality, Levenshtein } from "autoevals";
import { evalite } from "evalite";
import { EventScraper } from "../services/event-scraper.js";

import {
	white_cube_bermondsey_hrefs,
	white_cube_bermondsey_source_of_truth,
} from "./generated/mocks/find-events/white_cube_bermondsey";

evalite("White Cube - Find events", {
	data: async () => [
		{
			input: "",
			expected: JSON.stringify([
				{
					name: "Antony Gormley: WITNESS Early Lead Works",
					event_page_url:
						"https://www.whitecube.com/gallery-exhibitions/antony-gormley-masons-yard-2025",
					start_date: "2025-04-23",
					end_date: "2025-06-08",
					private_view_start_date: "2025-04-22T18:00:00.000Z",
					private_view_end_date: "2025-04-22T20:00:00.000Z",
				},
				{
					name: "Richard Hunt: Metamorphosis – A Retrospective",
					event_page_url:
						"https://www.whitecube.com/gallery-exhibitions/richard-hunt-bermondsey-2025",
					start_date: "2025-04-25",
					end_date: "2025-06-29",
					private_view_start_date: "2025-04-24T18:30:00.000Z",
					private_view_end_date: "2025-04-24T20:00:00.000Z",
				},
				{
					name: "Anselm Kiefer Solo Exhibition",
					event_page_url:
						"https://www.whitecube.com/gallery-exhibitions/anselm-kiefer-masons-yard-2025",
					start_date: "2025-06-25",
					end_date: "2025-08-16",
					private_view_start_date: null,
					private_view_end_date: null,
				},
				{
					name: "Sara Flores: Bakish Mai",
					event_page_url:
						"https://www.whitecube.com/gallery-exhibitions/sara-flores-bermondsey-2025-2",
					start_date: "2025-07-09",
					end_date: "2025-08-31",
					private_view_start_date: null,
					private_view_end_date: null,
				},
			]),
		},
	],
	task: async () => {
		const scraper = new EventScraper();
		const result = await scraper.find_events(
			white_cube_bermondsey_source_of_truth,
			white_cube_bermondsey_hrefs,
		);

		console.log("hmm", JSON.stringify(result, null, 2));

		return JSON.stringify(result);
	},
	scorers: [Factuality, Levenshtein],
});
