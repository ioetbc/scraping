import { Factuality, Levenshtein } from "autoevals";
import { evalite } from "evalite";
// import { traceAISDKModel } from "evalite/ai-sdk";
import { format } from "date-fns";

import { find_events_prompt } from "../prompts/find-events-prompt.js";

import { EventScraper } from "../services/event-scraper.js";

import dotenv from "dotenv";

dotenv.config();

const source_of_truth_mock = `
  RICHARD SALTOUN
  Skip to main content
  MENU
  EXHIBITIONS
  CURRENT AND FORTHCOMING
  PAST
  JACQUELINE PONCELET
  THIS, THAT AND THE OTHER
  11 MAR—3 MAY 2025
  LONDON
  Richard Saltoun Gallery presents a solo exhibition by Belgian-born, London-based artist Jacqueline PONCELET (b. 1947), whose pioneering approach to colour, material, surface, and space has redefined the boundaries between fine art and craft. Spanning fifty years of work, this, that and the other brings together Poncelet’s early sculptural ceramics, large-scale...
  READ MORE
  GAIA FUGAZZA: MAKING KIN
  CURATED BY PAOLA UGOLINI
  15 APR—30 MAY 2025
  ROME
  Opening: Tuesday, 15 April | 6pm EN : American feminist philosopher Donna Haraway, in her essay Chthulucene . Surviving on an Infected Planet , reiterates the importance of generating kinship, ‘ making kin’ . Although it lacks an equivalent in the Italian language, kin stands for ‘consanguineous’, ‘relative’, ‘lineage’ and...
  READ MORE
  WALL HANGINGS
  A LEGACY OF WOMEN IN FIBRE ART
  6 MAY—20 JUN 2025
  NEW YORK
  Part I TEFAF New York | Room 205 8 – 13 May 2025 Part II Richard Saltoun Gallery New York This group exhibition at Richard Saltoun Gallery New York brings together works by pioneering female textile artists featured in MoMA’s landmark 1969 survey Wall Hangings — Magdalena ABAKANOWICZ (1930–2017), Olga...
  READ MORE
  ANNA PERACH
  A LEAP OF SYMPATHY
  15 MAY—24 JUN 2025
  LONDON
  peformance: Thursday, 15 May | 6pm | rsvp essential Laima Layton- composer and artist Jody Deschutter- sound assistant Luigi Ambrosio- choreographer Maria Sole Montacci- performer opening reception: 6:30–8:30pm Richard Saltoun Gallery is pleased to present A Leap of Sympathy , the inaugural solo exhibition by London-based artist Anna PERACH (b....
  READ MORE
  RICHARD SALTOUN GALLERY| LONDON

  41 Dover Street,
  London W1S 4NS



  RICHARD SALTOUN GALLERY| ROME

  Via Margutta, 48a-48b

  00187 Rome



  RICHARD SALTOUN GALLERY| NEW YORK

  19 E 66th St

  New York, NY 10065


  OPENING HOURS | LONDON

  Tuesday – Friday, 10am – 6pm

  Saturday, 11am – 5pm



  OPENING HOURS | ROME

  Tuesday - Friday, 10:30am - 6pm
  Or by appointment



  OPENING HOURS | NEW YORK

  Monday – Friday, 11am – 6pm


  CONTACT

  London:

  +44 (0) 20 7637 1225

  info@richardsaltoun.com



  Rome:

  +39 06 86678 388

  rome@richardsaltoun.com



  New York:

  +1 (646) 291-8939

  nyc@richardsaltoun.com


  MAILING LIST

  Join our mailing list



  Instagram
  , opens in a new tab.
  Facebook
  , opens in a new tab.
  Youtube
  , opens in a new tab.
  Vimeo
  , opens in a new tab.
  Join the mailing list
  Artsy
  , opens in a new tab.
  View on Google Maps
  Tiktok
  , opens in a new tab.
  Ocula
  , opens in a new tab.
  PRIVACY POLICY MANAGE COOKIES
  Copyright © 2025 Richard Saltoun Site by Artlogic

  We use cookies on our website to improve your experience. You can find out why by reading our Privacy Policy. By continuing to browse our site you agree to our use of cookies.

  MANAGE COOKIES
  ACCEPT
`;

