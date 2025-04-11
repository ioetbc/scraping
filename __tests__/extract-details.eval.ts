import { Factuality, Levenshtein } from "autoevals";
import { evalite } from "evalite";

import { EventScraper } from "../services/event-scraper.js";

import dotenv from "dotenv";
import { extract_event_details_prompt } from "../prompts/extract-event-details-prompt.js";

dotenv.config();

const a_leap_of_sympathy = `
  markdown Title: Anna Perach | 15 May - 24 June 2025

  URL Source: https://www.richardsaltoun.com/exhibitions/140-anna-perach-a-leap-of-sympathy/

  Markdown Content:
  #### peformance: Thursday, 15 May | 6pm | [](https://www.richardsaltoun.com/exhibitions/140-anna-perach-a-leap-of-sympathy/richardsaltoungallery.artsvp.com/c8667f)[rsvp essential](https://richardsaltoungallery.artsvp.com/c8667f) [](https://richardsaltoungallery.artsvp.com/c8667f)[](https://www.richardsaltoun.com/exhibitions/140-anna-perach-a-leap-of-sympathy/richardsaltoungallery.artsvp.com/c8667f)

  Laima Leyton- composer and artist
  Jody Deschutter- sound assistant
  Luigi Ambrosio- choreographer
  Maria Sole Montacci- performer

  #### opening reception: 6:30–8:30pm

  Richard Saltoun Gallery is pleased to present _A Leap of Sympathy__,_ the inaugural solo exhibition by London-based artist [**Anna PERACH**](https://www.richardsaltoun.com/artists/962-anna-perach/biography/) (b. 1985, Zaporizhzhia) at the gallery, whose first UK institutional solo exhibition was on view at Gasworks in London last year. The exhibition title draws from philosopher Henri Bergson, who emphasized intuition and lived experience over strict rationalism in our understanding of reality. Bergson suggests that, since we cannot empirically prove another person’s internal experience, we must take a ‘leap of sympathy’—a leap of trust—to relate to them. This idea finds resonance in Perach’s exhibition, unfolding across the gallery’s three spaces like the chapters of a storybook, and bringing together a new body of tufted sculptures, drawings and glass sculptures. These works continue the artist’s investigation into the intersections of the psyche, gender, and identity through the primary medium of textiles—traditionally associated with the feminine and the domestic. Following the gallery show, _A Leap of Sympathy_ was developed in conjunction with East Gallery in Norwich, where it will travel for an institutional solo exhibition in September 2025.

  Perach’s sculptures thread the line between the beautiful and ornamental as well as the grotesque and eerie, challenging the boundaries between fine art and craft. Using tufting, a traditional and labor-intensive textile technique, the artist reimagines archetypes as hybrid forms that question prevailing cultural myths surrounding gender. Central to Perach’s practice is an exploration of the “monstrous” body—a concept that feminist theorist Donna Haraway uses to imagine new, counter-hegemonic forms of existence, adaptation and imagination in a fractured world. Thus, vilified female archetypes—such as witches and monsters, figures often marginalized for transgressing social norms—are frequently Perach’s protagonists, through whom she reflects on contemporary societal perceptions of femininity and otherness.

  Such reflections are encapsulated in the work _Olimpia_, the focal point of the exhibition. The installation features two large-scale feminine sculptures in rococo inspired dresses: one is a wearable piece, activated by a performer, while the other is controlled by a clockwork structure operated from within the wearable sculpture. This marks the very first time the artist is using robotics in her work. In _Olimpia_, she looks at the historical casting of the feminine form as frivolous, overly emotional  and unruly, threatening religious and scientific categorization. As a result, it has been subjugated and coerced into alignment with the dominant narratives of each era. Perach draws connections between these Western systems of control and their impact on the female body, reflecting on what our contemporary attitudes reveal about broader societal anxieties and fantasies.

  Inspired by E.T.A. Hoffmann’s Gothic fiction _The Tales of Hoffmann_, Olimpia takes its name from the automaton Olimpia, who becomes the object of a young man’s obsessive desire, as he believes her to be a real woman. Her mechanical nature is ultimately exposed during a violent struggle between her creators, which leads to her destruction. Perach focuses on the moment when Olimpia is first introduced to society by singing an area at a ball. She interprets Olimpia and Clara—two central figures in Hoffmann’s story—as representations of the self’s divided nature: Clara embodies societal norms of logic, while Olimpia represents the repressed, chaotic aspects subjected to patriarchal control. These tensions, and the relationship between the two figures and the viewer will be explored in a performance during London Gallery Weekend (Friday, 6 June 2025), incorporating live music, vocal elements and choreographed movement.

  This work also draws from psychoanalytic theory, particularly Freud’s notion of the doppelgänger, which he describes as a mechanism that enables the repression of unbearable psychic content by splitting the self. Though seemingly forgotten, the repressed inevitably resurfaces, exposing a “monstrous truth” that was always present. Through _Olimpia_, Perach examines what threatening, suppressed content the female body might hold—and what happens when it inevitably emerges. The work also engages with the psychological rupture that occurs when one’s perception of what is human is disrupted. In Hoffmann’s tale, Nathaniel experiences a psychotic breakdown when Olimpia is revealed to be a machine, her humanity an illusion. The “leap of sympathy” he extended to her—his belief in her ability to feel and experience as he does—shatters, turning Olimpia into a “monster” in his eyes and, in turn, making him monstrous. As Perach explains, “That is part of what I want the audience to experience during the performance—questioning what is inhabited by a human and is like them, and what is operated by a machine.”

  This central piece is complemented by a series of drawings that depict fragments of Olimpia’s story, adding further context and narrative depth to both the sculptural work and the exhibition as a whole.

  Another key body of work, _The Uncanny Valley_, comprises twelve tufted heads mounted on wooden structures, forming a macabre procession that guides viewers through the gallery. Many of these heads play on the idea of the gaze, featuring additional eyes, a single oversized eye, no eyes at all, or even zippered eyes—playing with the tension between visibility and concealment, perception and illusion. Inspired by the severed heads that surround Baba Yaga’s house in the Russian folktale Vasilisa the Beautiful, the work engages with themes of identity and transformation. Perach’s tufting technique imbues each head with a distinct yet eerily familiar presence, rendering them vessels of cultural memory while evoking the unsettling sensation of the uncanny valley—a term coined by Japanese roboticist Masahiro Mori in 1970 to describe the discomfort experienced when encountering a figure that appears almost human, yet disturbingly not quite.

  While _Olimpia_ and _The Uncanny Valley_ explore external skins, Perach’s two new glass sculptures shift focus to the body’s underlying anatomical structure. Continuing her engagement with glass as a material, these works take the form of two life-sized human ribcages—one featuring flayed, skin-like elements suspended from its frame—intensifying the tension between interior and exterior, exposure and concealment.

  As articulated by Lauren Elkin in _Art Monsters_, the “art monster” is a figure who “reaches after the truth of her own body,” “takes for granted that the experiences of female embodiment are relevant to all humankind,” and “alerts us to what is outside of language.” Perach’s work similarly interrogates the thresholds between internal and external worlds, psyche and performance, examining how identity is shaped by the unseen and the repressed. _A Leap of Sympathy_ furthers the artist’s exploration of how personal and cultural myths continue to shape perceptions of gender and identity, as well as the tensions between dominant Modernist “rational” thought and more speculative, magical approaches to interpreting and evolving within contemporary reality.

  For sales enquiries, please email: [sales@richardsaltoun.com](mailto:sales@richardsaltoun.com)

  For press enquiries, please email: [sonja@richardsaltoun.com](mailto:%20sonja@richardsaltoun.com)
`;

