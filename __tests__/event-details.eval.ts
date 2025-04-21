import { Factuality, Levenshtein } from "autoevals";
import { evalite } from "evalite";
import { EventScraper } from "../services/event-scraper.js";

import {
	a_leap_of_sympathy_source_of_truth,
	early_witness_source_of_truth,
	i_dont_know_whats_come_over_me_source_of_truth,
	kiefer_source_of_truth,
	metamorphosis_source_of_truth,
	nora_source_of_truth,
} from "./mocks.js";

import { søren_arildsen_in_the_seams_source_of_truth } from "./generated/mocks/extract-details/søren_arildsen_in_the_seams";

const anselm_kiefer_url =
	"https://www.whitecube.com/gallery-exhibitions/anselm-kiefer-masons-yard-2025";

evalite("White Cube - Anselm Kiefer", {
	data: async () => [
		{
			input: "",
			expected: JSON.stringify({
				private_view: {
					private_view_start_date: null,
					private_view_end_date: null,
				},
				start_and_end_date: {
					start_date: "2025-06-25",
					end_date: "2025-08-16",
				},
				featured_artists: ["Anselm Kiefer"],
				exhibition_name: "Anselm Kiefer",
				image_urls: ["https://example.image"],
				details:
					"In June 2025, White Cube Mason’s Yard will open a solo exhibition of paintings by Anselm Kiefer. The exhibition coincides with the major presentation ‘Kiefer / Van Gogh’, at the Royal Academy of Arts, London (28 June – 26 October 2025) and marks the first UK exhibition to consider the enduring influence of Van Gogh on Kiefer’s practice.",
				is_ticketed: false,
			}),
		},
	],
	task: async () => {
		const scraper = new EventScraper();
		const result = await scraper.extract_event(kiefer_source_of_truth, [
			"https://example.image",
		]);

		return JSON.stringify(result);
	},
	scorers: [Factuality, Levenshtein],
});

