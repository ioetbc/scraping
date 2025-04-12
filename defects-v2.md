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
[] softopening ominous presents was not collected cause it extracted the wrong end date and thought it had ended
[] same with The Moving Eye Cannot See old did not collect it from sid motion gallery

## Private viewings
[] https://www.richardsaltoun.com/exhibitions/140-anna-perach-a-leap-of-sympathy/ 18:30 - 20:30 but scraped as 18:00 - 20:00

[] Animula https://xxijrahii.net/frieze-london-2024/ No idea why this is collected