const hrefs_mock = [
	"https://www.richardsaltoun.com/",
	"https://www.richardsaltoun.com/exhibitions/current-forthcoming/#main_content",
	"https://www.richardsaltoun.com/exhibitions/current-forthcoming/#",
	"https://www.richardsaltoun.com/artists/",
	"https://www.richardsaltoun.com/exhibitions/",
	"https://www.richardsaltoun.com/viewing-room/",
	"https://www.richardsaltoun.com/art-fairs/",
	"https://www.richardsaltoun.com/events/",
	"https://www.richardsaltoun.com/news/",
	"https://www.richardsaltoun.com/store/",
	"https://www.richardsaltoun.com/contact/",
	"javascript:void(0)",
	"javascript:void(0)",
	"https://www.richardsaltoun.com/store/basket/",
	"https://www.richardsaltoun.com/store/basket/",
	"https://www.richardsaltoun.com/store/basket/",
	"https://www.richardsaltoun.com/store/basket/",
	"https://www.richardsaltoun.com/exhibitions/current-forthcoming/#",
	"https://www.richardsaltoun.com/exhibitions/current-forthcoming/",
	"https://www.richardsaltoun.com/exhibitions/past/",
	"https://www.richardsaltoun.com/exhibitions/139-jacqueline-poncelet-this-that-and-the-other/",
	"https://www.richardsaltoun.com/exhibitions/142-gaia-fugazza-making-kin-curated-by-paola-ugolini/",
	"https://www.richardsaltoun.com/exhibitions/141-wall-hangings-a-legacy-of-women-in-fibre-art/",
	"https://www.richardsaltoun.com/exhibitions/140-anna-perach-a-leap-of-sympathy/",
	"https://www.richardsaltoun.com/mailing-list/",
	"https://www.richardsaltoun.com/privacy/",
	"https://www.instagram.com/richardsaltoungallery/",
	"https://www.facebook.com/RichardSaltounGallery",
	"https://www.youtube.com/channel/UCJYG9MM4354goo_PqjKZ33A",
	"https://vimeo.com/user52644159",
	"https://www.richardsaltoun.com/mailing-list/",
	"https://www.artsy.net/richard-saltoun",
	"https://goo.gl/maps/6NKbz9TuQ2Bb3w9e6",
	"https://www.tiktok.com/@richardsaltoungallery",
	"https://ocula.com/art-galleries/richard-saltoun/",
	"https://www.richardsaltoun.com/privacy-policy/",
	"javascript:void(0)",
	"https://artlogic.net/",
	"https://www.richardsaltoun.com/privacy-policy/",
	"javascript:;",
	"javascript:;",
	"javascript:;",
	"javascript:;",
	"https://www.richardsaltoun.com/exhibitions/current-forthcoming/#",
	"https://www.richardsaltoun.com/exhibitions/current-forthcoming/#",
	"https://www.richardsaltoun.com/privacy-policy/",
	"https://www.richardsaltoun.com/exhibitions/current-forthcoming/#",
	"https://www.richardsaltoun.com/exhibitions/current-forthcoming/#",
	"javascript:;",
];

const { system_prompt, user_prompt } = find_events_prompt({
	source_of_truth: source_of_truth_mock,
	hrefs: hrefs_mock,
	current_date: format(new Date(), "yyyy-MM-dd"),
});

evalite("Find events", {
	data: async () => [
		{
			input: user_prompt,
			expected: JSON.stringify({
				events: [
					{
						name: "JACQUELINE PONCELET: THIS, THAT AND THE OTHER",
						url: "https://www.richardsaltoun.com/exhibitions/139-jacqueline-poncelet-this-that-and-the-other/",
						start_date: "2025-03-11",
						end_date: "2025-05-03",
					},
					{
						name: "ANNA PERACH: A LEAP OF SYMPATHY",
						url: "https://www.richardsaltoun.com/exhibitions/140-anna-perach-a-leap-of-sympathy/",
						start_date: "2025-05-15",
						end_date: "2025-06-24",
					},
				],
			}),
		},
	],
	task: async (input) => {
		const scraper = new EventScraper();
		const result = await scraper.find_events(source_of_truth_mock, hrefs_mock);

		console.log("result lol", JSON.stringify(result));
		return JSON.stringify(result);
	},
	scorers: [Factuality, Levenshtein],
});