evalite("White Cube - Early Lead Works", {
	data: async () => [
		{
			input: "",
			expected: JSON.stringify({
				private_view: {
					private_view_start_date: "2025-04-22T18:00:00.000Z",
					private_view_end_date: "2025-04-22T20:00:00.000Z",
				},
				start_and_end_date: {
					start_date: "2025-04-23",
					end_date: "2025-06-08",
				},
				featured_artists: ["Antony Gormley"],
				exhibition_name: "WITNESS: Early Lead Works",
				image_urls: ["https://example.image"],
				details: `Representing a major breakthrough in the development of Antony Gormley’s visual language, the early lead works – initiated in the mid-1970s, and developed amid the protracted geopolitical tensions of the Cold War – stand among the most iconic of the artist’s career. ‘WITNESS: Early Lead Works’ reintroduces audiences to these seminal sculptures, tracing how Gormley’s early experimentations with the material laid the groundwork for many subsequent bodies of work.

        The sculptures featured in ‘WITNESS’ trace the evolution of Gormley’s sculptural practice, from the utilisation of found objects to the incorporation of his own body, allowing for an interplay between emptiness and fullness, as well as a tension between the physical and the metaphysical. Together, the works on display serve as propositions for embodiment, vulnerability, space and presence. On the gallery’s ground floor, three early object-based lead sculptures – Land Sea and Air I (1977–79), Natural Selection (1981) and Seeds II (1989/93) – reconfigure the relationship between subject and referent, engaging in a critical enquiry that unfolds dialectics of creation and destruction, presence and absence. The earliest of these, Land Sea and Air I, consists of a trio of lead-wrapped, rock-like forms, prefiguring its later, figurative iteration Land Sea and Air II (1982). The work originated from a single granite rock, discovered by Gormley on a beach along Ireland’s west coast, which became the prototype for encasing three elemental forms in lead: one enclosing the original stone, another holding water, and the third containing air. Extracted from their original site and sealed within lead casings – thus removed from the register of the visible – these materials undergo a transformation that, in Gormley’s words, transposes them ‘from substance to imagination: from matter to mind’.

        In Natural Selection and Seeds II, lead’s intrinsic malleability – its ability to assume both hard and soft forms – becomes a site of convergence between human instruments and biospheric formations. Gormley regards this negotiation as one that ‘offers hope of balance and some form of integration between evolution and destruction.’ In the former work, 24 lead-encased objects – 12 natural, 12 human-made – are arranged along the gallery floor in descending scale, from the largest, a sphere, to the smallest, a pea-sized form. At the midpoint of this spectrum, the proximity of two near-identical shapes – a goose egg and a grenade – establishes an uncanny kinship, emphasised by their morphological likeness. This interplay recurs in Seeds II, where small, 45 mm lead handgun bullets are gathered in a heap, evoking the form of a grain pile – a theme that extends into the two wall-based works in the ground floor gallery. Shield II (1978), exhibited here for the first time, is a disc-like form composed of soldered-together lead fragments, while Mask (1978) preserves the impression of a machete, created by draping a lead sheet over the object. An instrument primarily associated with deforestation, its absence is signified by the cut-out silhouette of its hooked tip, exposing the wall behind it.

        Translating a range of figurative poses, five discrete body sculptures in the lower ground floor gallery become vessels of receptivity, attuning us to the subtle interrelations between body, presence and the spatial environment. Upon entering the gallery, we encounter Close I (1992), the only fully enclosed form among the exhibited body cases. Pressed face-down to the ground, with its limbs splayed as if embracing the earth, it appears both anchored and exposed. Enacting a full-bodied surrender, the absolute proximity between body and planet – two sites of being – draws them into and foregrounds their mutual dependency, bound by their shared gravitational pull. Extending this meditation, two early works from 1983 expand on the body’s dialogue with the external world, tracing its synergy with intangible fields. In the first, Untitled (Listening Figure), a seated figure cups one hand to its ear, where a small aperture opens into the sculpture’s recessed darkness. Gormley drew inspiration from the 11th-century Tibetan siddha Milarepa, who, as he describes, would ‘listen for the echo of his own voice rebounding across mountain valleys from his Himalayan cave in Nyalam’. Nearby, Untitled (Sleeping Figure) reclines with its head resting on a granite boulder, evoking a state of repose. In a parallel act of reference, Gormley associates the work with the biblical story of Jacob’s vision of a celestial ladder bridging earth and heaven. The figure’s hands, resting palms-down on the chest, and its parted feet lend a numinous symmetry to its stillness, while two small holes at the nose reinforce the notion of the body as a conduit between physical and transcendent realms. As Gormley reflects, ‘I have always thought of the darkness of the body as being equivalent to the darkness of the universe.’

        Intersecting these grounded figures, Home and the World II (1986–96) asserts a striking verticality. A singular striding form, its head is replaced by an elongated, house-shaped structure extending over five metres horizontally, punctuated at either end by small windows that reveal an interior void. Despite its apparent forward motion – one foot placed before the other – the figure remains rooted, embodying the tension between the body as both sanctuary and a vessel of perpetual displacement, engaging notions of habitation, constraint and the reciprocal shaping of body and environment. Unlike the seated or prone bodies in the gallery, it shares its elevated spatial orientation with Blanket Drawing I (1983). To make this work, Gormley pressed white clay into a hospital blanket around an empty silhouette of his body lying prone in the untouched wool. Lifted from the floor and pinned to the wall, the impression undergoes a perceptual shift – what once suggested rest is now reanimated, the figure’s head breaking beyond the blanket’s edge like a swimmer gasping for air.

        Tucked into a corner of the gallery, Witness II (1993) – the work that lends its name to the exhibition – absorbs its surroundings while remaining self-contained, its form reminiscent of an ancient, seated scribe. Though enclosed, small openings at the ears suggest a body attuned to its environment – registering movement, sound and activity while maintaining a state of profound stillness. Here, stillness does not equate to withdrawal but rather a deepened immersion in the sensory field, functioning as both probe and conduit, mapping the ambient reverberations and unseen frequencies of site and space. Reflecting Gormley’s late-20th-century preoccupations amid the threat of nuclear catastrophe, Witness II – like all the lead sculptures in this exhibition – materialises his enduring enquiry into the potency of sculpture’s intrinsic stillness and silence, celebrating its capacity to serve as an instrument through which we examine our own condition. A ‘gift from the past’, he writes, these forms hold both memory and the potential to become ‘a seed of the future’.

        ‘WITNESS Early Lead Works’ is curated by Susan May.

        Antony Gormley (b. 1950, London) is widely acclaimed for his sculptures, installations and public artworks that investigate the relationship of the human body to space. His work has developed the potential opened up by sculpture since the 1960s through a critical engagement with both his own body and those of others in a way that confronts fundamental questions of where human beings stand in relation to nature and the cosmos. Gormley continually tries to identify the space of art as a place of becoming in which new behaviours, thoughts and feelings can arise.

        ​Gormley’s work has been widely exhibited throughout the UK and internationally with exhibitions at Galerie Rudolfinum, Prague (2024); Musée Rodin, Paris (2023); Lehmbruck Museum, Duisburg, Germany (2022); Museum Voorlinden, Wassenaar, the Netherlands (2022); National Gallery Singapore (2021); Royal Academy of Arts, London (2019); Delos, Greece (2019); Uffizi Gallery, Florence, Italy (2019); Philadelphia Museum of Art, Pennsylvania (2019); Long Museum, Shanghai, China (2017); National Portrait Gallery, London (2016); Forte di Belvedere, Florence, Italy (2015); Zentrum Paul Klee, Bern, Switzerland (2014); Centro Cultural Banco do Brasil, São Paulo, Rio de Janeiro and Brasília (2012); Deichtorhallen, Hamburg, Germany (2012); The State Hermitage Museum, Saint Petersburg, Russia (2011); Kunsthaus Bregenz, Austria (2010); Hayward Gallery, London (2007); Malmö Konsthall, Sweden (1993); and Louisiana Museum of Modern Art, Humlebæk, Denmark (1989). Permanent public works include the Angel of the North (Gateshead, UK), Another Place (Crosby Beach, UK), Inside Australia (Lake Ballard, Western Australia), Exposure (Lelystad, the Netherlands), Chord (MIT – Massachusetts Institute of Technology, Cambridge) and Alert (Imperial College London).

        ​Gormley was awarded the Turner Prize in 1994, the South Bank Prize for Visual Art in 1999, the Bernhard Heiliger Award for Sculpture in 2007, the Obayashi Prize in 2012 and the Praemium Imperiale in 2013. In 1997 he was made an Officer of the British Empire (OBE) and was made a knight in the New Year’s Honours list in 2014. He is an Honorary Fellow of the Royal Institute of British Architects, an Honorary Doctor of the University of Cambridge and a Fellow of Trinity and Jesus Colleges, Cambridge, UK. Gormley has been a Royal Academician since 2003.`,
				is_ticketed: false,
			}),
		},
	],
	task: async () => {
		const scraper = new EventScraper();
		const result = await scraper.extract_event(early_witness_source_of_truth, [
			"https://example.image",
		]);

		return JSON.stringify(result);
	},
	scorers: [Factuality, Levenshtein],
});

