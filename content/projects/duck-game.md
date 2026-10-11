+++
template = "project.html"
title = "DUCK GAME (a parody)"
date = "2026-10-08"
[extra]
featured_blurb = "A deliberately ridiculous parody idle game, \"made by\" an over-excited 11-year-old super coder. Duckie, egg coasters and a very special hat."
link = "https://catchouli.github.io/yang-ching-super-coder-duck-game/"
source_link = "https://github.com/catchouli/yang-ching-super-coder-duck-game"
images = [
    "/images/projects/duck-game/coaster.jpg",
    "/images/projects/duck-game/dad.jpg",
    "/images/projects/duck-game/matrix.jpg",
    "/images/projects/duck-game/maisy.jpg",
    "/images/projects/duck-game/fireworks.jpg",
    "/images/projects/duck-game/wizard.jpg",
]
+++

**This one's a joke!** DUCK GAME is a silly parody idle game, written as if it was made by YANG CHING, an over-excited 11-year-old SUPER CODER who just learned to code and kept adding everything they could think of. Yang Ching isn't real. I made this purely for fun, and it's exactly as ridiculous as it sounds. You can play it in your browser at <a href="https://catchouli.github.io/yang-ching-super-coder-duck-game/">catchouli.github.io/yang-ching-super-coder-duck-game</a>.

<!-- more -->

<h3 class="title is-3">What's in it</h3>

You don't really have to do anything. Duckie wanders around eating pellets, napping, having a drink at the pond and chasing the butterfly. Every couple of pellets they lay an egg, which hatches into a baby duckie that follows them around in a little line until it grows up and leaves home. You can pick Duckie up and carry them around, or give them a flower, and they'll love you a bit more.

- **Stages** go through spring, autumn, winter, night and cherry blossom, and each one has a different ride for Duckie: the egg coaster, a catapult, a cannon, a trampoline and a slide. Duckie levels up as they go (saved between visits), and higher levels unlock fancier eggs.
- **Visitors** turn up every now and then: a mean goose, a wizard, a lost gnome, Maisy in a big red bus, a man in a red car with important things to say, and Yang Ching's dad, who would like them to get off the computer. Hats appear sometimes too, and one of them is very special.
- **Clicking on things** is half the fun, so I won't spoil it, but try the sun, the pond, the trees, the clouds and the snowman. Please don't chop down the trees.

<h3 class="title is-3">Under the hood</h3>

Behind the chaos it's a tidy little codebase: plain JavaScript with no framework, built with Vite and deployed to GitHub Pages by GitHub Actions on every push. Everything shares one game state object, with an update loop and a renderer ticking and drawing it every frame, and the code is split by what it's for: the duck and the babies, the critters and visitors, the scenery, and the fireworks and particles.
