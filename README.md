# Focusboard

Focusboard is a calm, polished productivity dashboard for planning a day with intention. It combines a focused task list, lightweight project organization, a quick overview of progress, a daily schedule, and a distraction-free focus timer — all in a dark-glass interface with cinematic motion.

## Run locally

No build step or dependency install is required. Open `index.html` directly in a browser, or serve the folder with any static file server:

```bash
npx serve .
# or
python3 -m http.server
```

## Included

- **Dark glass** design language: layered ambient orbs, frosted panels, gradient accents
- **Cinematic motion**: spring easing, staggered reveals, breathing timer ring, magnetic buttons, custom cursor, ambient parallax
- Task creation modal with project, priority dots, and time chips
- Task completion, list/board views, filtering, and priority sorting
- Focus timer with 25 / 50 / 90 minute modes, pause, reset, and skip
- Live progress ring, daily focus sparkline, streak meter
- Command palette (⌘K / Ctrl K) with keyboard navigation
- Keyboard shortcuts: `N` add task, `F` start focus, `R` reset, `S` sort, `/` command palette
- Browser localStorage persistence (no backend)
- Responsive dashboard layout for desktop and mobile

## Design direction

Inter for UI, Fraunces (variable serif) for moments of reflection, JetBrains Mono for metadata. A deep ink palette with subtle gradient orbs and a soft glass surface system keeps productivity feeling considered rather than clinical.

## Deploy

The site is 100% static and can be deployed anywhere — `index.html`, `app.js`, `styles.css`, and `404.html` are all you need.
