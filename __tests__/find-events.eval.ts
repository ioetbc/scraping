import { Factuality, Levenshtein } from "autoevals";
import { evalite } from "evalite";
import { EventScraper } from "../services/event-scraper.js";

import {
	the_artist_room_hrefs,
	the_artist_room_source_of_truth,
} from "./generated/mocks/find-events/the_artist_room";

import {
	white_cube_bermondsey_hrefs,
	white_cube_bermondsey_source_of_truth,
} from "./generated/mocks/find-events/white_cube_bermondsey";

import {
	annka_kultys_hrefs,
	annka_kultys_source_of_truth,
} from "./generated/mocks/find-events/annka_kultys";

evalite("White Cube", {
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

evalite("The Artist Room", {
	data: async () => [
		{
			input: "",
			expected: JSON.stringify([
				{
					name: "Søren Arildsen: In the Seams",
					event_page_url: "https://theartistroom.com/exhibition/",
					start_date: "2025-03-27",
					end_date: "2025-04-25",
					private_view_start_date: null,
					private_view_end_date: null,
				},
			]),
		},
	],
	task: async () => {
		const scraper = new EventScraper();
		const result = await scraper.find_events(
			the_artist_room_source_of_truth,
			the_artist_room_hrefs,
		);

		console.log("the artist room hmm", JSON.stringify(result, null, 2));

		return JSON.stringify(result);
	},
	scorers: [Factuality, Levenshtein],
});

evalite("Anna Kultys", {
	data: async () => [
		{
			input: "",
			expected: JSON.stringify([
				{
					name: "BANZ & BOWINKEL",
					event_page_url:
						"https://www.annkakultys.com/exhibitions/banz-bowinkel-compositions/",
					start_date: "2025-03-28",
					end_date: "2025-05-10",
					private_view_start_date: null,
					private_view_end_date: null,
				},
				{
					name: "LOUISA CLEMENT",
					event_page_url: null,
					start_date: "2025-06-06",
					end_date: "2025-07-26",
					private_view_start_date: "2025-06-08T11:00:00.000Z",
					private_view_end_date: "2025-06-08T17:00:00.000Z",
				},
				// {
				// 	name: "CACOTOPIA 09 | VRILLUMINATED: MOVING IMAGE PERSPECTIVES",
				// 	event_page_url: null,
				// 	start_date: "2024-11-17",
				// 	end_date: "2025-11-16",
				// 	private_view_start_date: null,
				// 	private_view_end_date: null,
				// },
			]),
		},
	],
	task: async () => {
		const scraper = new EventScraper();
		const result = await scraper.find_events(
			annka_kultys_source_of_truth,
			annka_kultys_hrefs,
		);

		console.log("annka kultys hmm", JSON.stringify(result, null, 2));

		return JSON.stringify(result);
	},
	scorers: [Factuality, Levenshtein],
});
