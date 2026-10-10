# A Beautiful Beginning — Vishal &amp; Krishi's Wedding Invitation

A production-quality, single-page wedding invitation website built with modern React tooling. Dual-sided (groom / bride) invitation with elegant typography, hand-crafted SVG illustrations, smooth motion, and accessible interactions.

---

## ✨ Features

- **Dual invitation modes** — One codebase serves both the groom's and bride's side of the family via a URL query parameter. Title, event copy, signatures, and calendar downloads switch automatically.
- **Live countdown timer** — Real-time days / hours / minutes / seconds counter to the main ceremony.
- **Event timeline** — Haldi, Ring Ceremony &amp; Sangeet, Baraat, and Wedding cards with colour-coded tones, icons, dress codes, and precise scheduling.
- **"Save the Date" calendar download** — Generates and downloads an `.ics` file compatible with Google Calendar, Apple Calendar, Outlook, etc.
- **Native share + clipboard fallback** — Share the invitation URL via the Web Share API, or auto-copy when the API is unavailable.
- **Light &amp; dark themes** — Separate hero and mandap illustrations for each colour scheme. CSS variables drive the full palette swap.
- **Fully responsive** — Optimised layouts from 320 px mobile up through 1500 px+ widescreen desktop.
- **Accessible** — Semantic HTML, ARIA labels, skip-to-content link, keyboard-friendly focus rings, mobile menu Escape-to-close, and `prefers-reduced-motion` support.
- **Hand-crafted SVG art** — Custom Ganesha, lotus, flower, and horse-drawn carriage icons.
- **Smooth motion** — Framer Motion (motion.js) scroll-reveal animations and navigation transitions.

---

## 🛠 Tech Stack

### Animation and performance

Content reveals once on entering the viewport, with individually paced story
paragraphs and gentle image zoom-outs. Native CSS scroll timelines add subtle
hero, seal, and floral parallax on fine-pointer desktop devices. Mobile devices
and browsers without scroll-timeline support use the static composition.

Reduced-motion preferences disable entrances, zooming, parallax, and smooth
scrolling. Animated properties are opacity and transforms, with no JavaScript
scroll handlers or persistent animation loops. The countdown pauses in hidden
tabs. Artwork uses compressed 480px/960px WebP sources, lazy loading below the
hero, asynchronous decoding, and a single color-scheme-selected hero image.

When replacing artwork, regenerate the `-480.webp` and `-960.webp` variants.
Profile both invitation URLs on real mobile hardware, including reduced-motion
mode, to validate frame times and layout stability. Frame rate depends on the
device, browser, and display refresh rate.

