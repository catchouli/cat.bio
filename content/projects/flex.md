+++
template = "project.html"
title = "Flex"
date = "2026-10-09"
[extra]
featured_blurb = "A blazing fast, fully local media player and organiser in Rust, built to be driven from the sofa with a TV remote. Because Plex was too slow."
source_link = "https://github.com/catchouli/flex"
download_link = "https://github.com/catchouli/flex/releases/latest"
images = [
    "/images/projects/flex/home.jpg",
    "/images/projects/flex/anime.jpg",
    "/images/projects/flex/show.jpg",
]
+++

Flex is a media player and organiser for your TV PC. It scans your local libraries (folders or mounted drives), sorts everything into Movies, Shows and Anime, and gets out of your way. I got fed up with how sluggish Plex is on my TV PC, so I wrote my own. Flex opens instantly and stays snappy even with tens of thousands of videos. It runs entirely locally, with no server to set up and no account to sign into.

<!-- more -->

<h3 class="title is-3">Made for the couch</h3>

The whole thing is designed to be driven with a TV remote. Arrows, OK and Back are all you need: hold OK for more options, hold Back to quit, and play/pause, stop and next/previous work if your remote has them. A keyboard and mouse work fine too, but the remote is the point.

<h3 class="title is-3">What it does</h3>

- **Library scanning.** Point it at your folders, say whether each one is Movies, TV or Anime, and it works out what everything is, including seasons and episodes.
- **Metadata.** Give it a free TMDB token and it pulls in posters, descriptions and episode names. If something gets matched to the wrong show, you can fix it with "Match online…" or rearrange things with "Folders & seasons…".
- **Plex import.** If you're coming from Plex, it can read your existing Plex database and bring your watch history across, so you don't lose your place in anything.
- **Playback** goes through libmpv, so if mpv can play it, so can Flex.

<h3 class="title is-3">Under the hood</h3>

It's written in Rust on top of libmpv. Deploying it is about as simple as it gets: on Windows you need `flex.exe` and `libmpv-2.dll` and nothing else, so you can copy the two files to whichever PC is plugged into your TV. On a Mac it'll pick up the libmpv that ships with IINA.