evalite("White Cube - Metamorphosis", {
	data: async () => [
		{
			input: "",
			expected: JSON.stringify({
				private_view: {
					private_view_start_date: "2025-04-24T18:30:00.000Z",
					private_view_end_date: "2025-04-24T20:00:00.000Z",
				},
				start_and_end_date: {
					start_date: "2025-04-25",
					end_date: "2025-06-29",
				},
				featured_artists: ["Richard Hunt"],
				exhibition_name: "Metamorphosis – A Retrospective",
				image_urls: ["https://example.image"],
				details: `
          The first London retrospective of work by Richard Hunt (1935–2023), one of the foremost American sculptors of the 20th and 21st centuries, opens at White Cube Bermondsey in April 2025.

          Over a seven decade-long career, Hunt staged more than 170 solo shows and completed over 160 large-scale public sculpture commissions worldwide. In 1971, at the age of 35, he achieved a historic milestone as the first African American sculptor to receive a retrospective at New York’s MoMA.

          Working predominantly in metal, Hunt was profoundly inspired by biological science and the natural world. His hybrid sculptures are characterised by dualities, that of the natural and the industrial, the surreal and the abstract, the geometric and the organic.

          Throughout his career, the late artist paid tribute to some of America’s greatest heroes in his work, including Martin Luther King Jr., Mary McLeod Bethune, Jesse Owens and Hobart Taylor Jr. In 2022, he was commissioned by Barack Obama to create a work for the Obama Presidential Centre, located in the artist’s hometown of Chicago.
        `,
				is_ticketed: true,
			}),
		},
	],
	task: async () => {
		const scraper = new EventScraper();
		const result = await scraper.extract_event(metamorphosis_source_of_truth, [
			"https://example.image",
		]);

		return JSON.stringify(result);
	},
	scorers: [Factuality, Levenshtein],
});

