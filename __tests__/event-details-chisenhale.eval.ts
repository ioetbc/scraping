import { Factuality, Levenshtein } from "autoevals";
import { evalite } from "evalite";
// import { traceAISDKModel } from "evalite/ai-sdk";
import { format } from "date-fns";

import { find_events_prompt } from "../prompts/find-events-prompt.js";

import { EventScraper } from "../services/event-scraper.js";

import dotenv from "dotenv";
import { exhibition_name_prompt } from "../prompts/extract-event-details-prompt.js";

dotenv.config();

const source_of_truth_mock = `
Skip to Contents

This website uses cookies.

Our optional cookies are used to help us report and raise funding. We would appreciate it if you could accept them.

Accept All
Accept Required
Specify preferences
Chisenhale
What’s On
What We Do
Your Visit
Support Us
Shop
Archive
Dan Guthrie

earf.info

Illustration by Gwyn Willey, in Ramon R. Willey’s The Black Boy School, Stroud 1844–1914, 1970. Edited by Dan Guthrie, 2024.

earf.info is an online platform that collects research related to artist Dan Guthrie’s new body of work Empty Alcove / Rotting Figure, 2025, commissioned and produced by Spike Island, Bristol and Chisenhale Gallery, London.

Empty Alcove / Rotting Figure is an art commission that imagines the future of the Blackboy Clock, an object of contested heritage publicly displayed in Guthrie’s hometown of Stroud, Gloucestershire. It puts forward the ‘radical un-conservation’ of the clock; a theoretical term proposed by Guthrie to describe the act of acquiring an object with the intention of destroying it. The commission will be exhibited at Spike Island, Bristol from 8 February – 11 May 2025, and at Chisenhale Gallery, London from 6 June – 17 August 2025.

On earf.info, an interactive timeline traces the history of the Blackboy Clock alongside wider contested heritage debates in the UK. The site also hosts a journal with texts authored by Guthrie and other contributors; access materials and a self-care guide related to the commission; and a list of events programmed alongside each of Guthrie’s exhibitions.

earf.info

Biography

Dan Guthrie lives and works in the UK. Selected exhibitions and screenings include: Absent Forces, Open City Documentary Film Festival, 2024; Two Films, VOLT, Devonshire Collective, Eastbourne, 2023; Spirit Messages touring programme, aemi, 2023–2024; Selected 13 touring programme, FLAMIN and videoclub, 2023; wave 4, Prismatic Ground, New York, 2023; Forum Expanded, Berlinale, Berlin, 2023; Right of Way, LUX, London, 2023; and Short Film Programme, Whitstable Biennale, Whitstable, 2022.

Supporters

earf.info is co-published by Chisenhale Gallery, London and Spike Island, Bristol.

With the generous support of Frank Bowling and Rachel Scott.

Credits

Editors: Olivia Aherne, Carmen Juliá
Assistant Editor: Rachel Be-Yun Wang
Editorial Support: Phoebe Cripps
Research Assistants: Holly Antrum, Tommy Madison
Web Development: An Endless Supply

Opportunities
Our Team
Enquiries
Mailing List
Press
Cookies
Ethics Policy
Safeguarding
Privacy Policy
Free EntryWednesday–Sunday, 12–6pm
64 Chisenhale Road, London, E3 5QZ
Charity No. 1026175
Company No. 02851794
+44 (0)20 8981 4518
mail@chisenhale.org.uk
Instagram
Facebook
© Chisenhale Gallery 2025
markdown lol Skip to Contents

This website uses cookies.

Our optional cookies are used to help us report and raise funding. We would appreciate it if you could accept them.

Accept All
Accept Required
Specify preferences
Chisenhale
What’s On
What We Do
Your Visit
Support Us
Shop
Archive
What’s On
Forum
1 May, 7–9pm
Forum

Chisenhale’s Social Practice Forum is a regular gathering for artists, educators, and creative practitioners to exchange ideas and develop approaches to socially engaged practice. Sessions rotate between social gatherings, guest-led workshops, and peer discussions, fostering critical dialogue, mutual support, and new ways of working together.

On Thursday 1 May, curator, educator, and researcher Anna Colin will present a talk expanding on the themes of her recent book, Alternative Pedagogical Spaces: From Utopia to Institutionalization, Sternberg / Villa Arson, 2025.

Grounded in empirical research, Alternative Pedagogical Spaces: From Utopia to Institutionalization is a critical inquiry into the establishment, development, and transformation of alternative pedagogical and social spaces. Written by Colin, a former director and co-founder of Open School East, an independent art school and community space founded in London in 2013, this essay-length book explores the instituting factors, organisational life cycles, and alignments and misalignments between values and practices that permeate such a project.

The essay delves into the qualities and prerequisites for what Colin calls ‘multi-public educational organizations.’ It also scrutinises the hurdles associated with the effort to remain alternative, including processes of habituation, temptation or pressure to scale up, ethos-bending fundraising exercises, and long tenure, as well as the plain desire for stability and sustainability.

Following the talk, Colin will co-lead a discussion with attendees, drawing out key themes and reflecting on their implications for individual and collective practice.

Book Here

Anna Colin, Alternative Pedagogical Spaces: From Utopia to Institutionalization, Sternberg / Villa Arson, 2025.

Biography

Anna Colin is an independent curator, educator, researcher and gardener. Among other areas of investigation, Anna is engaged with ecocentric social practice, critical pedagogy, alternative modes of instituting, institutional time, and participatory landscaping. She directs the MFA Curating and co-directs the Centre for Art Ecology at Goldsmiths, University of London. Anna was a co-founder and director, between 2013 and 2021, of Open School East, an independent art school and community space in London then Margate. She worked as associate curator at Lafayette Anticipations in Paris (2014-20), associate director at Bétonsalon – Centre for art and research, Paris (2011-12), and curator at Gasworks, London (2007-10). With Camille Richert, she curated Chaleur humaine, the 2nd edition of the Art and Industry Triennale (2023-24) at  Frac Grand Large et LAAC in Dunkerque. Anna holds a PhD in cultural geography and is currently training in arboriculture.

Access

The event will be taking place at Chisenhale Gallery. Chisenhale Gallery has flat access with an all-genders, fully accessible toilet. Please note that this event will be photographed for marketing and archival purposes.

We are committed to ensuring our events are accessible for all. Please contact mail@chisenhale.org.uk to discuss your access needs. We will endeavour to meet all requests where possible. Please be advised that requests should be made two weeks in advance of the event.

Opportunities
Our Team
Enquiries
Mailing List
Press
Cookies
Ethics Policy
Safeguarding
Privacy Policy
Free EntryWednesday–Sunday, 12–6pm
64 Chisenhale Road, London, E3 5QZ
Charity No. 1026175
Company No. 02851794
+44 (0)20 8981 4518
mail@chisenhale.org.uk
Instagram
Facebook
© Chisenhale Gallery 2025
`;

const { user_prompt } = exhibition_name_prompt({
	markdown: source_of_truth_mock,
});

evalite("event details Chisenhale", {
	data: async () => [
		{
			input: user_prompt,
			expected: JSON.stringify({
				events: [{ exhibition_name: "Empty Alcove / Rotting Figure" }],
			}),
		},
	],
	task: async () => {
		const scraper = new EventScraper();
		const result = await scraper.extract_exhibition_name(source_of_truth_mock);
		console.log("result chisenhale", JSON.stringify(result));
		return JSON.stringify(result);
	},
	scorers: [Factuality, Levenshtein],
});
