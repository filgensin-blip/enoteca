# Enoteca Ombra: master build document for Claude Code

Version 1.0 · 28 Sep 2026 · Built from the `venue-website-builder` skill v2.0 and the LØV build lessons.

**Goal:** a complete, production-quality website for Enoteca Ombra, an Italian enoteca in Maastricht, built in one run with no questions, pushed to GitHub, and deployable to Netlify with one click. Target: working site in ~20–30 minutes.

---

## 0. Read this first

### 0.1 Your role and autonomy

You are a senior full-stack engineer and art director working as one person. **Do not ask the operator anything.** Every decision is already made in this document or in the prewritten files. When something is unclear, choose the option that best serves the main goal (people booking a table), write it down in `docs/decisions.md`, and keep going.

The only reasons to stop:
- A command needs a password, payment or a paid plan.
- `npm install` has no network at all after one retry.

### 0.2 What's already in this repo (don't rebuild it)

| Path | What it is | May you edit it? |
|---|---|---|
| `MASTER.md` | This document, the source of truth | No |
| `CLAUDE.md` | Short pointer to this document | No |
| `docs/questionnaire.md` | Client answers (test answers; blank PDF) | No |
| `docs/image-log.md` | The 13 images and their slots | Append only |
| `docs/reference/venue-website-builder-skill.md` | The full agency skill. Background reading; **this master wins on any conflict** | No |
| `data/types.ts`, `site-info.ts`, `hours.ts`, `menu.ts`, `faq.ts`, `copy.ts`, `photos.ts` | All content, typed and final | Only to fix a type error. Never rewrite the copy or the menu |
| `public/photos/*.jpg` | 13 Higgsfield images, already compressed, with real sizes and blur placeholders in `data/photos.ts` | No. Never add other images |
| `app/icon.svg`, `app/apple-icon.png`, `app/opengraph-image.jpg` | Favicon, touch icon, social share image (Next.js file conventions) | No |
| `scripts/check-contrast.mjs` | Contrast checker with the verified palette | Only if you change a colour token (then re-run) |
| `netlify.toml`, `.env.example`, `.gitignore` | Deploy config | Merge with the scaffold's `.gitignore`; keep the rest |

### 0.3 Hard rules

1. Stack: **Next.js (App Router, latest stable) + TypeScript strict + Tailwind CSS v4 + Resend + Lenis.** Fonts via `next/font/google` only.
2. **Only the 13 images in `public/photos/`.** No stock, no Unsplash, no placeholder services, no image downloads, no generated SVG illustrations of food.
3. Content comes from `/data`. Never hardcode copy, prices or hours in components.
4. The site must build and run with **zero environment variables set.** The booking form must still work (see 6.3).
5. `prefers-reduced-motion: reduce` = a fully still, fully readable site.
6. The server re-validates every booking.
7. Contrast is measured by `node scripts/check-contrast.mjs`, never guessed.
8. Every page needs one `h1`, landmarks, a skip link, visible focus, and `lang="en"`.
9. No invented reviews, awards, press or claims.
10. Never claim something works unless you've seen it work (build output, curl response, screenshot).

### 0.4 Order of work (tick these off in your task list)

1. Scaffold and install (Section 1)
2. Design tokens, fonts, base layout: header, mobile menu, footer (Sections 2–3)
3. `lib/` helpers: hours, format, booking schema, email (Section 6)
4. Pages: Home → Menu → Book (+ API route) → About → Privacy → 404 (Section 4)
5. Motion layer (Section 5)
6. SEO: metadata, JSON-LD, sitemap, robots (Section 7)
7. QA, then fix everything that fails (Section 8)
8. Commit, push, deploy (Section 9)
9. Handover in `docs/handover.md` + final message (Section 10)

If time runs short, a correct, deployed site beats polish. Never skip steps 7–9.

---

## 1. Scaffold

The repo already has files, so `create-next-app` can't run in place. Scaffold in a temp folder and copy in.

```bash
npx create-next-app@latest /tmp/scaffold --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes
# copy the scaffold into the repo WITHOUT overwriting existing files
rsync -a --ignore-existing --exclude node_modules --exclude .git /tmp/scaffold/ ./
# (no rsync? use: rm -rf /tmp/scaffold/node_modules /tmp/scaffold/.git && cp -rn /tmp/scaffold/. ./)
# remove scaffold demo files that would clash or leak
rm -f app/favicon.ico public/*.svg
cat /tmp/scaffold/.gitignore >> .gitignore && echo '!.env.example' >> .gitignore   # negation must stay last
npm install
npm i resend lenis clsx
npm i -D playwright
mkdir -p components lib docs
```