const { user_prompt } = extract_event_details_prompt({
  page_text: a_leap_of_sympathy,
});

evalite("Extract private view times", {
  data: async () => [
    {
      input: user_prompt,
      expected: JSON.stringify({
        private_view_start_date: "2025-05-15T18:30:00.000Z",
        private_view_end_date: "2025-05-15T20:30:00.000Z",
      }),
    },
  ],
  task: async (input) => {
    const scraper = new EventScraper();
    const result = await scraper.extract_details(a_leap_of_sympathy);

    return JSON.stringify({
      private_view_start_date: result?.private_view_start_date,
      private_view_end_date: result?.private_view_end_date,
    });
  },
  scorers: [Factuality, Levenshtein],
});

// evalite("Extract event details", {
//   data: async () => [
//     {
//       input: user_prompt,
//       expected: JSON.stringify({
//         exhibition_name: "A Leap of Sympathy",
//         start_date: "2025-05-15",
//         end_date: "2025-06-24",
//         private_view_start_date: "2025-05-15T18:00:00.000Z",
//         private_view_end_date: "2025-05-15T20:00:00.000Z",
//         featured_artists: [
//           "Anna Perach",
//           "Laima Layton",
//           "Jody Deschutter",
//           "Luigi Ambrosio",
//           "Maria Sole Montacci",
//         ],
//         info: "Richard Saltoun Gallery is pleased to present A Leap of Sympathy, the inaugural solo exhibition by London-based artist Anna PERACH (b. 1985, Zaporizhzhia) at the gallery, whose first UK institutional solo exhibition was on view at Gasworks in London last year. The exhibition title draws from philosopher Henri Bergson, who emphasized intuition and lived experience over strict rationalism in our understanding of reality. Bergson suggests that, since we cannot empirically prove another person’s internal experience, we must take a ‘leap of sympathy’—a leap of trust—to relate to them. This idea finds resonance in Perach’s exhibition, unfolding across the gallery’s three spaces like the chapters of a storybook, and bringing together a new body of tufted sculptures, drawings and glass sculptures. These works continue the artist’s investigation into the intersections of the psyche, gender, and identity through the primary medium of textiles—traditionally associated with the feminine and the domestic. Following the gallery show, A Leap of Sympathy was developed in conjunction with East Gallery in Norwich, where it will travel for an institutional solo exhibition in September 2025. Perach’s sculptures thread the line between the beautiful and ornamental as well as the grotesque and eerie, challenging the boundaries between fine art and craft. Using tufting, a traditional and labor-intensive textile technique, the artist reimagines archetypes as hybrid forms that question prevailing cultural myths surrounding gender. Central to Perach’s practice is an exploration of the “monstrous” body—a concept that feminist theorist Donna Haraway uses to imagine new, counter-hegemonic forms of existence, adaptation and imagination in a fractured world. Thus, vilified female archetypes—such as witches and monsters, figures often marginalized for transgressing social norms—are frequently Perach’s protagonists, through whom she reflects on contemporary societal perceptions of femininity and otherness. Such reflections are encapsulated in the work Olimpia, the focal point of the exhibition. The installation features two large-scale feminine sculptures in rococo inspired dresses: one is a wearable piece, activated by a performer, while the other is controlled by a clockwork structure operated from within the wearable sculpture. This marks the very first time the artist is using robotics in her work. In Olimpia, she looks at the historical casting of the feminine form as frivolous, overly emotional and unruly, threatening religious and scientific categorization. As a result, it has been subjugated and coerced into alignment with the dominant narratives of each era. Perach draws connections between these Western systems of control and their impact on the female body, reflecting on what our contemporary attitudes reveal about broader societal anxieties and fantasies. Inspired by E.T.A. Hoffmann’s Gothic fiction The Tales of Hoffmann, Olimpia takes its name from the automaton Olimpia, who becomes the object of a young man’s obsessive desire, as he believes her to be a real woman. Her mechanical nature is ultimately exposed during a violent struggle between her creators, which leads to her destruction. Perach focuses on the moment when Olimpia is first introduced to society by singing an area at a ball. She interprets Olimpia and Clara—two central figures in Hoffmann’s story—as representations of the self’s divided nature: Clara embodies societal norms of logic, while Olimpia represents the repressed, chaotic aspects subjected to patriarchal control. These tensions, and the relationship between the two figures and the viewer will be explored in a performance during London Gallery Weekend (Friday, 6 June 2025), incorporating live music, vocal elements and choreographed movement. This work also draws from psychoanalytic theory, particularly Freud’s notion of the doppelgänger, which he describes as a mechanism that enables the repression of unbearable psychic content by splitting the self. Though seemingly forgotten, the repressed inevitably resurfaces, exposing a “monstrous truth” that was always present. Through Olimpia, Perach examines what threatening, suppressed content the female body might hold—and what happens when it inevitably emerges. The work also engages with the psychological rupture that occurs when one’s perception of what is human is disrupted. In Hoffmann’s tale, Nathaniel experiences a psychotic breakdown when Olimpia is revealed to be a machine, her humanity an illusion. The “leap of sympathy” he extended to her—his belief in her ability to feel and experience as he does—shatters, turning Olimpia into a “monster” in his eyes and, in turn, making him monstrous. As Perach explains, “That is part of what I want the audience to experience during the performance—questioning what is inhabited by a human and is like them, and what is operated by a machine.” This central piece is complemented by a series of drawings that depict fragments of Olimpia’s story, adding further context and narrative depth to both the sculptural work and the exhibition as a whole. Another key body of work, The Uncanny Valley, comprises twelve tufted heads mounted on wooden structures, forming a macabre procession that guides viewers through the gallery. Many of these heads play on the idea of the gaze, featuring additional eyes, a single oversized eye, no eyes at all, or even zippered eyes—playing with the tension between visibility and concealment, perception and illusion. Inspired by the severed heads that surround Baba Yaga’s house in the Russian folktale Vasilisa the Beautiful, the work engages with themes of identity and transformation. Perach’s tufting technique imbues each head with a distinct yet eerily familiar presence, rendering them vessels of cultural memory while evoking the unsettling sensation of the uncanny valley—a term coined by Japanese roboticist Masahiro Mori in 1970 to describe the discomfort experienced when encountering a figure that appears almost human, yet disturbingly not quite. While Olimpia and The Uncanny Valley explore external skins, Perach’s two new glass sculptures shift focus to the body’s underlying anatomical structure. Continuing her engagement with glass as a material, these works take the form of two life-sized human ribcages—one featuring flayed, skin-like elements suspended from its frame—intensifying the tension between interior and exterior, exposure and concealment. As articulated by Lauren Elkin in Art Monsters, the “art monster” is a figure who “reaches after the truth of her own body,” “takes for granted that the experiences of female embodiment are relevant to all humankind,” and “alerts us to what is outside of language.” Perach’s work similarly interrogates the thresholds between internal and external worlds, psyche and performance, examining how identity is shaped by the unseen and the repressed. A Leap of Sympathy furthers the artist’s exploration of how personal and cultural myths continue to shape perceptions of gender and identity, as well as the tensions between dominant Modernist “rational” thought and more speculative, magical approaches to interpreting and evolving within contemporary reality.",
//         image_urls: [],
//         is_ticketed: true,
//       }),
//     },
//   ],
//   task: async (input) => {
//     const scraper = new EventScraper();
//     const result = await scraper.extract_details(source_of_truth_mock);

//     console.log("result", result);
//     return JSON.stringify(result);
//   },
//   scorers: [Factuality, Levenshtein],
// });
