import {Factuality, Levenshtein} from "autoevals";
import {evalite} from "evalite";
import {EventScraper} from "../services/event-scraper.js";

import {
  early_witness_source_of_truth,
  metamorphosis_source_of_truth,
  kiefer_source_of_truth,
  nora_source_of_truth,
  a_leap_of_sympathy_source_of_truth,
  i_dont_know_whats_come_over_me_source_of_truth,
} from "./mocks.js";

evalite("White Cube - Anselm Kiefer", {
  data: async () => [
    {
      input: "",
      expected: JSON.stringify({
        private_view: {
          private_view_start_date: null,
          private_view_end_date: null,
        },
        start_and_end_date: {start_date: "2025-06-25", end_date: "2025-08-16"},
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
        start_and_end_date: {start_date: "2025-04-23", end_date: "2025-06-08"},
        featured_artists: ["Antony Gormley"],
        exhibition_name: "WITNESS: Early Lead Works",
        image_urls: ["https://example.image"],
        details:
          "Antony Gormley\n\nWITNESS\nEarly Lead Works\n\n23 April – 8 June 2025\n\nLocation\nWhite Cube Mason’s Yard\n\n25 – 26 Mason's Yard\nLondon SW1Y 6BU\n\nExhibition Preview: 22 April 2025, 6–8 pm\n\nRepresenting a major breakthrough in the development of Antony Gormley’s visual language, the early lead works – initiated in the mid-1970s, and developed amid the protracted geopolitical tensions of the Cold War – stand among the most iconic of the artist’s career. ‘WITNESS: Early Lead Works’ reintroduces audiences to these seminal sculptures, tracing how Gormley’s early experimentations with the material laid the groundwork for many subsequent bodies of work.",
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
        start_and_end_date: {start_date: "2025-04-25", end_date: "2025-06-29"},
        featured_artists: ["Richard Hunt"],
        exhibition_name: "Metamorphosis – A Retrospective",
        image_urls: ["https://example.image"],
        details:
          "Metamorphosis – A Retrospective\n\n25 April – 29 June 2025\n\nThe first London retrospective of work by Richard Hunt (1935–2023), one of the foremost American sculptors of the 20th and 21st centuries, opens at White Cube Bermondsey in April 2025.\n\nOver a seven decade-long career, Hunt staged more than 170 solo shows and completed over 160 large-scale public sculpture commissions worldwide. In 1971, at the age of 35, he achieved a historic milestone as the first African American sculptor to receive a retrospective at New York’s MoMA.\n\nWorking predominantly in metal, Hunt was profoundly inspired by biological science and the natural world. His hybrid sculptures are characterised by dualities, that of the natural and the industrial, the surreal and the abstract, the geometric and the organic.\n\nThroughout his career, the late artist paid tribute to some of America’s greatest heroes in his work, including Martin Luther King Jr., Mary McLeod Bethune, Jesse Owens and Hobart Taylor Jr. In 2022, he was commissioned by Barack Obama to create a work for the Obama Presidential Centre, located in the artist’s hometown of Chicago.\n\nUPCOMING EVENT\n\nConversations: Mark Godfrey and Jon Ott on Richard Hunt\n\n5.30 – 6.30 pm\n24 April 2025\nWhite Cube Bermondsey\n\nTo celebrate the opening of Richard Hunt’s exhibition at White Cube Bermondsey, art historian, critic, and curator Mark Godfrey will join Richard Hunt's biographer, Jon Ott, in conversation from the gallery.",
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
        start_and_end_date: {start_date: "2025-06-05", end_date: "2025-06-06"},
        featured_artists: ["Nora Turato"],
        exhibition_name: "Nora Turato: pool7",
        image_urls: ["https://example.image"],
        details:
          "Nora Turato: pool7\nLive Performance\nExhibitions\n\nIn arresting live performances, Nora Turato channels the defining currents of shared culture today. Her work culls from the language of the zeitgeist and rehearses its cadences and variances with a resolute devotion to picking out the subtexts, failures, and pleasures in communication. Commanding an audience alone on stage, in often hour-long monologues that have been committed to memory, her performances are a study in tone, pitch, delivery and gesture.\n\nOver two dates, Turato presents an all-new performance which forms part of her solo exhibition at ICA. This newest work is stripped down and raw; Turato enacts pool7 on the level of her body and voice.\n\nWith this work, Turato confronts a collective disembodiment, a cultural obsession with surface image that disregards the body and emotion. Reflexive and guttural responses – such as cries, screams or sobs – are incorporated alongside Turato’s original writing, tapping into reactions we suppress with age and conditionally reserve for exceptional pain, danger, grief or ecstasy. In pool7 she introduces an improvised way of shaping the performance, deviating from its script-based predecessors.\n\nThursday 5 June, 7pm\n& Friday 6 June, 7pm\n\nICA Stage",
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
        start_and_end_date: {start_date: "2025-05-15", end_date: "2025-06-24"},
        featured_artists: [
          "Anna Perach",
          "Laima Leyton",
          "Jody Deschutter",
          "Luigi Ambrosio",
          "Maria Sole Montacci",
        ],
        exhibition_name: "A Leap of Sympathy",
        image_urls: ["https://example.image"],
        details:
          "Richard Saltoun Gallery is pleased to present _A Leap of Sympathy_, the inaugural solo exhibition by London-based artist Anna Perach (b. 1985, Zaporizhzhia) at the gallery, whose first UK institutional solo exhibition was on view at Gasworks in London last year. The exhibition title draws from philosopher Henri Bergson, who emphasized intuition and lived experience over strict rationalism in our understanding of reality. Bergson suggests that, since we cannot empirically prove another person’s internal experience, we must take a ‘leap of sympathy’—a leap of trust—to relate to them. This idea finds resonance in Perach’s exhibition, unfolding across the gallery’s three spaces like the chapters of a storybook, and bringing together a new body of tufted sculptures, drawings and glass sculptures. These works continue the artist’s investigation into the intersections of the psyche, gender, and identity through the primary medium of textiles—traditionally associated with the feminine and the domestic. Following the gallery show, _A Leap of Sympathy_ was developed in conjunction with East Gallery in Norwich, where it will travel for an institutional solo exhibition in September 2025.\n\nPerach’s sculptures thread the line between the beautiful and ornamental as well as the grotesque and eerie, challenging the boundaries between fine art and craft. Using tufting, a traditional and labor-intensive textile technique, the artist reimagines archetypes as hybrid forms that question prevailing cultural myths surrounding gender. Central to Perach’s practice is an exploration of the “monstrous” body—a concept that feminist theorist Donna Haraway uses to imagine new, counter-hegemonic forms of existence, adaptation and imagination in a fractured world. Thus, vilified female archetypes—such as witches and monsters, figures often marginalized for transgressing social norms—are frequently Perach’s protagonists, through whom she reflects on contemporary societal perceptions of femininity and otherness.\n\nSuch reflections are encapsulated in the work _Olimpia_, the focal point of the exhibition. The installation features two large-scale feminine sculptures in rococo inspired dresses: one is a wearable piece, activated by a performer, while the other is controlled by a clockwork structure operated from within the wearable sculpture. This marks the very first time the artist is using robotics in her work. In _Olimpia_, she looks at the historical casting of the feminine form as frivolous, overly emotional and unruly, threatening religious and scientific categorization. As a result, it has been subjugated and coerced into alignment with the dominant narratives of each era. Perach draws connections between these Western systems of control and their impact on the female body, reflecting on what our contemporary attitudes reveal about broader societal anxieties and fantasies.\n\nInspired by E.T.A. Hoffmann’s Gothic fiction _The Tales of Hoffmann_, Olimpia takes its name from the automaton Olimpia, who becomes the object of a young man’s obsessive desire, as he believes her to be a real woman. Her mechanical nature is ultimately exposed during a violent struggle between her creators, which leads to her destruction. Perach focuses on the moment when Olimpia is first introduced to society by singing an area at a ball. She interprets Olimpia and Clara—two central figures in Hoffmann’s story—as representations of the self’s divided nature: Clara embodies societal norms of logic, while Olimpia represents the repressed, chaotic aspects subjected to patriarchal control. These tensions, and the relationship between the two figures and the viewer will be explored in a performance during London Gallery Weekend (Friday, 6 June 2025), incorporating live music, vocal elements and choreographed movement.\n\nThis work also draws from psychoanalytic theory, particularly Freud’s notion of the doppelgänger, which he describes as a mechanism that enables the repression of unbearable psychic content by splitting the self. Though seemingly forgotten, the repressed inevitably resurfaces, exposing a “monstrous truth” that was always present. Through _Olimpia_, Perach examines what threatening, suppressed content the female body might hold—and what happens when it inevitably emerges. The work also engages with the psychological rupture that occurs when one’s perception of what is human is disrupted. In Hoffmann’s tale, Nathaniel experiences a psychotic breakdown when Olimpia is revealed to be a machine, her humanity an illusion. The “leap of sympathy” he extended to her—his belief in her ability to feel and experience as he does—shatters, turning Olimpia into a “monster” in his eyes and, in turn, making him monstrous. As Perach explains, “That is part of what I want the audience to experience during the performance—questioning what is inhabited by a human and is like them, and what is operated by a machine.”\n\nThis central piece is complemented by a series of drawings that depict fragments of Olimpia’s story, adding further context and narrative depth to both the sculptural work and the exhibition as a whole.\n\nAnother key body of work, _The Uncanny Valley_, comprises twelve tufted heads mounted on wooden structures, forming a macabre procession that guides viewers through the gallery. Many of these heads play on the idea of the gaze, featuring additional eyes, a single oversized eye, no eyes at all, or even zippered eyes—playing with the tension between visibility and concealment, perception and illusion. Inspired by the severed heads that surround Baba Yaga’s house in the Russian folktale Vasilisa the Beautiful, the work engages with themes of identity and transformation. Perach’s tufting technique imbues each head with a distinct yet eerily familiar presence, rendering them vessels of cultural memory while evoking the unsettling sensation of the uncanny valley—a term coined by Japanese roboticist Masahiro Mori in 1970 to describe the discomfort experienced when encountering a figure that appears almost human, yet disturbingly not quite.\n\nWhile _Olimpia_ and _The Uncanny Valley_ explore external skins, Perach’s two new glass sculptures shift focus to the body’s underlying anatomical structure. Continuing her engagement with glass as a material, these works take the form of two life-sized human ribcages—one featuring flayed, skin-like elements suspended from its frame—intensifying the tension between interior and exterior, exposure and concealment.\n\nAs articulated by Lauren Elkin in _Art Monsters_, the “art monster” is a figure who “reaches after the truth of her own body,” “takes for granted that the experiences of female embodiment are relevant to all humankind,” and “alerts us to what is outside of language.” Perach’s work similarly interrogates the thresholds between internal and external worlds, psyche and performance, examining how identity is shaped by the unseen and the repressed. _A Leap of Sympathy_ furthers the artist’s exploration of how personal and cultural myths continue to shape perceptions of gender and identity, as well as the tensions between dominant Modernist “rational” thought and more speculative, magical approaches to interpreting and evolving within contemporary reality.",
        is_ticketed: true,
      }),
    },
  ],
  task: async () => {
    const scraper = new EventScraper();
    const result = await scraper.extract_event(
      a_leap_of_sympathy_source_of_truth,
      ["https://example.image"]
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
        start_and_end_date: {start_date: "2025-03-28", end_date: "2025-05-03"},
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
      ["https://example.image"]
    );
    console.log("worplace result:", JSON.stringify(result));
    return JSON.stringify(result);
  },
  scorers: [Factuality, Levenshtein],
});