- Then **replace** `app/page.tsx`, `app/layout.tsx` and `app/globals.css` from the scaffold with your own (they're demo files).
- Keep `tsconfig.json` strict. Add `"resolveJsonModule": true` if needed.
- `next.config.ts`: leave the default. No `output: "export"` (the booking API needs a server function). No `images.unoptimized`.
- Use `clsx` for every conditional class list. Never build class names by string concatenation (the LØV `py-2btn-primary` bug).
- On Next.js 15+, request APIs like `searchParams` are async. There are no dynamic routes in this site.

**Target file tree:**

```
app/
  layout.tsx            fonts, <html lang="en">, SkipLink, Header, <main id="main">, Footer, SmoothScroll, JSON-LD, metadata
  globals.css           Tailwind import, @theme tokens, base styles, motion block
  page.tsx              Home
  menu/page.tsx
  book/page.tsx
  about/page.tsx
  privacy/page.tsx
  not-found.tsx
  api/booking/route.ts
  sitemap.ts  robots.ts  icon.svg  apple-icon.png  opengraph-image.jpg (already there)
components/
  Header.tsx (client)  MobileMenu.tsx (client)  Footer.tsx  Wordmark.tsx  Photo.tsx
  Reveal.tsx (client)  SmoothScroll.tsx (client)  OpenNowBadge.tsx (client)
  HoursList.tsx  MenuList.tsx (client, for hover preview)  MenuJumpBar.tsx
  BookingForm.tsx (client)  MapClickToLoad.tsx (client)  FAQ.tsx  Button.tsx  Eyebrow.tsx
lib/
  hours.ts  format.ts  booking.ts  email.ts  site-url.ts  jsonld.ts
data/     (prewritten)
scripts/  check-contrast.mjs (prewritten)  screenshots.mjs (you write it, 8.3)
docs/     questionnaire.md  image-log.md  decisions.md  handover.md  reference/
```

---

## 2. Design system

**Concept:** "A glass of wine, after dark." A Venetian bacaro at dusk, transplanted to Maastricht.
**Archetype:** Dark Speakeasy, tuned toward oxblood velvet and candle amber (from the photos: dark walnut bar, red velvet banquettes, brass lamps, terrazzo floor, candlelight).
**Emotional journey:** threshold → glow → appetite → discovery → trust → anticipation.
**Motion level:** 2 (Smooth). Q6 said Calm.

### 2.1 Tokens (paste exactly into `app/globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-bg: #14100D;          /* page background: warm near-black, like walnut in shadow */
  --color-bg-alt: #1D1713;      /* alternating sections */
  --color-ink: #F1E8DA;         /* text: candlelit cream */
  --color-muted: #B5A792;       /* secondary text, passes on bg and bg-alt */
  --color-primary: #D09A45;     /* candle amber: buttons, links, focus ring */
  --color-on-primary: #14100D;  /* text on amber buttons */
  --color-primary-deep: #B8822F;/* button hover fill (decorative wipe) */
  --color-accent: #7A1E24;      /* oxblood velvet: decorative fills, rules, NEVER text on bg */
  --color-dark: #3A1418;        /* oxblood band sections (closing CTA) */
  --color-on-dark: #F1E8DA;
  --color-muted-on-dark: #D6C3B0;
  --color-line: rgb(241 232 218 / 0.12);
  --color-field: #7A6D5E;       /* input borders, passes 3:1 */
  --color-error: #F08A7E;

  --font-display: var(--font-cormorant);
  --font-body: var(--font-manrope);

  --radius-card: 2px;
  --radius-button: 2px;

  --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
}

:root { --header-h: 76px; color-scheme: dark; }
html { background: var(--color-bg); color: var(--color-ink); }
body { font-family: var(--font-body); font-size: 17px; line-height: 1.6; -webkit-font-smoothing: antialiased; }
@media (max-width: 767px) { body { font-size: 16px; } }
::selection { background: var(--color-accent); color: var(--color-ink); }
:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 3px; }
[id] { scroll-margin-top: calc(var(--header-h) + 24px); }
```

These pairs are already verified by `scripts/check-contrast.mjs` (all PASS): ink/bg 15.6, muted/bg-alt 7.5, amber link/bg 7.6, on-primary/amber 7.6, cream/oxblood 13.4, field border 3.5+. If you change any hex, update the script and re-run it; it must exit 0.

### 2.2 Typography

| Role | Font | Weights | Use |
|---|---|---|---|
| Display: headlines, wordmark, big numerals, prices on cards | **Cormorant Garamond** (`next/font/google`, `variable: "--font-cormorant"`, weights 400/500/600, styles normal + italic, `display: "swap"`) | 500 for headlines | Sentence case, letter-spacing −0.01em |
| Body: text, nav, forms, menu rows | **Manrope** (`variable: "--font-manrope"`, weights 400/500/600) | 400 body, 500 nav/buttons | — |

- Hero headline: `clamp(3rem, 7vw + 1rem, 7.5rem)`, line-height 0.95. Section titles: `clamp(2.25rem, 3.5vw + 1rem, 4rem)`, line-height 1.05. Cormorant runs small, so these sizes are bigger than usual on purpose.
- **Eyebrow labels:** Manrope 500, 12–13px, uppercase, letter-spacing 0.14em, colour `primary`. Use a short 24px amber hairline before the text.
- **The one flourish:** Cormorant italic is used for the second hero line ("after dark."), the Italian subtitles on menu categories, and the footer tagline. Nowhere else.
- **Recurring typographic anchor:** large Cormorant numerals ("12", "300", "€32", "18:00") in amber, like LØV's "2g. / 80°C." ritual numbers.
- Body copy max width 64ch. Menu descriptions `muted`.

### 2.3 Visual language

- Radius 2px everywhere. No pills, no rounded cards, no shadows except a very soft one on the menu hover preview.
- 1px `--color-line` hairlines for dividers and dotted menu leaders.
- Generous vertical rhythm: sections `py-24 md:py-36`. Alternate `bg` / `bg-alt`; the closing CTA uses `dark` (oxblood).
- Photography-led: large images, calm crops, thin 1px `line` frame inset 12px on the big editorial images (`intro`, `about`): a gallery-frame detail.
- Optional: a subtle static film-grain overlay on the whole page (a fixed, `pointer-events-none` pseudo-element with an inline SVG `feTurbulence` noise at 4% opacity). Leave it out if it costs performance.
- **Anti-mood (never):** gradient text, glassmorphism, neon glow, emoji, icon sets, three identical icon cards, Inter, all-caps headlines, bouncy motion, a cookie banner.

### 2.4 Wordmark (`components/Wordmark.tsx`)

Text only, no image:
- Line 1: "ENOTECA" in Manrope 500, 10px, letter-spacing 0.32em, colour `primary`.
- Line 2: "Ombra" in Cormorant Garamond 500 italic, 30px (header) / 44px (footer), colour `ink`.
- Link to `/` with `aria-label="Enoteca Ombra, home"`.
- Hover (pointer only): letter-spacing of "Ombra" +0.04em over 400ms.

---

## 3. Global layout

### 3.1 Header (`Header.tsx`, client)

- Sticky, height `--header-h` (76px; 64px on mobile).
- Left: Wordmark. Right on desktop (≥768px): "Menu", "About & contact" (text links, underline draw on hover), then a **Book a table** button (amber, `on-primary` text).
- **Home only:** transparent over the hero with cream text. After 40px of scroll it switches to solid `bg` with a 1px `line` bottom border, via a 250ms background-colour/border transition (not a jump). **All other pages:** solid from the start. Decide by `usePathname() === "/"`.
- The Book button must look identical and correct in both states on every route. Test it in the screenshots (the LØV lesson).
- Current page link: `aria-current="page"` + a permanent 1px amber underline.
- **Mobile (<768px):** a text toggle "Menu" / "Close" (Manrope 500, not a lone hamburger icon), `aria-expanded`, `aria-controls`. Opens `MobileMenu`: a full-screen `bg` overlay with the links in Cormorant 44px, the Book button full width, then today's hours and the phone number. Focus is trapped inside, Esc closes it, focus returns to the toggle, body scroll is locked, Lenis is stopped while open. Links close the menu on click.

### 3.2 Skip link

The first focusable element on every page: "Skip to content" → `#main`, visually hidden until focused, then shown top-left in an amber button style.