evalite("ICA - Nora Turato: pool7", {
	data: async () => [
		{
			input: "",
			expected: JSON.stringify({
				private_view: {
					private_view_start_date: null,
					private_view_end_date: null,
				},
				start_and_end_date: {
					start_date: "2025-06-05",
					end_date: "2025-06-06",
				},
				featured_artists: ["Nora Turato"],
				exhibition_name: "Nora Turato: pool7",
				image_urls: ["https://example.image"],
				details: `
        In arresting live performances, Nora Turato channels the defining currents of shared culture today. Her work culls from the language of the zeitgeist and rehearses its cadences and variances with a resolute devotion to picking out the subtexts, failures, and pleasures in communication. Commanding an audience alone on stage, in often hour-long monologues that have been committed to memory, her performances are a study in tone, pitch, delivery and gesture.

        Over two dates, Turato presents an all-new performance which forms part of her solo exhibition at ICA. This newest work is stripped down and raw; Turato enacts pool7 on the level of her body and voice.

        With this work, Turato confronts a collective disembodiment, a cultural obsession with surface image that disregards the body and emotion. Reflexive and guttural responses – such as cries, screams or sobs – are incorporated alongside Turato’s original writing, tapping into reactions we suppress with age and conditionally reserve for exceptional pain, danger, grief or ecstasy. In pool7 she introduces an improvised way of shaping the performance, deviating from its script-based predecessors.
        `,
				is_ticketed: true,
			}),
		},
	],
	task: async () => {
		const scraper = new EventScraper();
		const result = await scraper.extract_event(nora_source_of_truth, [
			"https://example.image",
		]);
		return JSON.stringify(result);
	},
	scorers: [Factuality, Levenshtein],
});

