# Sayon Manna — Portfolio

A single-page portfolio for **Sayon Manna** (AI & ML Engineer, Bengaluru) with a dark "agentic platform" aesthetic: animated orchestration console, scrolling tech marquee, word-search skill matrix, mock UI panels for each project, scroll reveals, animated counters and a scrollspy nav.

Built with **vanilla HTML + CSS + JavaScript** — no frameworks, no build step.

## Run locally

Just open `index.html` in a browser, or serve it:

```bash
cd "project 10"
python3 -m http.server 8000
# → http://localhost:8000
```

## Structure

```
index.html        # all markup (hero, about, work, stack, experience, credentials, contact)
css/styles.css    # design system + all styles + responsive + reduced-motion
js/main.js        # warp scroller + bend engine, nav, scroll progress, reveals, counters, typing, matrix, tilt, scrollspy, shader uniforms
```

## Sections

1. **Full-page aurora wallpaper** — a fixed WebGL gradient (GPU flow-field in the site's warm palette) visible behind every section, reacting to the cursor anywhere on the page; CSS gradient blobs serve as the no-WebGL fallback
2. **Hero** — headline, animated stat counters, live "orchestration console" with typing commands and department bars
3. **Interactions** — cursor aurora glow that follows the pointer, magnetic buttons, 3D tilt on cards, scroll reveals, counters, scrollspy nav, tech marquee, and a **WebGL scroll warp**: the page scrolls inside a fixed frame that bends — corners round, the sheet tilts and curves outward at its edges — strictly while scrolling, easing back to perfectly flat on stop, while the aurora shader bulges outward at the edges/corners in sync
2. **Marquee** — infinite scroll of the tech stack
3. **About** — three principle cards
4. **Work** — 4 shipped projects (ORCA, Limbi, Local Knowledge RAG, Sales Forecasting) each with a mock UI panel and live demo links
5. **Research & Explorations** — active research tracks (autonomous drone system with phase timeline, quantum compute concept, model-agnostic agent harness) with status badges and category tags
6. **Stack** — auto-scanning skill matrix + categorized skill chips
7. **Experience** — Bluestock Fintech internship timeline card
8. **Credentials** — 5 certifications + education
9. **Contact** — CTA + email/location/LinkedIn/GitHub cards
10. **Footer** — nav columns + back-to-top

## Customize

- **LinkedIn URL** — the resume listed no URL, so `https://www.linkedin.com/in/sayonmanna` is used as a placeholder in `index.html` (search for `linkedin` and replace with the real profile URL).
- **Colors** — edit the CSS variables in `:root` (`--accent`, `--bg`, etc.).
- **Scroll warp** — tune the constants in the warp engine in `js/main.js` (peak radius `64`, tilt `2.1°`, skew `0.65°`, stretch `0.02` horizontal / `0.055` vertical, `perspective(900px)` in the `.warp-stage` CSS); the shader bulge lives in the fragment shader (`u_bend`, `0.105`).
- **Projects / links** — each project is an `<article class="project">` block in `index.html`.
- **Resume PDF** — optionally add `Sayon_Manna.pdf` to the folder and link a "Download résumé" button to it.

## Deploy

Any static host works:

- **GitHub Pages** — push to a repo, enable Pages on the main branch (root).
- **Vercel / Netlify** — drag-and-drop the folder or connect the repo; no build command, output dir = root.

## Accessibility & performance

- Semantic HTML, skip-link, aria labels, `aria-hidden` on decorative panels
- `prefers-reduced-motion` fully respected (animations disabled, counters set instantly)
- No external JS/CSS libraries — only Google Fonts (with system fallbacks)