### 3.3 Footer (`Footer.tsx`, on `bg-alt`, top hairline)

Three columns on desktop, stacked on mobile:
1. Wordmark (footer size) + the italic tagline from `siteInfo.tagline`.
2. Address (two lines), phone (`tel:` using `siteInfo.phone`, display `phoneDisplay`), email (`mailto:`), Instagram link.
3. Compact hours generated from `data/hours.ts` via `formatHoursCompact()` (e.g. "Tue–Thu 16:00–23:00 · Fri–Sat 16:00–00:30 · Sun 15:00–22:00 · Mon closed") + the aperitivo line.

Bottom line, 13px, `muted`: `© {current year} Enoteca Ombra B.V. · KvK 00000000` · Privacy link · "Photography generated for Enoteca Ombra" · "18+ · Geen 18, geen alcohol" (from `copy.footer`).

### 3.4 `Photo.tsx`

Wraps `next/image` using an entry from `data/photos.ts`:
- Props: `photo: Photo`, `sizes: string`, `priority?`, `fill?`, `className?`, `ratio?` (CSS aspect-ratio like `"4/5"`).
- Normal mode: wrapper `relative overflow-hidden` with `style={{ aspectRatio: ratio }}`, image `fill` + `object-cover` + `objectPosition`.
- **Background mode (`fill` for hero and bands):** the wrapper is `absolute inset-0 overflow-hidden` with **no `relative` class** (the LØV bug where the hero collapsed to 0 height). The parent section provides `relative` and a height.
- Always `placeholder="blur"` with `blurDataURL` from the data file. `priority` only on the hero.
- Hover zoom (pointer only): the image scales to 1.04 and brightens 3% over 900ms. Disabled on background-mode images.

---

## 4. Pages

All copy comes from `data/copy.ts` (import `copy`), all facts from the other data files.

### 4.1 Home (`/`)

1. **Hero:** `min-h-[100svh]` (min 600px), `relative`, `Photo photos.hero` in background mode with `priority` and `sizes="100vw"`.
   - Shade (required, tuned for readability): two stacked layers: `linear-gradient(to right, rgb(10 8 6 / 0.78) 0%, rgb(10 8 6 / 0.45) 45%, transparent 75%)` and `linear-gradient(to top, rgb(10 8 6 / 0.85), transparent 45%)`, plus a top gradient `rgb(10 8 6 / 0.55) → transparent` over the top 160px so the transparent header reads.
   - Content bottom-left, max-w-3xl, `pb-20 md:pb-28`: eyebrow → headline (`headline` on line 1, `headlineItalic` on line 2 in italic) → sub (max 44ch, `ink` at 90%) → buttons (primary amber "Book a table", secondary text link "See the menu" with arrow →) → `OpenNowBadge`.
   - Mobile: the image is centred at `objectPosition: 70% center` (already in data) so the glasses stay in frame; the bottom shade carries the text.
   - Hero content is visible without JS (no reveal on it).