| Layer        | Technology                                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| UI Library   | [React 19](https://react.dev/)                                                                                               |
| Build Tool   | [Vite 6](https://vite.dev/) + [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) (SWC Fast Refresh) |
| Routing      | [TanStack Router v1](https://tanstack.com/router) (file-based + auto code-splitting)                                         |
| Styling      | [Tailwind CSS 4](https://tailwindcss.com/) via `@tailwindcss/vite` plugin                                                    |
| Motion       | [motion.js](https://motion.dev/) (Framer Motion)                                                                             |
| Icons        | [Lucide React](https://lucide.dev/) + custom SVGs                                                                            |
| Linting      | [ESLint 9](https://eslint.org/) with `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`                |
| Formatting   | [Prettier 3](https://prettier.io/) + sort-imports &amp; Tailwind plugins                                                     |
| Package Mgmt | [Bun](https://bun.sh/) (bun.lockb)                                                                                           |

---

## 🚀 Quick Start

### Prerequisites

- **Bun** 1.1+ (or npm/pnpm/yarn — lockfile is Bun-specific but any package manager works)
- **Node.js** 20+

### Install

```bash
bun install
```

### Development

Start the Vite dev server with HMR:

```bash
bun run dev
```

Then open the URLs shown in your terminal — typically http://localhost:5173.

### Build for Production

```bash
bun run build
```

Output is emitted to the `dist/` directory, ready for static deployment.

### Preview Production Build

```bash
bun run preview
```

### Lint

```bash
bun run lint
```

---

## 🔗 Invitation Versions

Both sides use the same page and design system, switched via a URL query parameter:

| URL                        | Description                                       |
| -------------------------- | ------------------------------------------------- |
| `/?side=groom`             | **Vishal Weds Krishi** — groom's side (V &amp; K) |
| `/?side=bride`             | **Krishi Weds Vishal** — bride's side (K &amp; V) |
| `/` (missing/invalid side) | Defaults to the groom's version                   |

- Navigation within the page preserves the selected `side`.
- Share buttons and calendar downloads include the selected side in the URL / event metadata.

---

## 📝 Customisation Guide

All wedding content lives in a single central file. Edit, extend, or override as needed.

### Wedding Data — [src/wedding.js](file:///Users/vishaltailor/Desktop/Projects/wedding-web/src/wedding.js)

Two objects are exported:

```
sharedWedding   → Fields common to both sides (date, venue, maps URL, …)
weddingSides    → { groom, bride } — each side overrides/extends shared fields
```

#### Overridable Fields

| Field        | Type       | Example                                             |
| ------------ | ---------- | --------------------------------------------------- |
| `date`       | ISO string | `"2026-12-12T16:00:00+05:30"` (main ceremony start) |
| `endDate`    | ISO string | `"2026-12-12T23:00:00+05:30"` (calendar event end)  |
| `dateLabel`  | string     | `"12 December 2026"`                                |
| `venue`      | string     | `"SMC Community Hall"`                              |
| `location`   | string     | `"Jahangirpura, Surat, Gujarat"`                    |
| `area`       | string     | `"Jahangirpura"`                                    |
| `city`       | string     | `"Surat"`                                           |
| `region`     | string     | `"Gujarat"`                                         |
| `mapsUrl`    | string     | Full Google Maps search / place URL                 |
| `firstName`  | string     | Groom-side "Vishal" or bride-side "Krishi"          |
| `secondName` | string     | Other partner's name                                |
| `events[]`   | array      | Ceremony cards — see schema below                   |

#### Event Object Schema

```js
{
  name:        "Haldi",
  subtitle:    "A little sunshine, a lot of love",
  date:        "10 December",
  time:        "4:00 PM",
  icon:        "sun" | "music" | "flower" | "carriage",
  description: "Short paragraph describing the ceremony.",
  dress:       "Dress code suggestion",
  tone:        "yellow" | "green" | "rose" | "purple" | …,
}
```

The groom's side currently includes **4 events** (Haldi → Sangeet → Baraat → Wedding), while the bride's side has **3 events** (Haldi → Sangeet → Wedding). The event grid auto-switches layout from 3-column to 2-column when the count is 4.

### Our Story Copy — [content.md](file:///Users/vishaltailor/Desktop/Projects/wedding-web/content.md)

The "Our Story" narrative is stored separately. The prose is currently inlined directly in [src/routes/index.jsx](file:///Users/vishaltailor/Desktop/Projects/wedding-web/src/routes/index.jsx#L474-L513) — update that section, or wire up a Markdown loader if you prefer to keep it in `content.md`.

### Hero &amp; Venue Illustrations

Swap the images in [src/assets/images/](file:///Users/vishaltailor/Desktop/Projects/wedding-web/src/assets/images/):

| File                             | Usage                       |
| -------------------------------- | --------------------------- |
| `wedding-morning-view.jpg/.png`  | Light-mode hero artwork     |
| `wedding-night-view.jpg/.png`    | Dark-mode hero artwork      |
| `wedding-morning-phera-view.jpg` | Light-mode Our Story mandap |
| `wedding-night-phera-view.jpg`   | Dark-mode Our Story mandap  |
| `morning-hall-map-card.jpg`      | Light-mode venue card       |
| `night-hall-map-card.jpg`        | Dark-mode venue card        |
| `ganesha.svg`                    | Header Ganesha blessing SVG |

### Theme &amp; Palette

All colours are defined as CSS custom properties at the top of [src/index.css](file:///Users/vishaltailor/Desktop/Projects/wedding-web/src/index.css#L4-L19). Dark-mode overrides live in the `prefers-color-scheme: dark` media query [here](file:///Users/vishaltailor/Desktop/Projects/wedding-web/src/index.css#L891-L942).

Fonts are loaded from Google Fonts:

- **Cormorant Garamond** — headings, serif body accents, monograms
- **DM Sans** — UI body text, navigation, labels
- **Italianno** — the "weds" flourish in the hero, couple signature

---

## 🏗 Project Structure

```
wedding-web/
├── public/
│   ├── favicon.svg
│   └── vite.svg
├── src/
│   ├── assets/images/        # Hero, venue, and mandap illustrations (JPG/PNG/SVG)
│   ├── routes/
│   │   ├── __root.jsx        # Root layout (Outlet)
│   │   └── index.jsx         # Main invitation page (hero → story → events → venue → CTA)
│   ├── index.css             # Tailwind import, design tokens, all component styles, media queries
│   ├── main.jsx              # React root + TanStack Router bootstrap
│   ├── routeTree.gen.ts      # Auto-generated route tree (do not edit by hand)
│   └── wedding.js            # Single source of truth: wedding dates, venues, events per side
├── .gitignore
├── .prettierrc               # Prettier config (sort-imports + tailwind plugins)
├── bun.lockb
├── content.md                # Our-story prose draft
├── eslint.config.js          # ESLint flat config (JS + React hooks + refresh)
├── index.html                # HTML shell with SEO meta + theme colors
├── package.json
└── vite.config.js            # Vite + SWC + Tailwind v4 + TanStack Router plugins
```

### Key Patterns

- **File-based routing** — TanStack Router's Vite plugin auto-generates `routeTree.gen.ts` from the `routes/` directory and enables per-route code-splitting. See [vite.config.js](file:///Users/vishaltailor/Desktop/Projects/wedding-web/vite.config.js#L8).
- **Search param validation** — The index route normalises the `side` query param (groom/bride) via `validateSearch` in [src/routes/index.jsx](file:///Users/vishaltailor/Desktop/Projects/wedding-web/src/routes/index.jsx#L27-L30).
- **Centralised config** — `getWedding(side)` in [src/wedding.js](file:///Users/vishaltailor/Desktop/Projects/wedding-web/src/wedding.js#L112-L125) composes derived fields (`couple`, `title`, `slug`, `firstInitial`, …) so every component reads from a single, consistent shape.
- **Motion helpers** — A shared `reveal` preset configures all scroll-reveal animation behaviour once and is reused across sections.

---

## ☁ Deployment

Since `bun run build` produces a static `dist/` directory, deployment is straightforward on any static host:

**Vercel** (recommended):

```bash
# From the project root
vercel
# Build command:   bun run build
# Output directory: dist
```

**Netlify / Cloudflare Pages / GitHub Pages / S3 + CloudFront / etc.** use the same build command and output directory. No server or serverless functions required.

### Environment Variables

None required — the app is 100% static, no API keys, no backend.

---

## 🤝 Scripts Reference

From [package.json](file:///Users/vishaltailor/Desktop/Projects/wedding-web/package.json#L6-L11):

| Command           | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `bun run dev`     | Start Vite dev server with HMR                            |
| `bun run build`   | Type-check (if TS), bundle, and emit static `dist/`       |
| `bun run lint`    | Run ESLint across all `*.js / *.jsx` files (ignores dist) |
| `bun run preview` | Locally serve the production build                        |

---

## ♿ Accessibility Highlights

- Skip-link anchor at the top of the DOM for keyboard/screen-reader users.
- Explicit `aria-label`s on the navigation, countdown, blessing, and share status regions.
- Focus outlines use a gold-contrast ring with 6 px offset so interactive elements never appear "broken" on focus.
- Mobile navigation supports the **Escape** key for closing, with `aria-expanded` / `aria-controls` attributes wired up.
- Decorative SVG and images are marked `aria-hidden="true"` (or empty `alt`), while meaningful venue / mandap illustrations carry descriptive alt text.
- Full `prefers-reduced-motion` media query disables smooth scrolling and animation transitions.

---

## 📜 License

Made with love, for a lifetime of it. ♥

Personal / family use for Vishal &amp; Krishi's wedding invitation. Please reach out to the couple's families for permission before reusing or redistributing the custom artwork or prose.
