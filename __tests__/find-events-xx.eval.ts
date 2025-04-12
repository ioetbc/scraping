import {Factuality, Levenshtein} from "autoevals";
import {evalite} from "evalite";
// import { traceAISDKModel } from "evalite/ai-sdk";
import {format} from "date-fns";

import {find_events_prompt} from "../prompts/find-events-prompt.js";

import {EventScraper} from "../services/event-scraper.js";

import dotenv from "dotenv";

dotenv.config();

const source_of_truth_mock = `
[![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/05/Xxijra-Hii_Logo_regular.png)](https://xxijrahii.net/)[![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/06/Xxijra-Hii_Logo_regular.png)](https://xxijrahii.net/)

![](https://xxijrahii.net/wp-content/uploads/2023/09/Xxijra-Hii_intro-mobile.png)![](https://xxijrahii.net/wp-content/uploads/2023/05/Xxijra-Hii_intro-1-4096x2048.png)

[Sign up for our mailing list here    ✉️](https://xxijrahii.net/category/news/)

[Sign up for our mailing list here    ✉️](https://xxijrahii.net/category/news/)

[Sign up for our mailing list here    ✉️](https://xxijrahii.net/category/news/)

[Sign up for our mailing list here    ✉️](https://xxijrahii.net/category/news/)

[Sign up for our mailing list here    ✉️](https://xxijrahii.net/category/news/)

[Sign up for our mailing list here    ✉️](https://xxijrahii.net/category/news/)

[Sign up for our mailing list here    ✉️](https://xxijrahii.net/category/news/)

[Sign up for our mailing list here    ✉️](https://xxijrahii.net/category/news/)

Current / Forthcoming

Categories

MM/YY

Year

NADA \| NEW YORK 2025

Exhibitions, Fairs

05/25

2025

PROSCENIUM

Exhibitions

04/25

2025

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2025/02/Matriarche-detail-min-4096x2856.jpg)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2025/04/holding-image-4096x2731.jpg)

Past Exhibitions

Categories

MM/YY

Year

MENINX

Past Exhibitions

03/25

2025

MORPHOGENESIS → GERTRUDE

Past Exhibitions

01/25

2025

INNER HEAT

Past Exhibitions

11/24

2024

A SHOW ABOUT IDEAS

Past Exhibitions

11/24

2024

FRIEZE \| LONDON 2024

Past Exhibitions, Past fairs

10/24

2024

FORUM

Past Exhibitions

10/24

2024

NIGHT VISIT

Past Exhibitions

08/24

2024

KITBASH

Past Exhibitions

07/24

2024

ART-O-RAMA \| MARSEILLE 2024

Past Exhibitions, Past fairs

08/24

2024

NADA \| NEW YORK 2024

Past Exhibitions, Past fairs

05/24

2024

UNHOMELY

Past Exhibitions

05/24

2024

HORNY, AIMLESS & ALONE

Past Exhibitions

03/24

2024

THIS BE THE VERSE

Past Exhibitions

12/23

2023

FIRST EDITION

Past Exhibitions

09/23

2023

PERFECT PASSIVE

Past Exhibitions

09/23

2023

MY BONE DUST IS FAINT CORAL

Past Exhibitions

08/23

2023

ANIMULA; MUD TIME FISSURES IN TETHERED DESCENT

Past Exhibitions

06/23

2023

BEAUTIFUL GIRLS ON TOP!

Past Exhibitions

06/23

2023

ANOCHE YO SOÑÉ NUESTRA MUERTE SIMULTÁNEA LAST NIGHT I DREAMED OUR SIMULTANEOUS DEATH

Past Exhibitions

05/23

2023

THE IMMERSIVE EXPERIENCE

Past Exhibitions

03/23

2023

3DCXP

Past Exhibitions

03/23

2023

EXTRA! EXTRA!

Past Exhibitions

12/22

2022

PORTALS

Past Exhibitions

10/22

2022

SKINFLICKS

Past Exhibitions

09/22

2022

THERE’S A FOUNTAIN FLOWING

Past Exhibitions

07/22

2022

COSMOSES

Past Exhibitions

07/22

2022

BROTHERS

Past Exhibitions

06/22

2022

CLICKERS

Past Exhibitions

04/22

2022

FLOWERS

Past Exhibitions

03/22

2022

MOTHER LODE

Past Exhibitions

01/22

2022

LUNATICS

Past Exhibitions

12/21

2021

BODY SURF

Past Exhibitions

10/21

2021

HDL

Past Exhibitions

08/21

2021

JOURNEYMAN

Past Exhibitions

07/21

2021

FLOATING HEADS

Past Exhibitions

06/21

2021

METRO

Past Exhibitions

04/21

2021

BETTER WEATHER

Past Exhibitions

04/21

2021

SIFT

Past Exhibitions

12/20

2020

MANCHESTER CONTEMPORARY \| MANCHESTER 2021

Past Exhibitions, Past fairs

11/21

2020

UP TO YOUR NECK IN MUD…

Past Exhibitions

10/20

2020

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2025/02/xx-9.jpg)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2025/01/xx_gertrude_-43.jpg)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2024/11/Goldsmiths-CCA-Laila-Majid-and-Louis-Blue-Newby-High-Res-50.jpg)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2024/11/glen-9.jpg)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2024/09/xx-66-4096x2730.jpg)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2024/09/xx-2-4096x2730.jpg)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2024/07/xx-12.jpg)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2024/06/chris-52-copy.jpg)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2024/06/Xxijrahii_Studiochapple-@-Art-O-Rama_Ph-Studio-Abbruzzese-1-copia.jpg)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2024/04/Right-tear.jpg)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2024/04/miche_.jpg)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2024/03/Forest_Inner_10.4k.0767.jpeg)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2024/01/2023-kira-freije-glen-pudvine-et-al-this-be-the-verse-xxijra-hii-05.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2024/05/First_edition_David_Micheud_Nick_Paton_21.jpg)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2023-aaron-ford-robin-megannity-perfect-passive-xxijra-hii-18.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2023-alexandra-searle-my-bone-dust-is-faint-coral-xxijra-hii-10.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2024/02/hannah-morgan-xxijra-hii-01.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2023-laila-majid-louis-blue-newby-beautiful-girls-on-top-xxijra-hii-01.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2023-estefania-b-flores-last-night-i-dreamed-our-simultaneous-death-xxijra-hii-21.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2023-luca-george-the-immersive-experience-xxijra-hii-04.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2023-achinoam-alon-fabian-hesse-mitra-wakil-ivo-rick-nicola-arthen-estefania-batista-flores-maria-joranko-kate-kuaimoku-3dcxp-xxijra-hii-01.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2022-zoe-spowage-extra-extra-xxijra-hii-1.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/glen-pudvine-xxijra-hii-27.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2022-laila-majid-louis-blue-newby-skinflicks-xxijra-hii-14.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2022-nikolai-azariah-theres-a-fountain-flowing-xxijra-hii-02.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2022-yuli-serfaty-chris-thompson-gillies-adamson-et-al-cosmoses-xxijra-hii-01.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2022-benjamin-cosmo-westoby-brothers-xxijra-hii-16.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2022-lewis-davidson-clickers-xxijra-hii-01.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2022-max-petts-robert-orr-flowers-xxijra-hii-03.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2022-holly-birtles-natalia-janula-mother-lode-xxijra-hii-04.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/david-micheaud-xxijra-hii-30.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2021-halsey-hathaway-body-surf-xxijra-hii-02.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2021-kavitha-balasingham-tom-bull-sihan-ling-maya-shoham-temitayo-shonibare-tiffany-wellington-hdl-xxijra-hii-3.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2021-sara-siguroardottir-journeyman-xxijra-hii-1.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2021-kate-atkin-floating-heads-xxijra-hii-02.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2021-stewart-cliff-metro-xxijra-hii-01.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2021-alex-williamson-better-weather-xxijra-hii-3.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2020-robert-pratt-sift-xxijra-hii-11.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/04/2021-kate-atkin-stewart-cliff-lewis-davidson-laila-majidlouis-newby-david-micheaud-the-manchester-contemporary-2021-xxijra-hii-13.webp)

![Xxijra Hii](https://xxijrahii.net/wp-content/uploads/2023/12/2020-holly-birtles-up-to-your-neck-in-mud-xxijra-hii-08.webp)
`;

const {system_prompt, user_prompt} = find_events_prompt({
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