evalite("Richard Saltoun - A Leap of Sympathy", {
	data: async () => [
		{
			input: "",
			expected: JSON.stringify({
				private_view: {
					private_view_start_date: "2025-05-15T18:30:00.000Z",
					private_view_end_date: "2025-05-15T20:30:00.000Z",
				},
				start_and_end_date: {
					start_date: "2025-05-15",
					end_date: "2025-06-24",
				},
				featured_artists: [
					"Anna Perach",
					"Laima Leyton",
					"Jody Deschutter",
					"Luigi Ambrosio",
					"Maria Sole Montacci",
				],
				exhibition_name: "A Leap of Sympathy",
				image_urls: ["https://example.image"],
				details: `
Richard Saltoun Gallery is pleased to present A Leap of Sympathy, the inaugural solo exhibition by London-based artist Anna PERACH (b. 1985, Zaporizhzhia) at the gallery, whose first UK institutional solo exhibition was on view at Gasworks in London last year. The exhibition title draws from philosopher Henri Bergson, who emphasized intuition and lived experience over strict rationalism in our understanding of reality. Bergson suggests that, since we cannot empirically prove another person’s internal experience, we must take a ‘leap of sympathy’—a leap of trust—to relate to them. This idea finds resonance in Perach’s exhibition, unfolding across the gallery’s three spaces like the chapters of a storybook, and bringing together a new body of tufted sculptures, drawings and glass sculptures. These works continue the artist’s investigation into the intersections of the psyche, gender, and identity through the primary medium of textiles—traditionally associated with the feminine and the domestic. A Leap of Sympathy was developed in conjunction with East Gallery in Norwich, where it will travel for an institutional solo exhibition in September 2025.

Perach’s sculptures thread the line between the beautiful and ornamental as well as the grotesque and eerie, challenging the boundaries between fine art and craft. Using tufting, a traditional and labor-intensive textile technique, the artist reimagines archetypes as hybrid forms that question prevailing cultural myths surrounding gender. Central to Perach’s practice is an exploration of the “monstrous” body—a concept that feminist theorist Donna Haraway uses to imagine new, counter-hegemonic forms of existence, adaptation and imagination in a fractured world. Thus, vilified female archetypes—such as witches and monsters, figures often marginalized for transgressing social norms—are frequently Perach’s protagonists, through whom she reflects on contemporary societal perceptions of femininity and otherness.

Such reflections are encapsulated in the work Olimpia, the focal point of the exhibition. The installation features two large-scale feminine sculptures in rococo inspired dresses: one is a wearable piece, activated by a performer, while the other is controlled by a clockwork structure operated from within the wearable sculpture. This marks the very first time the artist is using robotics in her work. In Olimpia, she looks at the historical casting of the feminine form as frivolous, overly emotional  and unruly, threatening religious and scientific categorization. As a result, it has been subjugated and coerced into alignment with the dominant narratives of each era. Perach draws connections between these Western systems of control and their impact on the female body, reflecting on what our contemporary attitudes reveal about broader societal anxieties and fantasies.

Inspired by E.T.A. Hoffmann’s Gothic fiction The Tales of Hoffmann, Olimpia takes its name from the automaton Olimpia, who becomes the object of a young man’s obsessive desire, as he believes her to be a real woman. Her mechanical nature is ultimately exposed during a violent struggle between her creators, which leads to her destruction. Perach focuses on the moment when Olimpia is first introduced to society by singing an area at a ball. She interprets Olimpia and Clara—two central figures in Hoffmann’s story—as representations of the self’s divided nature: Clara embodies societal norms of logic, while Olimpia represents the repressed, chaotic aspects subjected to patriarchal control. These tensions, and the relationship between the two figures and the viewer will be explored in two performances; during on the opening night of the exhibition (Thursday, 15 May | 6pm) and during London Gallery Weekend (Friday, 6 June 2025 | 5PM), incorporating live music, vocal elements and choreographed movement.

This work also draws from psychoanalytic theory, particularly Freud’s notion of the doppelgänger, which he describes as a mechanism that enables the repression of unbearable psychic content by splitting the self. Though seemingly forgotten, the repressed inevitably resurfaces, exposing a “monstrous truth” that was always present. Through Olimpia, Perach examines what threatening, suppressed content the female body might hold—and what happens when it inevitably emerges. The work also engages with the psychological rupture that occurs when one’s perception of what is human is disrupted. In Hoffmann’s tale, Nathaniel experiences a psychotic breakdown when Olimpia is revealed to be a machine, her humanity an illusion. The “leap of sympathy” he extended to her—his belief in her ability to feel and experience as he does—shatters, turning Olimpia into a “monster” in his eyes and, in turn, making him monstrous. As Perach explains, “That is part of what I want the audience to experience during the performance—questioning what is inhabited by a human and is like them, and what is operated by a machine.”

This central piece is complemented by a series of drawings that depict fragments of Olimpia’s story, adding further context and narrative depth to both the sculptural work and the exhibition as a whole.

Another key body of work, The Uncanny Valley, comprises twelve tufted heads mounted on wooden structures, forming a macabre procession that guides viewers through the gallery. Many of these heads play on the idea of the gaze, featuring additional eyes, a single oversized eye, no eyes at all, or even zippered eyes—playing with the tension between visibility and concealment, perception and illusion. Inspired by the severed heads that surround Baba Yaga’s house in the Russian folktale Vasilisa the Beautiful, the work engages with themes of identity and transformation. Perach’s tufting technique imbues each head with a distinct yet eerily familiar presence, rendering them vessels of cultural memory while evoking the unsettling sensation of the uncanny valley—a term coined by Japanese roboticist Masahiro Mori in 1970 to describe the discomfort experienced when encountering a figure that appears almost human, yet disturbingly not quite.

While Olimpia and The Uncanny Valley explore external skins, Perach’s two new glass sculptures shift focus to the body’s underlying anatomical structure. Continuing her engagement with glass as a material, these works take the form of two life-sized human ribcages—one featuring flayed, skin-like elements suspended from its frame—intensifying the tension between interior and exterior, exposure and concealment.

As articulated by Lauren Elkin in Art Monsters, the “art monster” is a figure who “reaches after the truth of her own body,” “takes for granted that the experiences of female embodiment are relevant to all humankind,” and “alerts us to what is outside of language.” Perach’s work similarly interrogates the thresholds between internal and external worlds, psyche and performance, examining how identity is shaped by the unseen and the repressed. A Leap of Sympathy furthers the artist’s exploration of how personal and cultural myths continue to shape perceptions of gender and identity, as well as the tensions between dominant Modernist “rational” thought and more speculative, magical approaches to interpreting and evolving within contemporary reality.`,
				is_ticketed: true,
			}),
		},
	],
	task: async () => {
		const scraper = new EventScraper();
		const result = await scraper.extract_event(
			a_leap_of_sympathy_source_of_truth,
			["https://example.image"],
		);
		return JSON.stringify(result);
	},
	scorers: [Factuality, Levenshtein],
});