2. **OpenNowBadge (client):** a small dot + text. Open: amber dot, "Open now · until 23:00" (for Fri/Sat after midnight, "until 00:30"). Closed: muted dot, "Closed · opens Tuesday 16:00" (or "opens today at 16:00"). Compute in `Europe/Amsterdam` via `lib/hours.ts`. Render the open state on the server and compute the real state after mount (avoids a hydration mismatch). Wrap it in `aria-live="polite"`.
3. **Intro** (`bg`): two columns on desktop. Left: `photos.intro` (4:5, inset frame). Right: eyebrow "Un'ombra", title, 2 paragraphs, text link "Our story" → `/about`. Mobile: image first, then text.
4. **Signatures** (`bg-alt`): eyebrow + title + link "The full menu". Three cards from `menu` where `signature: true`, in this order: tagliere, risotto, baccalà. Each card: image (4:5 ratio, crops from 1:1 are fine), name in Cormorant 28px, price in Cormorant amber with `priceNote` in small muted text ("€26 for two", "€19", "€4.50 per piece"), description (1 line, muted). The whole card links to `/menu#<item id>`. Hover: photo zoom, title underline draws in, price slides 4px right.
5. **By the glass** (`bg`): the wine-bar module. Desktop: a 12-column grid. Left 5 columns: eyebrow, the huge numeral "12" (Cormorant, `clamp(7rem, 14vw, 13rem)`, amber, line-height 0.8) with "bottles open tonight" beneath it, title, body, link. Right 7 columns: `photos.glassFlight` (3:2). Below: a 3-up stat row (the stats array) with Cormorant numerals in `ink` 48px + muted labels, separated by vertical hairlines. Hover on the numeral: nothing (it's type, not a control).
6. **Atmosphere band:** full-bleed, `aspect-[21/9]` on desktop, `min-h-[360px]` on mobile, `photos.atmosphere` in background mode (decorative, `alt=""`). The line from `copy.home.atmosphere.line` sits centred-right over the dark wall (right 45% on desktop, centred on mobile) in Cormorant italic 32–44px, over a soft radial shade. No hover.
7. **Hours & location** (`bg-alt`): two columns. Left: eyebrow "Opening hours", title "Come by", `HoursList` (today's row highlighted with an amber left rule and "Today" label; kitchen hours in muted text: "Kitchen until 22:00"), the aperitivo line. Right: address block in Cormorant 28px, phone, "Get directions" button (outline) → `https://www.google.com/maps/search/?api=1&query=<encoded address>`, link "Contact & map" → `/about#map`.
8. **Closing CTA** (`dark` oxblood band): two columns: `photos.closing` (3:2) and a panel with eyebrow "Prenota", title "Your table is waiting." (same scale as the hero headline, slightly smaller), body, amber button "Book a table". Same visual weight as the hero.

No reviews or press section: the client supplied none.

### 4.2 Menu (`/menu`)

- `metadata`: title "Menu", description "Cicchetti, taglieri, risotto and twelve wines by the glass at Enoteca Ombra, Maastricht."
- Page head (`bg`, padding-top for the header): `h1` "Menu" + intro line + tag legend (`tagLegend`, as `V · Vegetarian` etc., small muted) + `allergenLine`.
- **MenuJumpBar:** one link per category (`name`), sticky directly under the header on desktop (`top: var(--header-h)`, `bg` with bottom hairline); a horizontally scrollable row on mobile (no scrollbar visible, scroll-snap). Links glide via Lenis with the header offset; highlight the active category (IntersectionObserver).
- **Sections:** each category is a `<section id={category.id}>` with an `h2` (Cormorant 44px) + the `italian` subtitle in italic muted + an optional `note`.
- **Rows** (`MenuList`): each item is an `<article id={item.id}>`: name (Manrope 500, `ink`) · a flexible dotted leader (`border-bottom: 1px dotted var(--color-line)` at 40% ink, which darkens on hover) · price (`formatPrice`, tabular numerals) with `priceNote` in small muted text before the price. The description sits beneath, muted, 15px. Tags as small letter badges (1px `field` border, 11px, 2px radius) with `title` + visually hidden full names. Signature items get a small amber "Signature" label.
- **Hover preview (pointer:fine only):** on desktop the menu is a 2-column layout: the list (7 cols) and a sticky preview column (5 cols, `top: calc(var(--header-h) + 80px)`). Hovering or focusing a row that has an `image` cross-fades that photo (square crop, 1:1) into the preview column in 200ms, with the dish name as a caption. Rows without images show nothing and leave the last image in place. When no image has been hovered yet, show the first image of the current category, or nothing if it has none. On mobile, items with an image show a 64px square thumbnail to the right of the description instead.
- Long names wrap; the price never collides (use `grid-template-columns: 1fr auto` with the leader in the first column).
- Prices: `formatPrice(n)` = `new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(n)` → "€4.50".

### 4.3 Book (`/book`)

- `metadata`: title "Book a table".
- Desktop two columns: left 7 cols = `h1` + intro + `BookingForm`; right 5 cols = `photos.book` (4:5), then hours (`HoursList` compact), address and phone, the walk-in line. Mobile: heading, form, then photo and info.
- Form details and flow: Section 6.

### 4.4 About & contact (`/about`)

1. `h1` "About & contact" + `photos.about` wide (3:2 on desktop, inset frame).
2. Story: the 3 paragraphs from `copy.about.story`, first paragraph in Cormorant 30px as a lede, the rest body.
3. Values: 3 columns, each a Cormorant 32px title, a 1px amber line beneath (hover: it lengthens from 32px to 64px), one sentence.
4. Contact (`id="contact"`): address, phone (`tel:`), email (`mailto:`), Instagram.
5. Opening hours: a full `<table>` with day, hours and kitchen hours; today's row highlighted; closed days say "Closed".
6. Map (`id="map"`, heading "Map & directions"): `MapClickToLoad`: a 16:9 block in `bg-alt` with a 1px line border, the address and a "Show map" button. On click, it loads `<iframe src="https://www.google.com/maps?q=<encoded full address>&output=embed" title="Map showing Enoteca Ombra, Wolfstraat, Maastricht" loading="lazy" referrerpolicy="no-referrer-when-downgrade">`. Below it, an "Open in Google Maps" link that always works. No iframe before the click (GDPR; no cookie banner needed).
7. FAQ ("Good to know"): `data/faq.ts` as `<details>/<summary>` accordions with a custom +/− marker, a 1px line between items, 300ms height-safe open animation (or none under reduced motion). Add FAQPage JSON-LD on this page.

### 4.5 Privacy (`/privacy`)

Plain-language page, `h1` "Privacy". Sections: who we are (Enoteca Ombra B.V., KvK 00000000, address; PLACEHOLDER), what the booking form collects (name, email, phone, date, time, party size, notes), why (to handle your reservation), where it goes (sent by email via Resend to our inbox; server logs kept about 30 days), how long we keep emails (as long as needed to handle the booking, then deleted within 12 months; PLACEHOLDER), no tracking cookies or analytics, the map only loads Google Maps after you click, your rights (access, correction, deletion) and the contact email. "Last updated: 28 September 2026".

### 4.6 404 (`app/not-found.tsx`)

Centred on `bg`: `h1` "This table doesn't exist." + body + three links: Home, Menu, Book a table (amber button).

---

## 5. Motion and interaction (level 2: Smooth)

### 5.1 Lenis (`SmoothScroll.tsx`, mounted once in the layout)

```ts
import Lenis from "lenis";
import "lenis/dist/lenis.css";
// init only when: matchMedia("(hover: hover) and (pointer: fine)").matches
//             && !matchMedia("(prefers-reduced-motion: reduce)").matches
const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
function raf(time: number) { lenis.raf(time); id = requestAnimationFrame(raf); }
```
- Re-check the media queries on change. Destroy on unmount.
- Intercept same-page `a[href^="#"]` and `/menu#x` clicks when already on that page: `lenis.scrollTo(target, { offset: -(headerHeight + 24) })`.
- Expose `stop()`/`start()` (context or a window event) for the mobile menu.
- Scroll to top on route change.

### 5.2 Reveal (`Reveal.tsx`)

- Fade up: opacity 0 → 1, translateY 16px → 0, 700ms, `var(--ease-out-soft)`, IntersectionObserver `threshold: 0.15`, once only. Children stagger by 80ms (max 4).
- Content must never stay hidden if JS fails: add `class="js"` to `<html>` with a tiny inline script in the layout, and only hide `.js [data-reveal]:not(.is-in)`.
- Never on the hero content.
- Reduced motion: everything visible, no transform.

### 5.3 Hover set

All in one commented block at the end of `globals.css`, inside `@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`. Each effect has a matching `:focus-visible` treatment.

| Element | Effect |
|---|---|
| Photos (non-background) | scale 1.04 + brightness 1.03, 900ms |
| Amber buttons | a deeper amber (`primary-deep`) fill rises from the bottom (`::before` scaleY 0→1, origin bottom), 450ms, like wine filling a glass. The label stays on top |
| Outline buttons | fill with 8% ink, border becomes amber |
| Text links + nav links | underline draws in from the left (`background-size: 0% 1px → 100% 1px`), exits to the right. One underline rule only (the LØV double-underline bug) |
| Signature cards | photo zoom + title underline + price slides 4px right |
| Menu rows | name `translateX(6px)`, leader darkens, preview cross-fades |
| Hours rows | day `translateX(4px)` |
| Wordmark | "Ombra" letter-spacing +0.04em |
| About values | amber line grows 32px → 64px |

Never: glows, shadows that bloom, rotation, tilt, bounce, custom cursors, parallax on text, scroll snapping.

---

## 6. Hours, booking and email

### 6.1 `lib/hours.ts`

All maths happens in `Europe/Amsterdam`, whatever the server or visitor time zone. Use `Intl.DateTimeFormat` with `timeZone` to read the local weekday/hour/minute; don't add a date library.
- `getNowInZone(): { day: Day; minutes: number; dateISO: string }`
- `isOpenNow(now)`: handles `closesNextDay`. Saturday 00:15 is still open (Friday's session runs until 00:30); Saturday 00:45 is closed.
- `nextOpening(now)`: `{ day, time, isToday }`
- `getSlots(dateISO, now?)`: 30-minute steps from `open` to `kitchenClose` − 60 min (falling back to `close` − 60 if there's no kitchen time). Tue–Thu 16:00…21:00, Fri–Sat 16:00…21:30, Sun 15:00…20:00, Mon none. For today, drop slots less than 30 minutes from now.
- `isClosedDay(dateISO)`
- `formatHoursCompact()`, `formatDayHours(day)`, `todayKey()`.

### 6.2 Booking schema (`lib/booking.ts`, shared by client and server)

A hand-written validator (no Zod needed, but Zod is fine) returning `{ ok: true, data } | { ok: false, errors: Record<field, message> }`:

| Field | Rule | Error message |
|---|---|---|
| `name` | required, trimmed, 2–80 chars | "Please tell us your name." |
| `email` | required, `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`, ≤ 120 | "Please enter a valid email address." |
| `phone` | optional, 6–20 chars of `+0-9 ()-` | "Please check your phone number." |
| `date` | required ISO `YYYY-MM-DD`, ≥ today (Amsterdam), ≤ today + 90 days, not a closed day | "Please choose a date from today onwards." / "We're closed on Mondays. Please pick another day." / "We take bookings up to 90 days ahead." |
| `time` | must be in `getSlots(date)` | "Please choose one of the available times." |
| `party` | integer 1–10 | "Tables online are for 1 to 10 guests." |
| `notes` | optional, ≤ 500 chars | "Please keep notes under 500 characters." |
| `company` | honeypot; must be empty | (silent) |

Also strip `<` and `>` from every string server-side before it goes into an email.

### 6.3 API route (`app/api/booking/route.ts`, `export const runtime = "nodejs"`)

Top-of-file comment (required):
```ts
// v1 scope: this is a booking REQUEST flow. There is no availability check,
// no double-booking prevention and no database. Bookings are logged to server
// logs and emailed. Staff confirm manually. A database-backed booking log is v2.
```

Order of operations:
1. Parse JSON (bad JSON → 400 `{ errors: { form: "Invalid request." } }`).
2. Best-effort in-memory rate limit: 5 requests per IP per 10 minutes → 429 with a friendly message. Comment that it's best-effort on serverless.
3. Honeypot filled → return `200 { ok: true, emailSent: true }` and do nothing else.
4. Validate with the shared schema → `400 { errors }`.
5. `console.log("[BOOKING]", JSON.stringify({ ...data, email: maskEmail(data.email), receivedAt }))`: always, before any email.
6. If `RESEND_API_KEY` is missing: `console.warn("[BOOKING] ACTION NEEDED: email not configured")` → `200 { ok: true, emailSent: false }`.
7. Otherwise create the client **inside the handler**: `new Resend(process.env.RESEND_API_KEY)`. Never at module top level: the Resend constructor throws without a key and would break the build.
8. Send both emails with `Promise.allSettled`: guest confirmation (`replyTo` = the venue email) and venue notification to `CAFE_NOTIFICATION_EMAIL` (fall back to `siteInfo.email`; `replyTo` = the guest). `from` = `BOOKING_FROM_EMAIL` ?? `"Enoteca Ombra <onboarding@resend.dev>"`.
9. If the guest email failed: log `[BOOKING] ACTION NEEDED` + the error → `200 { ok: true, emailSent: false }`. Both sent → `200 { ok: true, emailSent: true }`.
10. Anything unexpected → `500 { errors: { form: "Something went wrong on our side. Please call us on 043 000 0000 and we'll book you in." } }`. Never return a stack trace or a raw error.

### 6.4 Emails (`lib/email.ts`)

- **Guest confirmation.** Subject: `Your table at Enoteca Ombra — Saturday 17 October, 19:30`. HTML with inline styles, max-width 560px, background `#14100D`, text `#F1E8DA`, amber `#D09A45` accents, Georgia/serif for the wordmark and headings, system sans for the body. Content: "Ciao <first name>," · the booking block (date written out, time, party, notes) · "We look forward to seeing you." · address with a Google Maps link · "Need to change or cancel? Reply to this email or call 043 000 0000." · hours. Include a plain-text version.
- **Venue notification.** Subject: `New booking: Sat 17 Oct 19:30 · 4p · <Name>`. Plain HTML: the top line `<date> <time> · <party> guests`, then name, email, phone, notes, received-at (Amsterdam time). No styling.
- Date formatting: `Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Amsterdam" })`.

### 6.5 `BookingForm.tsx` (client)

- One column, generous spacing, labels above fields (Manrope 500, 14px), inputs 16px+ font (no iOS zoom), 48px tall, `bg-alt` fill, 1px `field` border, 2px radius, amber focus ring.
- Fields: Name, Email, Phone (optional), Date (native `type="date"`, `min` = today in Amsterdam, `max` = +90 days), Time (`<select>` filled from `getSlots(date)`; disabled with "Choose a date first" until a date is set; "Closed on this day" if none), Guests (`<select>` 1–10, default 2) with helper text `copy.book.partyHelp`, Notes/allergies (textarea, live counter "0/500"), and the hidden honeypot `company` (off-screen, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`).
- Validate on blur and on submit with the shared schema. Errors show under each field (`aria-describedby`, `aria-invalid`); on a failed submit an error summary at the top receives focus and links to each field.
- Submit: "Confirm reservation" → disabled with "Sending…" while in flight; no double submits.
- **Success** (replaces the form, focus moves to its heading with `tabIndex={-1}`, `role="status"`): title "Grazie, <first name>." + either "We've sent a confirmation to <email>." (`emailSent: true`) or "We've received your request. To be sure, please give us a quick call on 043 000 0000." (`emailSent: false`) + a summary (date written out, time, guests) + a link "Back to the menu".
- Server `400` errors map back onto the fields. `429`/`500` show the form-level message.
- Under the button: `copy.book.privacy` + a link to `/privacy`.

---

## 7. SEO, structured data, metadata

- `lib/site-url.ts`: `export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "http://localhost:3000";` (Netlify sets `URL` at build time, so the first deploy works with no env vars.)
- Root `metadata`: `metadataBase: new URL(siteUrl)`, `title: { default: "Enoteca Ombra — Italian wine bar in Maastricht", template: "%s · Enoteca Ombra" }`, description from `siteInfo.description`, `openGraph` (type website, locale en_GB, siteName). `app/opengraph-image.jpg` and its `app/opengraph-image.alt.txt` are already in the repo and are picked up automatically.
- Per page titles: "Menu", "Book a table", "About & contact", "Privacy", with unique descriptions.
- `app/sitemap.ts` (/, /menu, /book, /about, /privacy) and `app/robots.ts` (allow all, sitemap URL).
- JSON-LD in the layout (`<script type="application/ld+json">`, built in `lib/jsonld.ts` from the data files):
  - `@type: "BarOrPub"`, name, description, `url`, `image: [siteUrl + photos.hero.src]`, telephone, email, `address` (PostalAddress, addressCountry "NL"), `servesCuisine`, `priceRange`, `menu: siteUrl + "/menu"`, `acceptsReservations: true`, `sameAs` (Instagram).
  - `openingHoursSpecification` generated from `hours.ts`: one entry per open day (`dayOfWeek: "https://schema.org/Friday"`, `opens: "16:00"`, `closes: "00:30"`).
  - No `geo` (no verified coordinates).
- FAQPage JSON-LD on `/about`.

---

## 8. QA: everything must pass before you push

Fix failures; don't list them as known issues.

### 8.1 Commands

```bash
npx tsc --noEmit
npm run lint            # if the script exists (Next 16 uses eslint directly)
npm run build           # zero errors; no warnings about missing `sizes`
node scripts/check-contrast.mjs
grep -rnE 'className="[^"]*[a-z0-9](btn|button)-' app components   # must print nothing (merged class names)
grep -rn "unsplash\|pexels\|picsum\|placehold" app components data  # must print nothing
```

### 8.2 Booking API smoke test (production server)

Start it in the background, never with `pkill -f` in the same chain (that killed its own shell on LØV, exit 144):
```bash
npm start -- -p 3100 > /tmp/next.log 2>&1 & echo $! > /tmp/next.pid
sleep 6
```
Then with curl against `http://localhost:3100/api/booking`:
- Invalid body (empty name, bad email, Monday date) → **400** with `errors.name`, `errors.email`, `errors.date`.
- A valid body for the next Tuesday at 19:00, party 2 → **200** `{ ok: true, emailSent: false }`, and `/tmp/next.log` shows `[BOOKING]` + `ACTION NEEDED`.
- Tuesday at 22:00 (after the last slot) → **400** on `time`.
- Honeypot filled → **200**, no `[BOOKING]` line.
- Finish with `kill $(cat /tmp/next.pid)`.

Also unit-check `lib/hours.ts` with a tiny script (`node --experimental-strip-types` or `npx tsx`): the slots for Tue/Fri/Sun/Mon match 6.1, and `isOpenNow` is true for Saturday 00:15 and false for Saturday 00:45 and Monday 20:00.

### 8.3 Visual check (`scripts/screenshots.mjs`, Playwright)

If Chromium is available (try `chromium.launch()`; if `/opt/pw-browsers/chromium` exists, pass it as `executablePath`; **don't** run `playwright install` if a browser is already present):
- Routes `/`, `/menu`, `/book`, `/about`, `/privacy`, `/does-not-exist` at widths 375, 768, 1280 and 1440. Full-page PNGs to `/tmp/shots/<route>-<width>.png`.
- Log console errors, failed requests and `scrollWidth > innerWidth` (horizontal overflow).
- Home at 1280 scrolled 200px (solid header state) and at 0 (transparent state).
- A second pass at 1280 with `reducedMotion: "reduce"`: all content visible.
- **Open and look at** the PNGs yourself. Check: the hero image fills the viewport; the headline and nav are readable; the Book button is amber on every page and both header states; no overlaps or empty image slots; menu prices never collide with names at 375; the footer is complete.

If no browser can run, say so in the handover and list exactly what the operator should check by hand.

### 8.4 Checklist

- [ ] Every page at 375/768/1280/1440 looks finished; no horizontal scroll at 375
- [ ] Hero renders (not 0 height), shade makes the headline readable, `priority` only on hero
- [ ] Header transparent → solid on Home only; Book button correct everywhere
- [ ] Keyboard only: skip link, every control reachable, focus visible, mobile menu traps focus and closes on Esc
- [ ] Anchor links (`/menu#vino`, jump bar, `/about#map`) land fully below the sticky header (+ jump bar on /menu)
- [ ] Map iframe absent until "Show map" is clicked
- [ ] Menu hover preview works with mouse, absent on touch, thumbnails on mobile
- [ ] Reduced motion: no Lenis, no reveal, no hover transforms, all content visible
- [ ] No console errors (including favicon)
- [ ] One `h1` per page; titles unique; sitemap.xml and robots.txt served; JSON-LD is valid JSON
- [ ] `grep -rn "PLACEHOLDER\|DRAFT" data` → all listed in the handover

---

## 9. Git and deploy (the "one click")

### 9.1 Commit and push

- Commit in logical steps: `scaffold` · `design system + layout` · `pages` · `booking` · `motion` · `seo` · `qa fixes`. End each commit message with the session's attribution lines, if your environment provides any.
- This is a new, dedicated test repo; the operator **pre-authorises pushing to `main`** so Netlify can deploy production from it. If your environment only allows pushing a feature branch (e.g. `claude/...`), push that branch and open a PR to `main` titled "Enoteca Ombra website v1". Merging it is then the operator's one click, and Netlify builds the PR as a Deploy Preview automatically once linked.
- Never commit `.env`, `node_modules`, `.next`.

### 9.2 Netlify

Deploy through a Git-linked site only. Don't use `netlify deploy` or API/CLI file uploads: on LØV they returned 403 every time.

- **If Netlify tools (MCP/connector) are available in your session:** create a new site named `enoteca-ombra` (or `enoteca-ombra-<4 random chars>` if taken), link it to this GitHub repo, production branch `main`, build command `npm run build`, publish `.next` (both already in `netlify.toml`). Trigger the deploy, wait for it, then open the live URL and repeat the booking smoke test against it (expect `emailSent: false` until Resend is set up).
- **Otherwise**, the operator's one click is below. Write these exact steps at the top of `README.md` and in your final message:
  1. app.netlify.com → **Add new project** → **Import an existing project** → **GitHub** → pick this repo.
  2. Leave everything as detected (Netlify reads `netlify.toml` and applies the Next.js runtime, which turns `/api/booking` into a function). Click **Deploy**.
  3. Done: the site is live on `https://<name>.netlify.app` with a working booking form (bookings appear in **Logs → Functions** as `[BOOKING]` lines).
- Optional, when email should go out: in **Project configuration → Environment variables** add `RESEND_API_KEY`, `CAFE_NOTIFICATION_EMAIL`, `BOOKING_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`, then **Deploys → Trigger deploy**. Resend's test sender (`onboarding@resend.dev`) only delivers to the Resend account owner's own address; real guests need a verified domain (SPF + DKIM records in DNS).
- Don't touch any other Netlify site or repo (never `lov-cafe-maastricht` or `Lov-cafe`). Never change DNS or buy anything.

---

## 10. Handover

Write `docs/handover.md` and send the same text as your final message. Keep it short:

```
Enoteca Ombra website v1: live: <url or "one click away: see README"> · repo/PR: <url>

Built: Home, Menu, Book (own booking form + API), About & contact, Privacy, 404 · motion level 2 · English
Look: "A glass of wine, after dark." Dark Speakeasy tuned to oxblood + candle amber, Cormorant Garamond + Manrope, #D09A45

Needs you / the client before launch:
1. Details to confirm (PLACEHOLDER): address, phone, email, Instagram, hours, all prices, legal name + KvK, accessibility
2. Copy to approve (DRAFT): all page copy (data/copy.ts), menu descriptions, FAQ
3. Images to sign off: the 3 signatures + burrata, tiramisù, spritz, wine flight (they must match what's served). Hero is 1344px wide; upscale or regenerate it at 2400px in Higgsfield
4. Email: RESEND_API_KEY, CAFE_NOTIFICATION_EMAIL, BOOKING_FROM_EMAIL + verify the sending domain in Resend
5. Domain: none yet (Netlify URL)

Decisions I made: <list, from docs/decisions.md>
Booking defaults: every 30 min · last seating 60 min before kitchen close · 1–10 guests · 90 days ahead · 30 min notice
Deliberate v1 limits: no availability check or double-booking prevention, no database, no CMS, no payments
QA: <tsc/build/contrast/API results, one line each> · screenshots: <checked | not possible, with reason>
Next step: <one real next step>
```

---

## 11. Pitfalls already paid for (check every one)

| Problem seen before | Prevention |
|---|---|
| Netlify deploy API/CLI upload → 403 | Git-linked site only (9.2) |
| Hero image 0 height | Background-mode `Photo` wrapper is `absolute inset-0`, parent is `relative` with a height |
| Headline and nav unreadable over the hero | The three-layer shade in 4.1; check the screenshot |
| `py-2btn-primary` merged class removed the button colour | `clsx` everywhere + the grep in 8.1 |
| Anchors landed under the sticky header | Lenis offset + `scroll-margin-top` (already in the base CSS) |
| Double underline on links | One link-hover rule, in the motion block only |
| Missing favicon → console 404 | `app/icon.svg` + `app/apple-icon.png` are in the repo; delete the scaffold's `favicon.ico` |
| Muted text failed contrast on the alternate background | Palette verified; re-run the script after any colour change |
| Resend constructor throws without a key and breaks the build | Instantiate inside the handler only (6.3 step 7) |
| `pkill -f "next start"` killed its own shell (exit 144) | Kill by saved PID |
| Photos that don't match the dish | Descriptions in `menu.ts` were written from the photos; don't change one without changing the other |
| Hydration mismatch on the open-now badge | Server renders the default; compute after mount |
