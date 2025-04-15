import { Factuality, Levenshtein } from "autoevals";
import { evalite } from "evalite";
// import { traceAISDKModel } from "evalite/ai-sdk";
import { format } from "date-fns";

import { find_events_prompt } from "../prompts/find-events-prompt.js";

import { EventScraper } from "../services/event-scraper.js";

import dotenv from "dotenv";

dotenv.config();

const source_of_truth_mock = `
markdown Title: A place for modernism

URL Source: https://www.pilarcorrias.com/exhibitions/477-a-place-for-modernism/

Markdown Content:
[DOWNLOAD PRESS RELEASE. (This link opens in a new tab).](http://website-pilarcorrias.artlogic.net/usr/library/documents/main/a-place-for-modernism-sr-release.pdf)

[DOWNLOAD EXHIBITION WALKING LIST. (This link opens in a new tab).](http://website-pilarcorrias.artlogic.net/usr/library/documents/main/a-place-for-modernism-walking-list.pdf)

[READ AN ACCOMPANYING TEXT BY CRAIG BURNETT. (This link opens in a new tab).](http://website-pilarcorrias.artlogic.net/usr/library/documents/main/pilar-corrias_a-place-for-modernism_craig-burnett.pdf)

The group exhibition _A place for modernism_ brings together five artists, all based on or near the East Coast of the US, whose work responds to the wide-ranging legacy of modernism. Rather than treat the movement as a closed historical episode, **Josiah McElheny**, **Carrie Moyer**, **Hasani Sahlehe**, **Arlene Shechet** and **Dan Walsh** view modernism as a perennial method that can be adapted to address the political and aesthetic questions of the present day.

_A place for modernism_ proposes that our engagement with an artwork is a model for how we engage with the world at large, hence the emphasis on the principles of colour, form, ambiguity and perspective. With its geometrical arrangement and primary colours, **Josiah McElheny**’s sculpture **_Chromatic Modernism (Blue, Yellow, Red)_ (2008)** stands in the gallery as a model of the movement. Examining viewpoints, literal and metaphorical, McElheny suggests a multiplicity of histories, thus granting the viewer a radical interpretative responsibility.

![Image 1: Josiah McElheny Anti-Vortex Drawing III2017 Hand-blown cut and polished glass, low-iron mirror and painted wood 38 x 38 x 11...](https://artlogic-res.cloudinary.com/w_800,c_limit,f_auto,fl_lossy,q_auto:best,dpr_2.0/artlogicstorage/pilarcorrias/images/view/03b6eae1fdc32f3984c2e2261e911bcfj/pilarcorrias-josiah-mcelheny-anti-vortex-drawing-iii-2017.jpg)

![Image 2: Josiah McElheny Chromatic Modernism (Blue, Yellow, Red)2008 Hand blown glass, coloured laminated sheet glass, low iron steel glass, anodized aluminium...](https://artlogic-res.cloudinary.com/w_800,c_limit,f_auto,fl_lossy,q_auto:best,dpr_2.0/artlogicstorage/pilarcorrias/images/view/c148ca1b46780948209e18c5178e52a8/pilarcorrias-josiah-mcelheny-chromatic-modernism-blue-yellow-red-2008.jpg)

![Image 3: Josiah McElheny Anti-Vortex Drawing IV2017 Hand-blown cut and polished glass, low-iron mirror and painted wood 38 x 38 x 11...](https://artlogic-res.cloudinary.com/w_800,c_limit,f_auto,fl_lossy,q_auto:best,dpr_2.0/artlogicstorage/pilarcorrias/images/view/52d216c10d0901b680bcc0f4271c6f9cj/pilarcorrias-josiah-mcelheny-anti-vortex-drawing-iv-2017.jpg)

The painter **Carrie Moyer** revels in contaminating high modernism with imagery, illusion, brash colour or splashes of glitter, ‘reimagining its strategies and undermining its assumptions from \[her\] position on the margin as a woman, a feminist, and a lesbian’. Introducing elements of ‘beauty, seduction and play’ into the history of abstraction, Moyer wants the viewer to experience the painting as a kind of living organism.

![Image 4: Carrie Moyer Spores, Orbs & Flagella2023 Acrylic on canvas 182.9 x 132.1 x 3.8 cm 72 x 52 x 1...](https://www.pilarcorrias.com/images/shim.png)

![Image 5: Carrie Moyer H.M.S. Permafrost2024 Acrylic, glitter, black magnum, and fiber paste on canvas 147.3 x 101.6 cm 58 x 40...](https://www.pilarcorrias.com/images/shim.png)

### ‘I was trying to retool the high modernism to make space for myself. I was interested in reimagining its strategies and undermining its assumptions from my position on the margin as a woman, a feminist, and a lesbian. This required finding a way to obliquely sully the customs of modernism, such as adherence to the picture plane and the grid, the use of undisguised or “pure” materials, and the rejection of illusion. So, into my paintings came glitter, so-called decorative color, destabilised spaces that combined flatness and illusionism, forms that were neither representational nor abstract but hovered near legibility. Thirty years later, that sense of gleeful contamination has become much more than a critique; it’s a worldview.’– Carrie Moyer

![Image 6: Carrie Moyer Arrangement #112022 Mixed media and collage on paper Unframed: 55.2 x 37.1 cm 21 3/4 x 14 5/8...](https://www.pilarcorrias.com/images/shim.png)

![Image 7: Carrie Moyer Configuration #82022 Mixed media and collage on paper Unframed: 52.1 x 36.8 cm 20 1/2 x 14 1/2...](https://www.pilarcorrias.com/images/shim.png)

Modernism becomes a space for renewal in **Arlene Shechet**’s hands, too. As its title suggests, her work **_There Then Now and Again_** **(2024)** feels suffused with time and life, as if it were a Cubist painting that dropped from the wall, came alive and reinvented itself as sculpture. As with McElheny, modernism, in Shechet’s hands, becomes a way to reconsider both the past and the present moment, reconstituting the project as a space for constant renewal.

![Image 8: Arlene Shechet Together, At Sunrise2024 Glazed ceramic, powder coated steel Overall: 45.7 x 45.7 x 38.1 cm 18 x 18...](https://www.pilarcorrias.com/images/shim.png)

![Image 9: Arlene Shechet There Then Now And Again2024 Glazed ceramic, painted and dyed hardwood, steel 66 x 61 x 38.1 cm...](https://www.pilarcorrias.com/images/shim.png)

Characterised by dynamism and wry wit, a **Dan Walsh** painting seems to emerge from another era, future or past. A pyramid constructed of interlocking red, orange and green ovals, and suspended in a pink halo, **_Release_ (2023)** looks like a monument to a lost episode of modernism. His painting **_Extent_ (2024)** vibrates with austere energy, an effect conjured by the diminishing intensities of the painting’s tube-like forms. The top bars are solid blacks and whites, but both grow more and more diluted – the black lighter, the white greyer – as they repeat in an even beat down the canvas.

![Image 10: Dan Walsh Release2023 Acrylic on canvas 177.8 x 177.8 cm 70 x 70 in](https://www.pilarcorrias.com/images/shim.png)

![Image 11: Dan Walsh Extent2024 Acrylic on canvas 139.7 x 139.7 cm 55 x 55 in](https://www.pilarcorrias.com/images/shim.png)

With their wobbly edifices of joyful colour, the paintings of **Hasani Sahlehe** uplift the viewer, transforming their experience of space. Between the bars, washes of pale colour in **_My Paint_ (2025)** create a sense of vertiginous space, as if the painting is climbing into the stratosphere, held together by the internal gravity of the colour blocks. The painting seems to continue both top and bottom, as if it represents a fragment of a perpetual ascent. To this end, _A place for modernism_ proposes a rewriting of modernism as a never-ending story about how to look, think and feel about the world we inhabit.

### ‘Architecture of painting, presence, space, and song. All of these ideas are subtexts to the root of my work, which has always been perception.’

### – Hasani Sahlehe

![Image 12: Hasani Sahlehe Right Hand2025 Acrylic gel and airbrush on canvas 208.3 x 165.1 cm 82 x 65 in](https://www.pilarcorrias.com/images/shim.png)

![Image 13: Hasani Sahlehe My Paint2025 Acrylic gel and airbrush on canvas 152.4 x 121.9 cm 60 x 48 in](https://www.pilarcorrias.com/images/shim.png)
`;

const { system_prompt, user_prompt } = find_events_prompt({
	source_of_truth: source_of_truth_mock,
	hrefs: [],
	current_date: format(new Date(), "yyyy-MM-dd"),
});

evalite("Find events", {
	data: async () => [
		{
			input: user_prompt,
			expected: JSON.stringify({
				events: [
					{
						name: "PROSCENIUM",
						url: "https://xxijrahi.net/category/PROSCENIUM/",
						start_date: "2025-04-01",
						end_date: "2025-04-30",
					},
				],
			}),
		},
	],
	task: async (input) => {
		const scraper = new EventScraper();
		const result = await scraper.find_events(source_of_truth_mock, []);
		console.log("result lol", JSON.stringify(result));
		return JSON.stringify(result);
	},
	scorers: [Factuality, Levenshtein],
});
