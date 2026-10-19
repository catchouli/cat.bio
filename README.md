# cat.bio

Source for [cat.bio](https://cat.bio), my personal site and portfolio. It's a static site built with [Zola](https://www.getzola.org/).

## Build and preview

Needs Zola 0.22 or newer, because the syntax highlighting config uses the 0.22+ format. Tested with 0.23.6.

```sh
zola serve    # live preview at http://127.0.0.1:1111
zola build    # writes the site to public/
```

Zola resizes project images on build and caches them in `static/processed_images/`, which is git-ignored.

## Deploying

Every push to `main` runs `.github/workflows/build.yml`, which builds the site and attaches it as `site.zip` to the `site` release. To deploy, on the server:

```sh
wget -O site.zip https://github.com/catchouli/cat.bio/releases/download/site/site.zip
unzip -o site.zip -d /path/to/web/root
```

The Actions tab shows whether the latest build worked; it can also be rerun by hand from there.

## Layout

| Path | What's there |
|---|---|
| `config.toml` | Site config: base URL, Sass, search index, highlighting theme |
| `content/_index.md` | Home page |
| `content/_about.md`, `_interests.md` | Home page panels (`render = false`, pulled into `templates/index.html`) |
| `content/projects/*.md` | One page per project |
| `templates/` | Tera templates. `index.html` holds the featured-projects list |
| `sass/` | Styles (Bulma plus `_theme.scss` and `_layout.scss`) |
| `cv/` | CV source: `src/cv-*.html` and `build.sh` |
| `static/cv.pdf` | The CV linked from the site (built from `cv/`) |
| `static/dissertation.pdf` | Dissertation |
| `static/images/` | Headshot, Ferris, and `projects/<name>/` screenshots |
| `static/js/ps1.js` | PS1 mode: the WebGL cube headshot, spinning Ferris and CRT effect behind the header toggle |

## Adding a project

Create `content/projects/<name>.md`:

```toml
+++
template = "project.html"
title = "Flex"
date = "2026-10-09"
[extra]
featured_blurb = "One or two sentences for the featured grid."
source_link = "https://github.com/catchouli/flex"
download_link = "https://github.com/catchouli/flex/releases/latest"   # optional
images = ["/images/projects/flex/home.jpg"]                           # first one is the cover
+++
Description in Markdown. Text before <!-- more --> is the summary.
```

Other optional `[extra]` fields: `featured_image` (cover for the featured grid, if not the first image), `steam_link`, `link` (playable or usable in the browser; shown as [try it] on the home page), `video_link`.

To feature a project on the home page, add its path to the `featured` list near the top of `templates/index.html`.

## The CV

The CV is HTML in `cv/src/cv-medium.html`, printed to PDF with headless Chrome. After editing, run:

```sh
cv/build.sh
```

The PDF goes in `cv/out/` (git-ignored) and is copied to `static/cv.pdf`. Needs Google Chrome or Chromium.
