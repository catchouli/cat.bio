+++
template = "project.html"
title = "Better Tactics"
date = "2023-10-01"
[extra]
source_link = "https://github.com/catchouli/better_tactics"
download_link = "https://github.com/catchouli/better_tactics/releases/latest"
images = [
    "/images/projects/better-tactics/1.png",
    "/images/projects/better-tactics/2.png",
    "/images/projects/better-tactics/3.png",
    "/images/projects/better-tactics/4.png",
    "/images/projects/better-tactics/5.png",
    "/images/projects/better-tactics/6.png",
]
+++

Better Tactics is a Chess tactics trainer that uses the concept of <a href="https://en.wikipedia.org/wiki/Spaced_repetition">Spaced Repetition</a> to help you master chess tactics. The idea is to help you improve your tactical pattern recognition and gain experience calculating tactics, by repeating puzzles you've completed over time. Puzzles you complete will get queued up for review daily, and puzzles you find hard will be repeated more frequently, while puzzles you find easy will be repeated far less often to make the process more efficient.

<!-- more -->

<h3 class="title is-3">How it works</h3>

<img src="https://raw.githubusercontent.com/catchouli/better_tactics/develop/screenshots/4.png"
    style="display: block; margin: 0 auto">

When you complete a puzzle, the difficulty score you select will be used to calculate how long it should be until you see the puzzle again, and also to update your rating. The scores are interpreted as follows:

- 'Again' means that you failed to solve the puzzle on the first and need to review it again in the near future, in which case the Spaced Repetition algorithm will set the puzzle to be 're-learned', and you'll see it again the same day.
- 'Hard' meaning that you found the solution but that it was quite challenging, in which case you'll see the puzzle again in about the same amount of time since you last saw it.
- 'Good' is the neutral answer for a successful review, and the one that should be used primarily. After picking it the puzzle's review interval will be increased, and you'll see it less and less frequently over time.
- 'Easy' indicates you didn't find the puzzle very challenging at all, and is a good hint to the algorithm that you don't need to see it again very soon at all, and will cause its review interval to increase significantly.

The review button for each difficulty shows you the amount of time until you'll see that puzzle again if you pick that difficulty.

The difficulty you select is also used to calculate you a rating, according to the difficulty level of the puzzle, and how difficult you found it. 'Good' reviews will cause your rating to grow slowly over time, while 'Again' or 'Easy' reviews may cause larger swings in your rating. Initially, the algorithm will be very uncertain about your rating, and you may experience large swings, but this allows it to quickly find the right rating level for you as it becomes more and more accurate with each puzzle you complete. The rating algorithm used is <a href="https://en.wikipedia.org/wiki/Glicko_rating_system#Glicko-2_algorithm">Glicko2</a>, a common rating system for online chess and competitive games.

<h3 class="title is-3">Acknowledgements</h3>

Made using <a href="https://www.rust-lang.org/">Rust</a>, <a href="https://github.com/seanmonstar/warp">warp</a>, and <a href="https://github.com/djc/askama">askama</a>. The Spaced Repetition algorithm used is the <a href="https://super-memory.com/english/ol/sm2.htm">SuperMemo 2 Algorithm</a>.

The puzzles are sourced from the <a href="https://database.lichess.org/#puzzles">lichess puzzles database</a>, which is amazing. Thanks, Thibault and the lichess community!

The chess board is also lichess's open source <a href="https://github.com/lichess-org/chessground">chessground</a> chess board
component, and the legal move detection and uses <a href="https://github.com/jhlywa/chess.js">chess.js</a>.