// added way more details here than what the llm current returns
evalite("Workplace - A Leap of Sympathy", {
	data: async () => [
		{
			input: "",
			expected: JSON.stringify({
				private_view: {
					private_view_start_date: null,
					private_view_end_date: null,
				},
				start_and_end_date: {
					start_date: "2025-03-28",
					end_date: "2025-05-03",
				},
				featured_artists: ["James Cabaniuk"],
				exhibition_name: "I Don't Know What's Come Over Me",
				image_urls: ["https://example.image"],
				details: `
Workplace is pleased to present James Cabaniuk’s first solo exhibition with the gallery I Don’t Know What’s Come Over Me.

The exhibition features a new series of paintings that reflect the nuanced, complex, and often paradoxical experiences of queer identity, intimacy, and the subversive joy that comes with embracing personal and communal chaos.

Cabaniuk’s new body of work is a deep investigation into queer communications hidden in plain sight messaging. Drawing from a history of veiled signalling, from violets to the hanky code, Cabaniuk’s work reflects a unique way of communicating through metaphor, gesture, and abstraction.

The title of the exhibition, I Don’t Know What’s Come Over Me, resonates with this duality, speaking both to the sudden surge of emotion that can overwhelm, as well as the cultural pressure to suppress or judge these responses as ‘unbecoming’. Through a carefully orchestrated visual language, Cabaniuk interrogates how the queer body, often caught in tumultuous spirals of identity and expression, has been forced to reconcile with societal expectations. Their paintings confront the messy beauty of being overwhelmed, by desire, loss, and joy, and the liberating chaos that allows one to emerge stronger and more self-aware.

The works presented are both deeply personal responses as well as part of a larger commentary on queer temporalities and the absence of these histories in traditional spaces of culture. The paintings offer a topographical view of Cabaniuk’s experience, simultaneously micro and macro in scope, where the details of personal anecdotes blur into the larger, shared narrative of queer communities.

With thick gestural surfaces that often employ glitter, confetti and soil, the works speak to the queer opacity of experience, where meaning is buried in the layers of colour, shape, and form. The paintings exist in a liminal space between abstraction and figuration, a zone where meaning is not fixed, but constantly shifting and evolving. The works are a celebration of the resilience that comes from chaos, and the moments of kinship that form between individuals in unexpected spaces.`,
				is_ticketed: false,
			}),
		},
	],
	task: async () => {
		const scraper = new EventScraper();
		const result = await scraper.extract_event(
			i_dont_know_whats_come_over_me_source_of_truth,
			["https://example.image"],
		);
		console.log("worplace result:", JSON.stringify(result));
		return JSON.stringify(result);
	},
	scorers: [Factuality, Levenshtein],
});

evalite("The artist room - Søren Arildsen: In the Seams", {
	data: async () => [
		{
			input: "",
			expected: JSON.stringify({
				private_view: {
					private_view_start_date: null,
					private_view_end_date: null,
				},
				start_and_end_date: {
					start_date: "2025-03-27",
					end_date: "2025-04-25",
				},
				featured_artists: ["Søren Arildsen"],
				exhibition_name: "In the Seams",
				image_urls: ["https://example.image"],
				details:
					"The Artist Room presents In the Seams, a solo exhibition by Søren Arildsen (b. 1996) and his first in the UK. The show features a new series of oil paintings on canvas set in artist-made porcelain frames, as well as ceramic paintings mounted in treated wood. Arildsen’s work explores how memories take shape, blending reality with recollection and daydreams. While rooted in figuration, his use of materials and process creates a shifting quality, as if the images are drifting in and out of focus, leading the viewer to somewhere between the real and the imagined. The exhibition runs from 27th March to 25th April.",
				is_ticketed: false,
			}),
		},
	],
	task: async () => {
		const scraper = new EventScraper();
		const result = await scraper.extract_event(
			søren_arildsen_in_the_seams_source_of_truth,
			["https://example.image"],
		);

		console.log("result soren:", JSON.stringify(result));
		return JSON.stringify(result);
	},
	scorers: [Factuality, Levenshtein],
});
