+++
template = "project.html"
title = "Dreamfield"
date = "2022-10-13"
[extra]
featured_blurb = "A PS1-style RPG with a hand-written OpenGL renderer that fakes wobbly vertices, affine textures, dithering and a composite CRT signal."
source_link = "https://github.com/catchouli/dreamfield"
download_link = "https://github.com/catchouli/dreamfield/releases/latest"
images = [
    "/images/projects/dreamfield/village.jpg",
    "/images/projects/dreamfield/dungeon.jpg",
    "/images/projects/dreamfield/bridge.jpg",
    "/images/projects/dreamfield/1.png",
    "/images/projects/dreamfield/2.png",
    "/images/projects/dreamfield/3.jpg",
    "/images/projects/dreamfield/4.jpg",
    "/images/projects/dreamfield/5.jpg",
    "/images/projects/dreamfield/6.png",
    "/images/projects/dreamfield/7.jpg",
]
+++

Dreamfield is a dark, PS1-style first person RPG inspired by FromSoftware's King's Field. I put a lot of effort into the aesthetic: the renderer works hard to look like it's actually running on a PlayStation plugged into an old CRT over composite. Everything is hand-written in Rust, including the OpenGL renderer, the collision detection and the world builder. The only real engine-ish dependency is `bevy_ecs`.

<!-- more -->

Right now it's more of a vertical slice than a game. There's a title screen, a little village with a well, trees, a river and a rope bridge, a dungeon to wander around, and a minecart you can push around and ride. There's no combat or story yet, but I'll come back and finish it one day.

<h3 class="title is-3">Faking a PlayStation</h3>

The game renders at 320x240 and gets scaled up, and on top of that it recreates most of the quirks that made PS1 games look the way they did:

- **Wobbly vertices.** The PS1 had no subpixel precision, so vertices snapped to whole pixels and everything jittered as the camera moved. The vertex shader snaps every vertex to the 320x240 grid to get the same effect.
- **Affine texture mapping.** The PS1 didn't do perspective-correct texturing, so textures warp and swim across big polygons. The shaders interpolate with `noperspective` to bring that warping back.
- **Tessellation.** PS1 games subdivided polygons near the camera to hide the worst of the warping. I do the same with a tessellation shader, and because every new vertex gets snapped too, the walls bend and wobble in that lovely way you can see in the dungeon screenshot.
- **Dithering** with the actual 4x4 dither matrix the PS1 GPU used, so gradients get that grainy look instead of banding.
- **Vertex lighting and distance fog**, to hide the draw distance just like the originals had to.

<h3 class="title is-3">Analog TV simulation</h3>

After the scene is rendered, it goes through a composite video pass that simulates the signal degrading on its way to the TV. Colours are crushed to 5 bits per channel (like the PS1's 15-bit colour), then converted to YIQ, the colour space NTSC uses for broadcast. Brightness stays at full resolution, but the two colour channels are sampled at lower resolutions, the same way a composite signal has much less bandwidth for colour than for brightness. Converting back to RGB gives you the soft colour bleeding and smearing of a real TV.

<h3 class="title is-3">Everything else</h3>

- **Collision.** The player is a swept ellipsoid colliding against the raw triangle soup of the level, with Quake-style sliding along surfaces, so you can walk up slopes and slide along walls without getting stuck or falling through anything. This took an embarrassingly long time to get right.
- **World builder.** Levels are made in Blender and exported as glTF. At build time, `build.rs` chops them into chunks with their collision data and bakes them into the executable, so the whole game ships as a single exe.
- **Entities** like the elf and the minecart are placed in Blender and spawned into the ECS when the level loads. Even the minecart track is just a mesh in the Blender scene.
- **Skinned animation** and bitmap font text rendering.
