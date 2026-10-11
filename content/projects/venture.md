+++
template = "project.html"
title = "Venture"
date = "2026-09-27"
[extra]
featured_blurb = "A browser-playable MMORPG in Rust with an authoritative server, a seeded procedural continent, generated trees and buildings, and a full world editor."
source_link = "https://github.com/catchouli/venture"
images = [
    "/images/projects/venture/village.jpg",
    "/images/projects/venture/castle.jpg",
    "/images/projects/venture/bridge.jpg",
    "/images/projects/venture/map.jpg",
    "/images/projects/venture/trees.jpg",
    "/images/projects/venture/editor.jpg",
    "/images/projects/venture/floor-plan.jpg",
]
+++

Venture is a medieval fantasy MMORPG I'm making in Rust: a game server, a client that runs in the browser or on the desktop, and a world editor. I want the big, lush, hazy world of Lineage 2, where half the fun is setting off on foot to see what's over the next hill, combined with the depth of skills you get in Old School RuneScape. It's early, but it's playable. You can host a server, have your friends join from their browsers, and run around the starting town together doing quests, fighting goblins, fishing and chopping trees.

<!-- more -->

<h3 class="title is-3">Client and server</h3>

The client runs in a web browser (compiled to WebAssembly) or as a native desktop app on Mac and Windows. You get click-to-move or WASD, Fighter and Mage classes, levelling, a hotbar, chat with speech bubbles, parties, a minimap and a world map.

The server is authoritative, so nobody can just give themselves a sword. It also hosts the web build, so anyone on your network can join by opening the address it prints. If you don't want a separate server, the desktop client can run one inside itself. The core RPG rules follow the D&D 5e SRD, adapted for real-time play.

<h3 class="title is-3">A procedurally generated world</h3>

The world is generated from a seed: a whole continent of hills, lakes, rivers, roads and coastline, split into named regions with their own towns. Then I shape it and fill it in by hand with towns, castles, walls, NPCs and monsters. Generation is fully deterministic, so the same seed always produces exactly the same world and the hand-made parts never drift out of place.

None of the trees are modelled by hand either. A generator grows them from parameters like age, height, lean and bushiness, and so far there are ten common British species (oak, ash, birch, willow, yew and so on). Buildings are generated too. You give one an outline, its interior walls and doors, a number of floors, a roof shape and a style (stone hall, wooden cottage, castle...), and the generator builds the walls, windows, roof and chimney. Bridges appear on their own wherever a road needs to cross a river.

<h3 class="title is-3">The editor</h3>

The editor is where the hand-made stuff happens. It shows the world exactly as it looks in-game, and you can place NPCs and monster spawners, draw walls, hedges and fences, drag buildings around, reroll their seeds, or hit **Edit plan** to look straight down and rework a floor plan by dragging its walls. It also edits all of the game's content: classes, abilities, items, quests, shops, dialogue and character models. When you're done, **Save and play here** drops you into the game right where the camera is.
