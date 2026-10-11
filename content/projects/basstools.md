+++
template = "project.html"
title = "BassTools"
date = "2026-09-05"
[extra]
featured_blurb = "In-browser practice tools for bass: circle of fourths drills, generated sight reading, and call-and-response ear training."
link = "https://catchouli.github.io/BassTools/"
source_link = "https://github.com/catchouli/BassTools"
images = [
    "/images/projects/basstools/circle-of-fourths.jpg",
    "/images/projects/basstools/sight-reading.jpg",
    "/images/projects/basstools/call-response.jpg",
]
+++

BassTools is a little set of tools I made to help me practise bass. They run entirely in your browser, so there's nothing to install, and nothing gets recorded or sent anywhere. You can use them right now at <a href="https://catchouli.github.io/BassTools/">catchouli.github.io/BassTools</a>.

<!-- more -->

<h3 class="title is-3">What's in it</h3>

- **Circle of Fourths** loops you around all twelve keys in fourths against a metronome. It can play a drone, scales, modes or arpeggios, and you set the tempo and how many laps you want to do.
- **Sight Reading** generates a new line to read every time you press the button, in bass or treble clef. The lines are built from chord progressions, so they sound like actual basslines rather than random notes. A difficulty slider goes from whole notes up to some fairly busy stuff. It can play along with you, and you can export the line as a PNG to print.
- **Call & Response** is for ear training. It plays you a short phrase, gives you the same number of empty bars to play it back, then moves on to a new one, and keeps going until you stop it. It uses the same phrase generator as Sight Reading, locked to a single key.

It's all plain static HTML and JavaScript, so it'll happily run from a folder on your desktop too.
