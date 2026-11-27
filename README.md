# Alan Pham — Research Portfolio

Personal research portfolio of **Alan Pham**, a pre-doctoral M.S. student in Computer Science at the University of
Chicago, working with Ken Nakagaki in the [Actuated Experience Lab (AxLab)](https://www.axlab.cs.uchicago.edu/).
My work builds physical interfaces that sense, move, and change shape: actuated and tangible systems that let people
benefit from computation and robotics while keeping a sense of agency.

**Live site:** https://apham799.github.io/AlanPham_Portfolio/

## Projects

| Project | Venue | |
|---|---|---|
| **Buoyancé**: Reeling helium-inflated balloons with mobile robots on the ground for mid-air tangible display, interaction, and assembly | UIST '25 · Full paper | [Page](projects/buoyance/) · [DOI](https://doi.org/10.1145/3746059.3747768) |
| **Buoyancé – Tug(gle)**: installation at Ars Electronica Festival 2025, Linz | Exhibition | [Page](projects/buoyance-tuggle/) |
| **Granular I/O**: Bi-directional malleable interaction for actuated TUIs with magnetic particles | UIST '26 · Full paper | [Page](projects/granular-io/) · [DOI](https://doi.org/10.1145/3830398.3830589) |
| **NodeBots**: Physicalizing network-based data with swarm user interfaces | UIST '26 Adjunct · Demo | [Page](projects/nodebots/) · [DOI](https://doi.org/10.1145/3830397.3842445) |

## About the site

A hand-built static site: plain HTML, CSS, and JavaScript, with no framework, no build step, and no third-party
requests on load.

- **Full-screen project sections** with looping video; videos play only while on screen.
- **Motion drawn from the projects themselves:** pages rise in and settle like a released balloon (Buoyancé), and
  each project title has its own small animated motif: tethered balloons, a settling particle cluster, a node graph.
- **Light and dark themes** that follow the visitor's choice and are remembered between visits.
- **Accessible by default:** everything respects *reduced motion*, videos can be paused, text meets WCAG contrast
  guidelines, and images have descriptive alt text.
- **Privacy-friendly:** fonts are self-hosted, and YouTube loads only when a visitor presses play
  (via `youtube-nocookie.com`).

## Structure

```
index.html                  home: research, publications, news, toolkit, about
projects/<name>/index.html  one page per project or exhibition
assets/css/style.css        all styles (theme colors are defined at the top)
assets/js/main.js           interactions: theme, reveals, video, page transitions, lightbox, BibTeX copy
assets/fonts/               self-hosted web fonts
assets/media/               video loops, posters, and figures
assets/papers/              author copies of the papers (PDF)
```

## Running locally

Open `index.html` directly, or serve the folder for the full experience (embedded YouTube videos require it):

```
python -m http.server 8000
```

Then visit http://localhost:8000.

## Credits

- **Papers:** published by ACM under a [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)
  license; copyright held by the authors.
- **Project media:** © the respective authors and the Actuated Experience Lab, University of Chicago. Exhibition
  photos from Ars Electronica Festival 2025.
- **Fonts:** [Playfair Display](https://fonts.google.com/specimen/Playfair+Display),
  [Geist and Geist Mono](https://vercel.com/font), and
  [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (fallback), all under the SIL Open Font
  License.

## Contact

apham799@uchicago.edu · [Google Scholar](https://scholar.google.com/citations?user=-Mbz4KUAAAAJ&hl=en) ·
[ORCID](https://orcid.org/0009-0005-9224-4284) · [LinkedIn](https://www.linkedin.com/in/alan-pham-7798a3224/)
