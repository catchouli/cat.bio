# TODO

From the site and CV review on 2026-10-13. The full reasoning is in `~/projects/ai-job/docs/career/cat-bio-review.md`.

## Quick fixes

- [x] **Remove the phone number from the CV.** Contact by email only (cat@cat.bio): cold calls are too spammy. Rebuild the PDFs and replace `static/cv.pdf`.
- [x] **Put the CV source in git.** Move `~/projects/cv-update` into this repo as `cv/`, and have `build.sh` copy the Medium PDF to `static/cv.pdf`.
- [x] **Delete the stale CV pipeline:** `prebuild/`, `content/_cv.md`, and the `cv.docx` link in `_cv.md`'s subtitle.
- [x] **Add `public/` to `.gitignore`** (Zola's build output).
- [x] **Fill in or remove `content/_sites.md`** (currently a TODO stub). Removed 2026-10-15: it wasn't used by any template.

## Site: tell the AI story

- [ ] **Add an AI row to the interests panel:** Neuron (2016 Haskell backprop and MNIST, from scratch), the VRAssist work described generically (check with Andy what's OK to say), and later the splat renderer.
- [ ] **Add a writing section** (`/writing` or `/blog`). Write one post per project milestone; the first is the splat renderer.
- [ ] **Rebalance the featured grid** in `templates/index.html`: swap in volumetric clouds or voxel ray tracing now for GPU depth, and the splat renderer when it exists. Keep one or two playful ones.
- [ ] **Add a one-line positioning statement to the about panel**, e.g. "building local-first AI for security-sensitive industries, and GPU tooling for 3D and AI".
- [ ] **GitHub profile:** pin the best repos (splat renderer, CatApp, later the gateway) and add a short profile README.

## CV

- [ ] **Concrete AI bullets with numbers:** about 40 MCP tools; scenes of 100k+ nodes; a metadata index building 500k entries in 0.44 s, kept live by observers; undo per agent action; scripting permission model; local models via OpenAI-compatible servers.
- [ ] **Mention local-first AI:** routing simple requests to small local models, with cloud optional, for customers who can't use cloud AI.
- [ ] **Education:** mention the persistent GPU kernels with occupancy-tuned work queues from university research.
- [ ] **Quantify:** the GeoServer benchmark at Map Impact, and the size of the cloud product at Virtalis.
- [ ] **Make an inference/infrastructure-targeted variant** (`cv-infra.html`) before applying, around March 2027.
- [ ] **Update "Beyond work"** as new projects land: splat renderer, CUDA work, CatApp.

## Docs

- [ ] **Document how the site is deployed** in README.md.
