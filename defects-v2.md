I wonder if this would be more accurate if you had an LLM per property

[x] https://www.pipelinecontemporary.com/ (should go to homepage current url is specific exhibition)

[x] Let’s Get Some Air https://www.houldsworth.co.uk/exhibitions/160-katy-moran-lets-get-some-air/press_release_text/ private view

[x] A Leap of Sympathy Wrong private view timings 18:00 start time should be 18:30
[] https://ruupandform.com/exhibitions/forthcoming/#main_content all info here is null used the gallery name as the exhibition name

[x] The Moving Eye Cannot See https://sidmotiongallery.co.uk/exhibition/the-moving-eye-cannot-see/ private view timings are incorrect
[x] Second Skin https://sidmotiongallery.co.uk/exhibition/second-skin/ did not pick up the private view timings

## incorrect featured artists

[x] multiples of the same artist make them unique in the prompt https://www.richardsaltoun.com/exhibitions/140-anna-perach-a-leap-of-sympathy
[x] An Ominous Presence https://www.softopening.london/exhibitions/an-ominous-presence has the exhibition name as a featured artist
[x] $ID3FA££ $YNDR0M3 https://www.roseeaston.com/exhibitions/sidefall-syndrome Rose easton is one of the artists featured in the exhibition (gallery name should not be specified)

## Too many events collected (most of which are finished)

[x] https://www.roseeaston.com/exhibitions collects way too many events at the start, only collect events that are currently happening or fourthcoming

## Hangs forever

[] Whitechapel Gallery hangs forever after scraping

## Event already ended

[x] https://www.soupldn.com/eleni-papazoglou event ends tomorrow but has been blocked
[x] softopening ominous presents was not collected cause it extracted the wrong end date and thought it had ended
[x] same with The Moving Eye Cannot See old did not collect it from sid motion gallery

## Private viewings

[x] https://www.richardsaltoun.com/exhibitions/140-anna-perach-a-leap-of-sympathy/ 18:30 - 20:30 but scraped as 18:00 - 20:00
[x] Animula https://xxijrahii.net/frieze-london-2024/ No idea why this is collected

## V3

[] https://alisonjacques.com/exhibitions/maeve-gilmore exhibition name is wrong (might need to change the prompt to if use artist name if there is no explicitly set exhibition name, like in this case)
[] Aesthetic Amoralism https://www.aliceblackgallery.com/forthcoming-exhibitions/t83lfb3adywsqw0ooc6krpbvd248vh not enough info to obtain featured artists so has set to gallery name
[] Same here Figure in an Interior II this is the name of the painting I think the exhibition is the artists name https://www.theapproach.co.uk/exhibitions/jai-chuhan
[] Alternative Pedagogical Spaces: From Utopia to Institutionalization https://chisenhale.org.uk/whats-on/forum-20250501-1900/ (wrong exhibition name)

## Private view

[] Silent Running https://www.aliceamati.com/nicholas-marschner-solo-exhibition (no private view found)
tbf doesnt show it on the event details page yet, just in their stupid gif
[] Shizen https://www.alminerech.com/exhibitions/11024-lou-zhenggang-shizen (did not get Opening on Tuesday, April 22, 2025 from 6 to 8 pm)
[] Art Fictions Anthology 1 https://ascstudios.co.uk/events/art-fictions-anthology1-asc-gallery-2/ I think this was 2024 not 25 Marsuppium https://ascstudios.co.uk/events/marsuppium-asc-gallery/ same for this one

## Find events

[] Beers london ignored current exhibitions and picked up some old ones so nothing was recorded

## start & end date

[] https://www.annkakultys.com/exhibitions/banz-bowinkel-compositions/ - For some reason the exhibition details page does not have start and end dates. So if no start and end dates then use the dates from the find events query?
[] CACOTOPIA 09 | VR ILLUMINATED: MOVING IMAGE PERSPECTIVES https://www.annkakultys.com - Not picked up by find events scraper

[x] maxhetzler picks up 600 exhibitions and only returns one which does not exist!
[x] Workplace also seems to find 1million events
[] no images are found all of them are example.com
[] maxhetzler picks returns events outside of london
[] some of the images are tiny need to fix somehow
[] duplicate image urls (alice black) urls are unique because they have different file formats
[] alice black details url go to just an image
[] https://halesgallery.com/exhibitions/243-ken-kiff-the-national-gallery-project/ (opening reception)
[] example of blurry images The Way Forward: Derek Boshier and the Sixties
[] find event ignored (Morehshin Allahyari: Speculations on Capture) I dont think it knew it was in london gazelliarthouse.com
[] Wrong photos have been selected: https://gasworks.org.uk/exhibitions/ben-sakoguchi/
[] I think a few were missed here: https://gasworks.org.uk/events/
[] https://www.frithstreetgallery.com/exhibitions/235-cornelia-parker-history-painting/ doesn't include the entire press release
[] Also a good example of a blury photo: https://www.wilder.gallery/xanthe-burdett
[] https://www.workplace.art/exhibitions/i-dont-know-whats-come-over-me end date is 2nd but should be the 3rd
[] https://www.whitecube.com/gallery-exhibitions/antony-gormley-masons-yard-2025 Did not collect any images
[x] https://www.whitecube.com/gallery-exhibitions/richard-hunt-bermondsey-2025 Martin luther king is named as a featured artist (it is a solo show)
[x] https://www.whitecube.com/gallery-exhibitions/anselm-kiefer-masons-yard-2025 - Exhibition name wrong, should just be the artists name: Kiefer / Van Gogh > Anselm Kiefer. Also no image found
[] https://www.whitecube.com/gallery-exhibitions/sara-flores-bermondsey-2025-2 - Bakish Mai is the name of the show not the featured artist. Also no image found.
[]
