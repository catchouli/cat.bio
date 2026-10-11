+++
template = "project.html"
title = "Instructive Chess"
date = "2026-09-23"
[extra]
link = "https://catchouli.github.io/instructive-chess/"
source_link = "https://github.com/catchouli/instructive-chess"
images = [
    "/images/projects/instructive-chess/home.png",
    "/images/projects/instructive-chess/search.png",
    "/images/projects/instructive-chess/game.png",
]
+++

Instructive Chess is a searchable catalogue of instructive chess games, where masters on YouTube play and narrate their thinking move by move. You type in the opening you play, and it finds every game in the catalogue that starts with those moves, then links you straight to the right timestamp in the video. To build the catalogue, I wrote a computer vision scanner that watches the videos and reconstructs every game from the on-screen board.

<!-- more -->

<h3 class="title is-3">The scanner</h3>

The scanner is a Python tool. You give it a YouTube URL and it does the rest:

1. **Download.** `yt-dlp` fetches the video and `ffmpeg` decodes it down to about one frame per second.
2. **Find the board.** A coarse 8×8 checkerboard search followed by gradient-based refinement locates the board on screen.
3. **Self-calibrate.** On the first frame that shows a starting position, it crops all 32 pieces straight out of the video and uses them as templates. Because the templates come from the same renderer, theme and scale, matching (masked cross-correlation) is near exact, it isn't thrown off by square colours or move highlights, and any digital piece set works without extra assets.
4. **Read every frame.** Each square is decided by majority vote over a short time window, which gets rid of flicker.
5. **Reconstruct the game.** It replays legal moves from the starting position, bridging small gaps and stepping over noisy frames. It favours correctness over length: if a position can't be resolved, the game ends there rather than guessing, and every game gets a confidence score.

It also uses OCR (Tesseract) to read the on-screen clocks and ratings.

<h3 class="title is-3">The site</h3>

The front end is a dependency-free static site. The only library is a vendored copy of chess.js, and the page makes no network requests beyond loading itself. You can type moves as PGN (`1. e4 c5 2. Nc3`) or loosely (`e4 c5 Nc3`) and get every game whose main line begins with exactly those moves. If you type an illegal move, it filters on the legal prefix and tells you so. Each result expands into a board you can step through and the full PGN.
