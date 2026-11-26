# Alan Pham — Portfolio

Static site: plain HTML/CSS/JS. No build step, no dependencies, no third-party requests (fonts are self-hosted;
YouTube only loads when a visitor clicks play).

---

## TODO — last updated Nov 26, 2026

**See them on the page:** add `?todo` to the address. Flagged items get a dashed yellow outline and label.

```
file:///C:/Users/apham/OneDrive/Desktop/GradStuff/ApplicationMaterials/Portfolio/site/index.html?todo
```

Works on every page (put `?todo` after `index.html`). Every item is also marked `TODO(Alan)` in the HTML; search for
that to jump to it.

### 1. Writing (needs you)

| Page | What | Where |
|---|---|---|
| Home | **One-line research statement** in the hero. Keep `<em data-fx="sense\|move\|shape">` around words you want animated | `index.html` ~line 60 |
| Home | **Bio** (About, first paragraph) | `index.html` ~line 293 |
| Home | **"Research directions"** paragraph (About), the place to signal breadth beyond swarm UIs | `index.html` ~line 299 |
| Tug(gle) | **About the installation**: what visitors did, what "Tug(gle)" refers to, how long it ran. (The official Ars Electronica description would work well here) | `projects/buoyance-tuggle/` ~line 89 |
| Tug(gle) | **Rehearsal** line: where/when it happened, anything that changed for Linz | `projects/buoyance-tuggle/` ~line 156 |

### 2. Review my drafts (check for accuracy)

| Page | What |
|---|---|
| Buoyancé | **System** paragraph (my summary) |
| Granular I/O | Section paragraphs: Interaction, Implementation, Applications, Evaluation (my summaries of the paper) |
| NodeBots | Section paragraphs: Interaction space, Implementation, Examples (my summaries of the paper) |
| Tug(gle) | Photo captions |
| Home | Theme pills on the three project cards (they also appear at the bottom of each project page) |

### 3. Quick swaps

- [ ] **Granular I/O BibTeX**: replace with ACM's "Export Citation" (adds the article number) — `projects/granular-io/`
- [ ] **NodeBots BibTeX**: same — `projects/nodebots/`
- [ ] **Tug(gle) exact festival dates** in the Venue box (currently "September 2025") — `projects/buoyance-tuggle/` ~line 66
- [ ] **`og:image`** (link-preview image): add once the domain is known; must be an absolute URL — `index.html` line 9

### 4. Open questions

- [ ] **Fellowship name**: the News list says *"Jeff Metcalf Research Fellowship"*; the Ars Electronica page says
      *"Odyssey Metcalf Fellowship Grant"*; your CV says *"Jeff Metcalf Fellowship Grant."* Pick one and make them match.
- [ ] **CV wording**: the site says "Guest talk on Buoyancé"; the CV says "Guest lecture."
- [ ] **Visitor photos**: same signage question as the removed kids' video. The Tug(gle) gallery still includes
      visitors' faces (mother and baby, groups of visitors). Keep or remove?
- [ ] **Rock-and-lever station** seen in some Ars footage: part of Tug(gle) or another artwork? If it's yours, that
      clip (`PXL_20250903_130931245`) would make a good interaction video.
- [ ] **Related sections** for Granular I/O and NodeBots: any press, awards, or talks to add?
- [ ] **Neutral tones**: background is a warm off-black/cream; could be cooled slightly to suit the blue accent.

### Done recently

Blue accent · project pages for Granular I/O and NodeBots (PDFs, YouTube, lab pages) · Tug(gle) exhibition page with
rehearsal section · Related cards with video teasers · whole-card clicks · buoyant-lift page transition · steady header
during transitions (self-hosted fonts) · title motifs for Buoyancé and Granular I/O · publication titles → project
pages · contact icons · public CV without phone number.

---

## Files

```
index.html                    home page (hero, research cards, publications, news, toolkit, about)
projects/<name>/index.html    project pages: buoyance, granular-io, nodebots, buoyance-tuggle (exhibition)
assets/css/style.css          all styles. Colors at the top: --accent / --accent-ink, one set per theme
assets/js/main.js             theme toggle, reveals, title motion, videos, page transition, lightbox, BibTeX copy
assets/fonts/                 self-hosted fonts (the two header fonts are embedded in style.css)
assets/media/                 home-card loops (.mp4 + .jpg poster) and one folder of figures per project
assets/papers/                web-sized PDFs of each paper (CC BY 4.0)
assets/Pham_Alan_CV.pdf       PUBLIC CV: phone number removed. Original with phone: Portfolio/Pham_Alan_CV.pdf
```

**Keep out of the repo:** the raw videos and `_source-media/` in the parent folder. Raw videos are 30–100 MB each;
`_source-media/` holds originals (full-size PDFs, unblurred rehearsal photos, the SSSF photo, children's footage)
that shouldn't be published.

**Updating the CV:** if you change your CV, the site copy must be regenerated without the phone number (ask Claude, or
export a version without it and save it as `assets/Pham_Alan_CV.pdf`).

## Preview locally

Opening `index.html` straight from the folder works for everything except two things: YouTube embeds may refuse to
play, and PDFs open in a new tab rather than inline. For an exact preview:

```
cd site
python -m http.server 8000
```
Then open http://localhost:8000 (add `?todo` to see TODOs).

## Adding a project page

1. Copy a folder in `projects/` (e.g. `projects/nodebots/`) and edit the text, links, figures, and BibTeX.
2. Put web-sized figures in `assets/media/<name>/` (about 1400–2200 px wide, JPEG) and the PDF in `assets/papers/`.
3. On the home page, copy an `<article class="project">` block: set `id`, `data-card-href="projects/<name>/index.html"`,
   the title link, the `01 / 03` counters, and add a background loop:

```
ffmpeg -ss <start> -t <seconds> -i source.mp4 -an -vf "scale=1280:-2,fps=30" \
  -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart assets/media/<name>.mp4
ffmpeg -ss <time> -i source.mp4 -frames:v 1 -vf scale=1600:-2 -q:v 4 assets/media/<name>.jpg
```
Keep loops muted, 6–15 s, under ~3 MB, and free of burned-in captions (crop with `crop=w:h:x:y`).

4. Link it from the previous project's "Next project" and add it to the Publications list.

## Deploy

**GitHub Pages:** push the contents of `site/` to a repo named `<username>.github.io` (or any repo → Settings → Pages →
Deploy from branch `main`, folder `/root`). `.nojekyll` is already included.

**Vercel:** `npx vercel` from inside `site/`, or import the repo in the Vercel dashboard (Framework preset: *Other*, no
build command, output directory `.`).
