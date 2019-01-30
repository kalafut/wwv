[← back to listening](/index.html)

## What is this?
This site attempts to emulate the audio portion of stations WWV and WWVH. It should sound much like what you’d hear if you tuned in a shortwave radio to one of these stations. Each station has its own style of tones and voice time announcements. Station identification ([WWV](http://wwv.mcodes.org/clips/v_ident.mp3), [WWVH](http://wwv.mcodes.org/clips/h_ident.mp3)) is every half hour.

This is only an emulation, using your computer's time and samples of the audio. It is not a rebroadcast of the real stations. 

## What is WWV?
[WWV](https://en.wikipedia.org/wiki/WWV_(radio_station) ) is a radio station run by the National Institute of Standards and Technology ([NIST](https://en.wikipedia.org/wiki/National_Institute_of_Standards_and_Technology)) that broadcasts precise time and frequency from Fort Collins, CO. A companion station,WWVH, provides a similar service from Kauai, HI. The time sources are highly accurate atomic clocks. These broadcasts contain an audible portion (which this site emulates), and a [digital time code](https://en.wikipedia.org/wiki/WWV_(radio_station)#Digital_time_code) that can be received by clocks and watches for automatically maintaining precise time.

WWV has operated continuously since 1919, but its future is in doubt due to [proposed budget cuts](https://www.voanews.com/a/time-may-be-running-out-for-millions-of-clocks/4554376.html) which could shutter the stations.

## Why make this site?
I have fond memories of WWV being one of the first stations I picked up when I got my ham radio license many years ago. It was one of the few that could nearly always be picked up on _some_ frequency, even during poor propagation. When conditions were good, sometimes I could also hear WWVH (Hawaii → Chicago _is_ a bit of haul).  Besides just tuning it in, I actually liked having it on while doing my homework! The steady pulses, curious patterns of tones, and old-timey timbre of the occasional voice announcements made for nice background noise.

WWV has never (to my knowledge) been streamed over the internet. There are many [sample recordings](https://www.youtube.com/results?search_query=wwv) available, but nothing that just runs and reflects the current time. Creating a simulated WWV website has been on my "someday" project list
for a long time, but the threat of WWV/H being shut down provided serious motivation to make it a reality.  Even if NIST does power down the amplifiers, this site can still provide a reasonable representation of what those iconic stations sounded like.

## How Accurate is It?
Time-wise, this site is exactly as (in)accurate as your computer or phone clock currently is.  As far as how well it matches the real WWV/H transmissions, my goal has been to mimic the audio portion as closely as reasonably possible. The stations have [distinct patterns](https://en.wikipedia.org/wiki/WWV_(radio_station)#Broadcast_format) of pulses, tones, and voice announcements which have been implemented. The simulation includes all of the elements except for real-time voice announcements, such as space weather reports, and some really esoteric things like special adjustments for leap seconds. If you find an error, let me know!

Note: if you're listening with bluetooth headphones, the pulses and clock might be slightly out of sync. Furthermore, if the browser tab isn't active, timing can become skewed (browser dependent).

## Implementation
The voice announcements were obtained from the telephone time service that NIST provides. This laborious process involved recording and an editing (e.g. removing time pulses) hundreds of calls. Calls were made with Google Hangouts, and all editing was done in Audacity.  A [small program](https://github.com/kalafut/wwv/tree/master/wwv_tones) was written to generate the tones and pulses according to the NIST specification.

The application itself is entirely in Javascript. It leans heavily on the excellent [Howler](https://howlerjs.com/) and [Driftless](https://github.com/dbkaplun/driftless) libraries to accurately sequence the audio clips.

## Todo
I’m happy with the site as is but there are a few areas of improvement:

* Some audio clips could be better. Either the original recording wasn't very good or the the pulse-removal editing doesn't sound right. Fortunately, the standard is pretty low since listening to WWV on shortwave was hardly ever CD-quality for most people 🙂.
* I'd like more/better background photos. The one of WWVH in particular is very low resolution but was the only decent one of the antenna field that I found. If you have others, let me know!

## Contact
If you have any questions, bug reports or improvements, the [Github project](https://github.com/kalafut/wwv) is the best place to reach me.
