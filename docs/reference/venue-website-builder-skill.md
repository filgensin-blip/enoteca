---
name: venue-website-builder
description: Build a complete website for a cafe, bar, restaurant, bakery or club from a filled-in Venue Website Questionnaire (Q1–Q10), with all images AI-generated in Higgsfield. Use whenever a venue questionnaire is uploaded or a new hospitality client site is requested.
---

# Venue Website Builder

This skill turns a filled-in **Venue Website Questionnaire** (10 questions, Q1–Q10) into a finished, deployed website for a hospitality venue: cafe, coffee bar, bakery, brunch spot, restaurant, wine bar, cocktail bar, pub or club.

Every site is built the same way, on the same stack, with the same QA. It uses AI images generated in Higgsfield. The only thing that changes between sites is the venue.

Version 2.0 · 28 Sep 2026 · Built on the lessons from the LØV (Maastricht) build.

---

## 0. How to read this skill

- **HARD RULE** = never break it, even if the questionnaire asks for something else. If a client answer conflicts with a hard rule, follow the rule and say so in the handover.
- Everything else is a **default**. A client answer always beats a default.
- `PLACEHOLDER` = the literal marker put in code wherever information is missing. Every one is listed in the handover.
- Q1–Q10 = questionnaire questions (Section 3.1).
- The person running this skill is the **operator** (the agency owner). The venue is the **client**. Talk to the operator, never directly to the client.

### 0.1 Golden rules (summary of all hard rules)

1. Never stall. Only three things block the build: venue name, venue type (Q1) and main goal (Q4). Everything else gets a default plus `PLACEHOLDER`.
2. Same stack every time: Next.js App Router + TypeScript + Tailwind CSS v4 + Resend + Lenis.
3. **Every image on the site is AI-generated in Higgsfield.** No stock photos. Client photos are never published; they're only used as **references**.
4. AI images of menu items must match the real menu item: same ingredients, vessel and colour. Guests will order what they see.
5. No identifiable real people, no other brands' logos, and no readable text in generated images.
6. Contrast is measured by script, never estimated: body text ≥ 4.5:1, large text and UI ≥ 3:1.
7. `prefers-reduced-motion` always gets a fully still, fully readable site.
8. The server re-validates every form submission.
9. There is always a privacy page, a favicon, a 404 page and JSON-LD.
10. Never push to `main`, never change DNS, never spend money (paid Higgsfield credits beyond the budget in 8.3, paid plans, domains) without the operator's OK.
11. Never claim something was done (images generated, deploy live, email sent) unless a tool result shows it.

---

## 1. Inputs

| Input | Required | Where it comes from |
| --- | --- | --- |
| Filled-in questionnaire | Yes | Uploaded file (PDF, DOCX, image or screenshot), pasted text, or a Claude Docs link |
| Menu | Strongly preferred | Attachment (PDF, photo, DOCX, XLSX) or a link |
| Logo | Preferred | SVG, AI, EPS or PDF best; PNG otherwise |
| Client photos | Preferred | Used **only** as references for AI image generation |
| Higgsfield access | Yes, for images | Connector, or a browser session logged in to Higgsfield (Section 8.2) |
| GitHub repo access | Yes, for deploy | Session repo or `add_repo` |
| Netlify | For deploy | Netlify connector if present, otherwise the operator links GitHub manually |

### 1.1 Reading the questionnaire in any format

- **Claude Docs link:** read it with the docs tools, never by web fetch. Answers are in the third column of the table.
- **PDF / DOCX:** extract the text. If the table structure is lost, match answers to questions by their "Q#" labels.
- **Photo or screenshot:** read the image, then transcribe it into `docs/questionnaire.md` before interpreting it.
- **Pasted text, email or WhatsApp dump:** map each statement to the nearest Q#.
- **Other languages (Dutch, Italian, French, German):** interpret the answers in that language. Site copy follows Section 10.3.
- Always save a verbatim copy as `docs/questionnaire.md`. It's the source of truth to cite.

---

## 2. Workflow

At the start, create a task list with these exact items and tick them off as you go. The operator watches this list.

| # | Task | Output | Stop and ask? |
| --- | --- | --- | --- |
| 1 | Read questionnaire and attachments | `docs/questionnaire.md`, `docs/brief.md` | Only if a blocker is missing (3.3) |
| 2 | Creative direction | `docs/creative-direction.md` | No. Send the operator a 5-line summary, then continue |
| 3 | Scaffold project | Repo, stack, tokens, data files | No |
| 4 | Build pages | All pages from Section 6 | No |
| 5 | Generate images in Higgsfield | `docs/image-prompts.md`, `docs/image-log.md`, `/public/photos/*` | Only if Higgsfield is unreachable (8.2) or the budget would be exceeded |
| 6 | Motion pass | Motion level from Q6 (Section 9) | No |
| 7 | QA | All of Section 11 passes | Fix; don't ask |
| 8 | Commit, push, PR, deploy preview | Branch, PR, preview URL | Ask before merging to `main` or connecting a domain |
| 9 | Handover | Report (Section 13), sent to the operator | — |

**Order matters.** Build the pages with placeholder image blocks (step 4) *before* generating images (step 5). Then the shot list comes from real layout slots with known aspect ratios, and no credits are wasted.

**Progress messages:** one short line when a phase finishes (e.g. "Pages built; generating images next"). No step-by-step narration. Send a preview link or screenshots as soon as a first version renders, so the operator can redirect early.

---

## 3. Intake

### 3.1 The questionnaire: what each answer controls

| Q | Asks | Extract into | Controls |
| --- | --- | --- | --- |
| Q1 | Name, type, address \* | `site-info.ts`: `name`, `type[]`, `address` | Venue module (Section 5), JSON-LD type, archetype default |
| Q2 | Opening hours \* | `hours.ts` | Open-now badge, booking slots, JSON-LD hours, footer |
| Q3 | Phone, email, socials \* | `site-info.ts`: `phone`, `email`, `socials` | Contact, footer, `sameAs` |
| Q4 | Main goal + booking system + booking email \* | `brief.md`: `primaryGoal`, `bookingMode`, `bookingEmail` | Primary CTA, page list, reservations (Section 7) |
| Q5 | 3 words + guest feeling \* | `brief.md`: `personality`, `feeling` | Archetype tuning, copy voice, image mood |
| Q6 | Light/Dark · Minimal/Rich · Classic/Modern · Calm/Cinematic \* | `brief.md`: `style` | Archetype, type, motion level |
| Q7 | Website they love | `brief.md`: `inspiration` | One borrowed quality, never the layout |
| Q8 | Menu + 3 signatures \* | `menu.ts`, `brief.md`: `signatures` | Menu page, Home cards, food image prompts |
| Q9 | Logo + photos \* | `/brand/logo.*`, `/references/*` (not published) | Colours, image references |
| Q10 | Languages, domain, launch date, story | `brief.md` | i18n, deploy, About copy, deadline |

### 3.2 Normalising answers

- **Venue type:** map to one or more of `cafe`, `bakery`, `brunch`, `restaurant`, `wine-bar`, `cocktail-bar`, `pub`, `club`. Examples: "coffee bar" → `cafe`; "bistro" → `restaurant`; "aperitivo bar" → `wine-bar` + `cocktail-bar`; "koffiebar" → `cafe`; "eetcafé" → `pub` + `restaurant`.
- **Hours:** convert to 24h `HH:MM`. "Till late", "tot laat" or "until close" → use `01:00` and mark `PLACEHOLDER` (don't stop to ask). If the closing time is earlier than the opening time, set `closesNextDay: true`. Record "kitchen closes at…" as `kitchenClose`. Missing days count as closed and get flagged in the handover.
- **Phone:** store in E.164 (`+31431234567`) for `tel:` links, and display it in local format (`043 123 4567` for NL).
- **Prices:** store as numbers in euros (`4.5`), display with `Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })`, or `en-IE` for English sites so they show as `€4.50`. Missing prices → `PLACEHOLDER`.
- **Menu from a photo:** transcribe every item. Unreadable → `[?]` plus a handover entry. Never invent items for a menu the client supplied.
- **Menu descriptions:** if the menu has names only, write one appetite-driven line per item (ingredients + one sensory word). Mark those lines `DRAFT`.
- **Signatures (Q8):** if blank, pick the three most distinctive items and flag them as "decided by Claude".
- **Socials:** store full URLs. "@lovcafe" → `https://instagram.com/lovcafe`.

### 3.3 Blockers and defaults

**Blockers.** Ask all of them in one message, only if missing:
- Venue name (Q1)
- Venue type (Q1)
- Main goal (Q4)

**Defaults for everything else:**

| Missing | Default |
| --- | --- |
| Address | Realistic street pattern in the venue's city, `PLACEHOLDER` |
| Hours | Venue-type default (table below), `PLACEHOLDER` |
| Phone / email | `+31 00 000 0000` / `hello@<slug>.nl`, `PLACEHOLDER` |
| Q5 personality | Venue-type default archetype (Section 5) |
| Q6 style | Venue-type default archetype, motion level 2 |
| Q7 | Nothing borrowed |
| Q8 menu | Plausible menu for the type, 4–5 categories, 4–6 items each, prices `PLACEHOLDER`, whole menu `DRAFT` |
| Q9 logo | Typographic wordmark in the display font (no invented symbol) |
| Q9 photos | Generate from the creative direction alone; flag "no references, likeness to real venue not possible" |
| Q10 languages | English only; NL/FR/DE offered as v2 |
| Q10 domain | Preview URL only |
| Q10 story | Short DRAFT story built from Q5, marked for client approval |
| Legal name / KvK | `PLACEHOLDER` in footer and privacy page |
| Booking details | Section 7.3 defaults |

**Default hours per type:**

| Type | Default hours |
| --- | --- |
| Cafe / bakery | Tue–Sun 08:00–17:00, Mon closed |
| Brunch | Daily 09:00–16:00 |
| Restaurant | Wed–Sun 17:30–23:00, kitchen until 22:00 |
| Wine / cocktail bar | Wed–Thu 17:00–00:00, Fri–Sat 17:00–02:00 |
| Pub | Daily 12:00–01:00, Fri–Sat until 02:00 |
| Club | Fri–Sat 23:00–05:00 |

### 3.4 Contradictions

- Stated style vs. the reference photos (e.g. Q6 says Light, but the photos show a dark velvet bar): **follow the photos**, because the site must feel like walking into the real place.
- Main goal is "book a table", but the booking email is missing: build the booking flow and set `CAFE_NOTIFICATION_EMAIL` to `PLACEHOLDER`.
- Anything else: pick the reading that best serves the Q4 goal.
- Every resolved contradiction gets one line in `creative-direction.md` and in the handover.

### 3.5 `docs/brief.md` template

```md
# <Venue> — build brief
Source: docs/questionnaire.md · Built with venue-website-builder v2.0

## Facts
- Name / type / address: … (Q1)
- Hours: … (Q2) [PLACEHOLDER?]
- Contact: … (Q3)

## Goal
- Primary: … → CTA "…" (Q4)
- Secondary CTA: "…"
- Booking mode: own form | <platform> link | none

## Personality
- Words: … · Feeling: … (Q5)
- Style: Light|Dark · Minimal|Rich · Classic|Modern · Calm|Cinematic (Q6)
- Inspiration: <site> → borrow <quality> (Q7)

## Content
- Menu: <n> categories, <n> items, prices given: yes/no (Q8)
- Signatures: 1… 2… 3… (Q8 | decided by Claude)
- Story: … (Q10 | DRAFT)
- Languages: … (Q10)

## Pages
- …

## Decided by Claude
- …
```

---

## 4. Creative direction

### 4.1 Pick the archetype

1. Start from the three style pairs in Q6: Light/Dark, Minimal/Rich, Classic/Modern.
2. Find the row below with the most matches. On a tie, use the venue type's default archetype (Section 5).
3. Tune with Q5 (the words and the feeling), the logo colours, and the materials and colours in the reference photos.
4. If a logo with colours exists, **the logo's main colour becomes `--primary`** (darkened or lightened until it passes contrast). The archetype's palette fills in the rest.

| Archetype | Light/Dark | Minimal/Rich | Classic/Modern | Palette seed (bg · ink · primary · accent) | Display + body | Radius | Default motion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Nordic Calm | Light | Minimal | Either | `#F7F5EF` · `#1E2119` · `#4A5D3A` · `#8FA377` | Fraunces + Work Sans | 6–10px | 2 |
| Parisian Bistro | Light–mid | Rich | Classic | `#F4EDE1` · `#221A17` · `#6E1F24` · `#B08D57` | Cormorant Garamond + Inter Tight | 2–4px | 1–2 |
| Mediterranean Sun | Light | Either | Either | `#F3EBDD` · `#2A241C` · `#B4552F` · `#6B6B3A` | DM Serif Display + DM Sans | 8–14px | 2 |
| Modern Minimal | Either | Minimal | Modern | `#FAFAF7` · `#141414` · `#141414` · one client colour | Instrument Serif + Geist | 0–4px | 2 |
| Warm Industrial | Mid–dark | Either | Either | `#E4E0D8` · `#1F1F1D` · `#A4502B` · `#2A2A28` | Archivo (incl. Condensed) + Source Serif 4 | 0px | 2 |
| Dark Speakeasy | Dark | Rich | Classic | `#121110` · `#EFE6D6` · `#C8913A` · `#1F3A2E` | Cormorant Garamond + Manrope | 2px | 2–3 |
| Neon Night | Dark | Rich | Modern | `#0B0B0F` · `#F2F2F2` · one client neon · `#1A1A24` | Unbounded or Syne + Inter | 0 or 999px | 3 |
| Retro Playful | Light | Rich | Classic | `#FFF4D6` · `#23201B` · `#D7263D` · `#1B998B` | Fraunces (SOFT 100) + Rubik | 12–999px | 2 |

All fonts listed are on Google Fonts. Check with `next/font/google` before using one; if a font fails to load, use the nearest Google Fonts alternative and note it.

### 4.2 Token set (always these names)

```css
/* app/globals.css — Tailwind v4 */
@import "tailwindcss";

@theme {
  --color-bg: #F7F5EF;        /* page background */
  --color-bg-alt: #EFEBE0;    /* alternating sections */
  --color-ink: #1E2119;       /* body + headings */
  --color-muted: #5E6155;     /* secondary text — MUST pass 4.5:1 on bg AND bg-alt */
  --color-primary: #4A5D3A;   /* CTAs, links */
  --color-on-primary: #F7F5EF;/* text on primary */
  --color-accent: #8FA377;    /* hover, highlights — decorative unless it passes contrast */
  --color-line: rgb(30 33 25 / 0.10);
  --color-dark: #22301C;      /* optional dark band section */
  --color-on-dark: #F1EEE4;

  --font-display: var(--font-fraunces);
  --font-body: var(--font-work-sans);

  --radius-card: 8px;
  --radius-button: 8px;

  --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
}
```

Dark archetypes flip the roles: `bg` dark, `ink` light. Don't build an automatic dark mode; the site's theme *is* the archetype.

### 4.3 Contrast — HARD RULE

- Check these pairs, at minimum: ink/bg, ink/bg-alt, muted/bg, muted/bg-alt, on-primary/primary, primary/bg (links), on-dark/dark, the focus-ring colour against bg, and hero headline/darkest part of the hero shade.
- Body text ≥ 4.5:1. Large text (≥ 24px, or ≥ 18.66px bold) ≥ 3:1. Focus rings and input borders ≥ 3:1.
- If a pair fails, adjust lightness in small steps (keep the hue) until it passes. Change the colour; never argue with the number.
- Run `node scripts/check-contrast.mjs` (Section 11.2). It must exit 0.

### 4.4 Typography rules

- Two families: display + body. A third only if the client's logo wordmark needs it.
- Body 17px desktop / 16px mobile, line-height 1.6, max width 68ch.
- Display sizes: `clamp(2.75rem, 6vw + 1rem, 6.5rem)` for the hero, `clamp(2rem, 3vw + 1rem, 3.5rem)` for section headings.
- Use the font's character once per page (e.g. one Fraunces WONK italic word, one Cormorant swash). Not everywhere.
- Letter-spacing: display −0.01 to −0.02em; small caps labels +0.08em, 12–13px, uppercase.
- Avoid the "AI template" look: no Inter-only sites, no gradient text, no glassmorphism, no emoji in UI, no pills everywhere (except Retro Playful and Neon Night), no three identical feature cards with icons.

### 4.5 `docs/creative-direction.md` template

```md
# <Venue> — creative direction
**Concept:** "<one line, max 8 words>"
**Archetype:** <name>, tuned toward <…>
**Atmosphere:** 2–3 sentences: light, sound, pace, temperature.
**Palette:** table of token · hex · role · contrast result
**Type:** display / body / signature use
**Visual language:** radius, lines, texture (grain yes/no), photography feel
**Image style line:** <the Higgsfield style line, Section 8.4>
**Home story:** 5–7 beats, one per section
**Signature moments (motion level ≥ 2):** 1–3, each with its still fallback
**Emotional journey:** 4–6 words, e.g. hush → craft → appetite → trust → ease → anticipation
**Guardrails:** reduced motion, LCP < 2.5s, no scroll-jacking
**Contradictions resolved:** …
```

Send the operator: the concept line, archetype, palette (the hexes), fonts and motion level, in 5 lines, then continue without waiting.

"Cinematic" (Q6) means pacing, light and restraint, not the number of effects.

---

## 5. Venue-type modules

A mixed venue combines modules; the Q4 goal decides which leads Home.

| Type | Extra Home block | Extra pages | Must-haves | JSON-LD `@type` | Default archetype |
| --- | --- | --- | --- | --- | --- |
| cafe | "The ritual" (3 steps of the signature drink) or a featured drinks strip | — | Open-now badge; laptop/wifi FAQ | `CafeOrCoffeeShop` | Nordic Calm |
| bakery | "Today's bakes" + "till sold out" note | — | Early hours prominent; pre-order line | `Bakery` | Nordic Calm / Parisian |
| brunch | Weekday vs weekend menu toggle | — | Walk-in vs booking policy under hero CTA | `Restaurant` + `servesCuisine: "Brunch"` | Mediterranean Sun |
| restaurant | Chef/kitchen story + tasting-menu teaser | Wine list section on Menu | Booking is primary; dietary tags; allergen line | `Restaurant` | Parisian / Modern Minimal |
| wine-bar | "By the glass" highlight | Events (tastings) | Snacks section; 18+ footer note | `BarOrPub` (+ `additionalType: WineBar`) | Parisian / Speakeasy |
| cocktail-bar | Signature cocktails carousel | Events | Late hours; 18+ footer note | `BarOrPub` | Dark Speakeasy |
| pub | Tap list (editable data) | Events (quiz, sports) | Kitchen hours; 18+ footer note | `BarOrPub` | Warm Industrial |
| club | Next events first (above the fold) | Events (primary), guest list form | Door policy FAQ; tickets link; 18+ | `NightClub` | Neon Night |

**Alcohol — HARD RULE:** never target or depict minors. People in drinks imagery must clearly look 25+, or show hands only. Never present drinking as a route to social, sexual or professional success, and never show excessive drinking. Bar, pub and club sites in NL get "18+ · Geen 18, geen alcohol" in the footer. No age-gate pop-up unless the client asks.

**Standard FAQ per type** (all `PLACEHOLDER` until the client confirms):
- Cafe: laptops and wifi, dogs, card-only, oat milk and alternatives, accessibility
- Restaurant: dietary needs, groups over 8, children, cancellation, accessibility
- Bars and clubs: age, dress/door policy, groups, card-only, accessibility

---

## 6. Pages

### 6.1 Page list

| Page | When |
| --- | --- |
| `/` Home | Always |
| `/menu` | Always (separate route, never a modal) |
| `/book` | Q4 includes booking (own form or platform) |
| `/about` (About & Contact, with FAQ and map) | Always |
| `/events` | Q4 = events, or the type is club, pub or cocktail bar and the client mentions events |
| `/private-hire` | Only if mentioned in Q10 |
| `/privacy` | Always — HARD RULE |
| 404 (`not-found.tsx`) | Always |

The header nav has at most 4 links plus the CTA button. On mobile it's a full-screen overlay menu with large display type, the CTA and the hours.

### 6.2 Home — section by section

1. **Hero** (100svh, min 560px):
   - Full-bleed image slot `hero` (16:9 desktop, 4:5 mobile crop via `<picture>` or `object-position`). At motion level 3, a 6–8s looping video with the still as poster.
   - Headline: 3–7 words, from the Q5 feeling in the venue's voice. Example for LØV: "Matcha, slow mornings, Maastricht."
   - One-sentence sub-line.
   - Primary CTA (Q4) + secondary CTA.
   - Open-now badge on cafe, bakery and brunch sites.
   - Shade: `linear-gradient(to right, rgb(0 0 0 / .45), transparent 60%)` plus a bottom gradient for the nav. Tune it until the headline passes 3:1 over the brightest part of the image.
   - The header is transparent over the hero and becomes solid `--color-bg` with a hairline after 40px of scroll.
2. **Intro:** 2–3 sentences (Q10 story, or a DRAFT from Q5) + one small image (`intro`, 4:5). Not a corporate "about us".
3. **Signatures:** the 3 Q8 items as cards: image (4:5), name, price, one line, linked to its anchor on `/menu`.
4. **Venue-type block** (Section 5).
5. **Atmosphere band:** a full-width image (`atmosphere`, 21:9) or the dark band with one line of copy. It adds rhythm, not information.
6. **Hours + location:** today's hours highlighted, the full week in a compact list, address, a "Directions" link (Google Maps search URL), and a link to `/about`.
7. **Social proof:** only if the client supplied quotes or press. Never invent reviews — HARD RULE.
8. **Closing CTA panel:** same visual weight as the hero, primary CTA again, image `closing` (3:2) or the dark colour.

### 6.3 Menu `/menu`

- Page title + one line + allergen/dietary legend.
- Category jump bar: sticky under the header on desktop, horizontally scrollable chips on mobile. `scroll-margin-top: calc(var(--header-h) + 24px)` on every category heading.
- Items: `name ·········· price` with a dotted leader, description underneath (muted, max 1 line on desktop), and tags as letter badges (`V`, `VG`, `GF`, `DF`, `N`) explained by the legend.
- Hover preview (pointer devices only): the item's square image appears beside the list. It only exists for items that have an image; the rest get no placeholder.
- Signature items get a small "Signature" label.
- Allergen line, always present: "Allergies or intolerances? Ask our team — we'll tell you exactly what's in every dish." (EU law: allergen information must be available on request.)
- Multiple menus (breakfast/dinner, drinks, wine) become tabs or separate sections, each with an `id`.
- A PDF download link only if the client supplied a PDF menu.

### 6.4 Book `/book`

See Section 7. Layout: two columns on desktop (form left; image `book` 4:5 plus hours/address right), a single column on mobile.

### 6.5 About & Contact `/about`

- Story (3–5 short paragraphs, Q10 or DRAFT) + image `about` (3:2).
- 2–3 values, one line each (drawn from Q5).
- Contact block: address, phone (`tel:`), email (`mailto:`), socials.
- Hours, day by day, with kitchen hours if they differ, today highlighted, and closures noted.
- Map: click-to-load (Section 10.4).
- FAQ as an accordion using `<details>`, 4–6 items.
- Accessibility line (step-free entrance, toilet), `PLACEHOLDER` if unknown.

### 6.6 Events `/events`

- Data in `data/events.ts`: `{ slug, title, date (ISO), start, end?, blurb, image?, ticketUrl?, price? }`.
- Upcoming events only, sorted ascending. Past events are filtered out at build/render time.
- Card: date block (day + month), title, time, blurb, ticket button.
- Empty state: "Nothing on the calendar right now — follow us on Instagram for what's next."
- Event JSON-LD for each event.

### 6.7 Private hire `/private-hire`

What's possible, capacity (`PLACEHOLDER`), 2 images, and an enquiry form (name, email, phone, date, guests, type of event, message). It reuses the booking API with `kind: "private-hire"` and a separate email template.

### 6.8 Privacy `/privacy`

Plain language: who the controller is (legal name + KvK, `PLACEHOLDER`), what the forms collect (name, email, phone, date, party size, notes), why (to handle the reservation), where it goes (Resend, the venue's inbox), how long it's kept (server logs about 30 days, the venue's email per their own policy), the fact that there are no tracking cookies, and a contact address for data requests. Last-updated date.

### 6.9 404

On-brand. One line of wit in the venue's voice ("This table doesn't exist."), plus links to Home, Menu and the primary CTA.

### 6.10 Footer (every page)

Logo/wordmark, address, a compact hours summary, phone, email, socials, the privacy link, `© <year> <legal name> · KvK <number>`, and the 18+ note for bar types.

### 6.11 Copywriting rules

- Voice from Q5: calm venues get short, warm sentences; lively ones get punchy, playful lines.
- Concrete over generic: "Stone-ground matcha, whisked to order" beats "High-quality drinks".
- No clichés: "nestled", "hidden gem", "culinary journey", "elevate", "vibrant atmosphere", "passion for".
- Buttons are verbs: "Book a table", "See the menu", "Get directions".
- Every client-facing sentence the client didn't provide is marked `DRAFT` in the data/copy file, not on the rendered page.

---

## 7. Reservations

### 7.1 Choose the mode (Q4)

| Q4 answer | Mode |
| --- | --- |
| Uses a platform (TheFork, Formitable, Zenchef, OpenTable, Resengo, SevenRooms, Tablein…) | **Platform:** `/book` has an on-brand intro, and the platform's widget is embedded (if they give an embed code) or a large button links to their booking URL. No own form, no Resend needed for bookings |
| Wants bookings, no system | **Own request flow** (7.2) |
| No bookings | No `/book` page; the primary CTA follows Q4 |
| Wants deposits or payments | Recommend a platform in the handover; build the own flow meanwhile, with a note |

### 7.2 Own request flow (proven on LØV)

Files:
- `lib/booking.ts`: the shared schema + slot generation, used by the client **and** the server.
- `app/api/booking/route.ts`: POST handler.
- `lib/email.ts`: `sendEmail()` + templates.
- `components/BookingForm.tsx`: client component.

Fields: name\* · email\* · phone · date\* · time\* (select) · party size\* (1–10 select) · notes/allergies (textarea, max 500 chars) · honeypot `company` (visually hidden, `tabIndex={-1}`, `autoComplete="off"`).

Validation, identical on client and server:
- name 2–80 chars
- email via a simple RFC-ish regex
- phone optional, 6–20 chars of `+0-9 ()-`
- date ≥ today (in the venue's time zone, `Europe/Amsterdam` for NL), ≤ today + 90 days, not a closed day
- time must be one of `getSlots(date)`
- party 1–10
- honeypot must be empty; if it's filled, return 200 success without sending anything

Slot generation (`getSlots(date)`):
- from opening time to (closing time or `kitchenClose`) − 60 min, every 30 min
- handles `closesNextDay` (slots after midnight belong to the previous day's opening)
- same day: drop slots less than 30 min from now

API order of operations:
1. Parse JSON; validate with the shared schema. Failure → 400 with `{ errors: { field: message } }`.
2. `console.log("[BOOKING]", JSON.stringify({ ...data, receivedAt }))` — always, before any email.
3. If `RESEND_API_KEY` is missing → log `[BOOKING] ACTION NEEDED: email not configured` → return 200 `{ ok: true, emailSent: false }`.
4. Send the guest confirmation (on-brand HTML + a text version, `replyTo` = the venue email).
5. Send the venue notification to `CAFE_NOTIFICATION_EMAIL` (plain and scannable, subject `New booking: <date> <time> · <party>p · <name>`, `replyTo` = the guest).
6. Any send error → log `[BOOKING] ACTION NEEDED` + the error → return 200 `{ ok: true, emailSent: false }`.
7. Never return a raw error message to the browser.

UI states:
- Field errors: shown under each field, linked with `aria-describedby`, focus moves to the first invalid field.
- Success: "Thank you, <name> — we've sent a confirmation to <email>." With `emailSent: false`: "Thank you, <name> — we've received your request. To be sure, please give us a quick call on <phone>." Focus moves to the message (`tabIndex={-1}`, `role="status"`).
- Button: "Confirm reservation"; disabled while sending, with the label "Sending…".
- Under the button: "We'll only use your details for this reservation. Privacy" (link).

Code comment, required at the top of the route:
```ts
// v1 scope: this is a booking REQUEST flow. There is no availability check,
// no double-booking prevention and no database. Bookings are logged to server
// logs and emailed. A database-backed booking log is a planned v2 addition.
```

### 7.3 Defaults (listed in the handover so the client can adjust)

Every 30 min · last seating 60 min before close (or kitchen close) · 1–10 guests online, larger groups "call us" · up to 90 days ahead · at least 30 min notice.

### 7.4 Email templates

- **Guest confirmation:**
  - Subject: `Your table at <Venue> — <Weekday d Month>, <time>`
  - Body: greeting with first name, date/time/party in a clear block, "We look forward to seeing you.", address with a Maps link, change/cancel line ("Reply to this email or call <phone>"), footer with hours
  - Fonts: system fallbacks; colours from the tokens; max width 560px; inline styles only
- **Venue notification:** plain text-like HTML. Top line `<date> <time> · <party> guests`, then name, email, phone, notes, received-at. No marketing styling.
- `from`: `BOOKING_FROM_EMAIL` (e.g. `"<Venue> <bookings@venue.nl>"`, which needs a verified Resend domain).

---

## 8. Imagery — all AI, generated in Higgsfield

**HARD RULE:** every image on the site (hero, food, drinks, interior, atmosphere, events, OG image) is generated in Higgsfield.
- No stock photos.
- No client photos published directly.
- Client photos (Q9) are **references only**, kept in `/references`, which is git-ignored and never deployed.

### 8.1 Accuracy rules — HARD RULE

AI images on a venue site are a promise to the guest. They must look like what the guest will actually get.

1. **Menu items:** each food/drink image is built from the menu description + the client's reference photo of that item (if there is one). Same main ingredients, same vessel (cup, glass, bowl, plate), same colour, same portion style. No garnishes, sides or props that aren't served. If there's no reference photo, follow the description literally and keep the styling simple.
2. **Interior:** only generate wide interior shots if interior reference photos exist; use them as the reference so layout, materials and colours match. Without references, generate **details only** (a table corner, window light, a counter surface in the stated materials), never an invented full room.
3. **People:** no identifiable real people. Nobody's face as the subject. People appear as hands, backs, silhouettes, or out of focus in the background. For bar types, anyone visible must clearly look 25+.
4. **No text in images:** no readable signs, menus, labels or logos (neither the venue's nor anyone else's). Logos and text are added in code, over the image.
5. **No other brands:** no recognisable branded products (bottles, machines, cups) with visible marks.
6. Every generated image is logged (8.7). Every image the operator might question ("does this look like their dish?") is listed in the handover for client sign-off.

### 8.2 Accessing Higgsfield

Check in this order and use the first that works:

1. **A Higgsfield connector/MCP tool** is in the session (search tools for "higgsfield") → use its generate and download tools directly.
2. **Browser access:** Higgsfield is open and logged in, in the built-in browser or Chrome.
   - Read the browser skill first.
   - Go to higgsfield.ai, open the image generation tool, and read the page to find the current controls (model picker, prompt box, aspect ratio, reference/image input, number of outputs, generate button). The UI changes, so inspect it rather than assuming layout.
   - Generate, download the chosen outputs, and bring them into the workspace:
     - If the downloads land on the operator's computer, request folder access to the download folder once (device tools), then stage the files into the workspace.
     - Otherwise, save or read them however the browser tools allow.
3. **Neither available:** write the full `docs/image-prompts.md`, keep the placeholder blocks, and tell the operator in one message: "Images: prompts are ready for all <n> slots; connect Higgsfield (or log in to it in the browser) and say 'generate images' to continue." Carry on with QA and deploy using placeholders. Never claim images exist.

**Login and credits:** never enter passwords or payment details. If Higgsfield asks for a login, a plan upgrade or a purchase, stop and ask the operator.

**Model choice:** use Higgsfield's best **photorealistic** image model for food, drinks and interiors. Use a reference-capable mode (image reference / image-to-image) whenever a client reference photo exists for that slot. For hero loops (motion level 3), use an image-to-video model on the chosen hero still. Record the exact model name for every image in the log.

### 8.3 Budget

- Default: at most **4 variants per slot**, and at most **2 regeneration rounds** per slot.
- Typical site: 10–16 slots, so about 40–100 generations.
- If the total would exceed ~120 generations, or Higgsfield shows a credit warning, stop and ask.

### 8.4 Style line (one per site)

One shared line appended to **every** prompt, so all images look like one shoot:

`[light] · [colour grade from the palette] · [camera/lens] · [texture] · [mood from Q5]`

Style lines per archetype (adapt the colour words to the actual tokens):

| Archetype | Style line |
| --- | --- |
| Nordic Calm | soft north-facing window light, cream, oat and sage tones, 50mm lens, shallow depth of field, fine film grain, quiet and unhurried |
| Parisian Bistro | warm tungsten and late-afternoon light, deep oxblood, brass and paper-white tones, 35mm film look, gentle grain, intimate and lively |
| Mediterranean Sun | bright hard sunlight with crisp shadows, terracotta, lime-wash and olive tones, 35mm, high clarity, relaxed and generous |
| Modern Minimal | clean diffused daylight, neutral white and graphite with one <accent> colour, 85mm, precise composition, lots of negative space, calm and exact |
| Warm Industrial | mixed daylight and warm Edison bulbs, concrete, rust and charcoal tones, 28mm, textured surfaces, honest and social |
| Dark Speakeasy | low candle and amber practical light, deep shadows, near-black, amber and bottle-green tones, 50mm f/1.4, rich grain, secretive and warm |
| Neon Night | single coloured neon light (<client neon>) cutting through darkness, high contrast, 24mm, slight motion blur, electric and loud |
| Retro Playful | bright even flash-like light, butter-yellow, cherry-red and teal tones, 35mm, saturated, cheerful and nostalgic |

### 8.5 Shot list

Build it from the actual image slots in the built pages. The standard set:

| Slot id | Where | Aspect | Content rule |
| --- | --- | --- | --- |
| `hero` | Home hero | 16:9 (+ 4:5 crop check) | The venue's defining moment (Q5 feeling) at its busiest time: morning for cafes, evening for restaurants, night for bars. Negative space on the left third for the headline |
| `intro` | Home intro | 4:5 | Craft detail: hands preparing the signature item |
| `sig-1`…`sig-3` | Signature cards | 4:5 | The three Q8 signatures, accurate to the menu (8.1) |
| `type-block-*` | Venue-type block | 3:2 or 1:1 | E.g. ritual steps, tap handles (unbranded), cocktail being stirred |
| `atmosphere` | Full-width band | 21:9 | Texture/mood: light on a surface, the stated materials |
| `closing` | Closing CTA | 3:2 | Welcoming: a set table, an open door, a warm window at dusk |
| `book` | Book page | 4:5 | A table ready for guests |
| `about` | About page | 3:2 | Interior (if references exist) or a detail (8.1 rule 2) |
| `menu-*` | Menu hover previews | 1:1 | Up to 8 items: the signatures + the most visual items |
| `event-*` | Event cards | 3:2 | Generic scene for the event type, no identifiable performers |
| `og` | Social share image | 1200×630 | `hero` recropped; the logo is added in code (`opengraph-image.tsx`), not generated |

### 8.6 Prompt template

```
<subject, concrete and literal>, <action or moment>, <setting and materials from references/Q5>,
<composition: angle, framing, where the negative space is>, <style line>,
photorealistic, editorial food/interior photography, no text, no logos, no people's faces
```

Examples (Nordic Calm, LØV):
- `hero`: *A wooden table by a large window in the early morning, a ceramic cup of matcha latte with fine foam and a small cardamom bun on a linen napkin, steam rising, empty chair pulled back slightly, camera at table height with the table in the right third and soft empty wall on the left, soft north-facing window light, cream, oat and sage tones, 50mm lens, shallow depth of field, fine film grain, quiet and unhurried, photorealistic, editorial interior photography, no text, no logos, no people's faces*
- `sig-1` Ceremonial Matcha Latte ("stone-ground matcha, steamed oat milk, lightly sweetened"): *A matte off-white ceramic cup of matcha latte, bright jade-green with a thin layer of pale oat-milk foam, on a light oak table, three-quarter view from slightly above, nothing else on the table except a small spoon, [style line], photorealistic, editorial food photography, no text, no logos, no people's faces*

**Negative guidance** (use the tool's negative-prompt field if it has one; otherwise add it to the prompt): *text, letters, watermark, logo, brand label, extra fingers, distorted hands, warped cup, melted cutlery, plastic look, oversaturated, HDR, cartoon, illustration, faces in focus*.

**With a reference photo:** attach it as the image reference, set the reference strength so the vessel, colours and layout carry over while light and styling follow the style line, and state in the prompt what must stay ("same cup shape and colour as the reference").

### 8.7 Selecting, checking and logging

Check each variant against this list. Reject it on any failure:

- [ ] Matches the menu description and reference (8.1)
- [ ] No text, letters, logos or brand marks anywhere (zoom in on cups, bottles, signs)
- [ ] Hands have five fingers and natural joints; cups, glasses and cutlery aren't warped
- [ ] Light direction and colour grade match the other chosen images
- [ ] The composition leaves room for overlaid text where the slot needs it
- [ ] No faces in focus; nobody who looks under 25 near alcohol
- [ ] Nothing that looks fake at 100% crop (plastic food, impossible reflections, melting edges)

If a variant has one small flaw and the tool supports inpainting or editing, fix it there. Otherwise regenerate within budget.

Log every chosen image in `docs/image-log.md`:

```md
| Slot | File | Model | Prompt (short) | Reference used | Variants tried | Notes |
| hero | hero-window-morning.jpg | <model> | table by window, matcha… | refs/interior-2.jpg | 4 | client to confirm table style |
```

Keep the full prompts in `docs/image-prompts.md`.

### 8.8 Processing and placing

- Name files `/public/photos/<slot>-<short-description>.jpg`, lowercase with hyphens.
- Resize and compress with `scripts/process-images.mjs` (sharp): longest edge 2400px for `hero` and `atmosphere`, 1600px for everything else; JPEG quality 82, progressive, strip metadata. Also produce `.webp` only if a file is still over 400KB after that.
- Serve through `next/image` with `sizes` set correctly and a `placeholder="blur"` data URL. Use `priority` only on `hero`.
- Alt text: describe what's in the image in plain words ("Matcha latte with oat foam on an oak table"). Decorative bands get `alt=""`.
- **Hero video** (motion level 3 only):
  - 6–8s seamless loop generated image-to-video from the hero still.
  - Export H.264 MP4, 1920px wide, ≤ 4MB, no audio track.
  - Use `<video autoplay muted loop playsinline preload="metadata" poster="/photos/hero-….jpg">`.
  - Reduced motion shows the poster only.

`scripts/process-images.mjs`:
```js
// Usage: put raw Higgsfield downloads in public/photos/raw/, named <slot>-<desc>.<ext>; run: node scripts/process-images.mjs
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
const rawDir = "public/photos/raw";   // git-ignore this folder
const outDir = "public/photos";
const big = /^(hero|atmosphere)-/;
for (const f of await readdir(rawDir)) {
  if (!/\.(png|jpe?g|webp)$/i.test(f)) continue;
  const max = big.test(f) ? 2400 : 1600;
  const out = path.join(outDir, f.replace(/\.[^.]+$/, ".jpg"));
  await sharp(path.join(rawDir, f)).rotate()
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(out);
  const { size } = await stat(out);
  console.log(`${path.basename(out)} ${(size / 1024).toFixed(0)}KB${size > 400 * 1024 ? "  ← over 400KB, consider WebP" : ""}`);
}
```

---

## 9. Motion and interaction

Pick the level from Q6's Calm/Cinematic answer and the archetype:

| Level | When | Contents |
| --- | --- | --- |
| 1 Still | Calm + Minimal, or Parisian / Modern Minimal archetype with Calm | Fade-up on section enter; hover limited to colour and underline |
| 2 Smooth | Calm (default) | Level 1 + Lenis smooth scroll + the full hover set + sticky header transition |
| 3 Cinematic | Cinematic | Level 2 + a hero video loop + 1–2 signature moments per page |

### 9.1 Parameters

- **Section reveal:**
  - `opacity 0 → 1`, `translateY(16px → 0)`, 700ms, `var(--ease-out-soft)`, triggered by IntersectionObserver at `threshold: 0.15`, once only.
  - Children stagger by 80ms, max 4.
  - Nothing above the fold is hidden before JS runs (hero content renders visible).
- **Lenis** (`lenis` package):
  ```ts
  const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  ```
  - Import `lenis/dist/lenis.css`.
  - Only initialise when `matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches`.
  - Intercept in-page anchor clicks: `lenis.scrollTo(target, { offset: -(headerHeight + 24) })`.
  - Destroy on unmount.
- **Hover set** (all inside `@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`):
  - Photos: `scale(1.04)` + `brightness(1.03)`, 900ms ease-out, `overflow: hidden` on the wrapper.
  - Buttons: background colour wipe rising from the bottom (`::before` scaleY 0 → 1, transform-origin bottom), 450ms.
  - Links: an underline draws from the left (`background-size: 0% 1px → 100% 1px`), 350ms.
  - Signature cards: photo zoom + title underline + price slides 4px right.
  - Menu rows: name `translateX(6px)`, dotted leader darkens, preview image fades in (200ms).
  - Hours rows: day `translateX(4px)`.
  - Logo: letter-spacing +0.04em, 400ms.
  - Never on background-only images (hero, atmosphere, dark bands).
- **Header:** transparent → solid over 250ms after 40px of scroll; hide on scroll down / show on scroll up only at motion level 3.
- **Signature moments** (level 3, max 2 per page, each with a still fallback), chosen to fit the concept:
  - Scroll-scrubbed image sequence: 24–48 frames generated in Higgsfield from one scene, as the ritual progresses.
  - Time-of-day colour shift: the background tints subtly by the venue's local hour.
  - Hero video loop.
  - Text reveal: a line mask on the hero headline.
  - Stamp moment: the booking success shows an ink stamp with the venue name.

### 9.2 Motion hard rules

- `prefers-reduced-motion: reduce` means: no Lenis, no reveals (content visible), no scrubbing, video replaced by its poster.
- No scroll-jacking or snapping, no custom cursors, no 3D tilt, no parallax on text, no autoplay sound.
- Hover effects are enhancements only; every action also works by tap and keyboard.
- Anchor links land with their heading fully visible below the sticky header (a lesson from LØV).

---

## 10. SEO, local search, languages, legal

### 10.1 Metadata

- Root `metadata` in `layout.tsx`: `metadataBase` (preview URL or domain), a title template `%s · <Venue>`, the default title `<Venue> — <type> in <city>`, a description (~150 chars) and `openGraph`.
- Per page:
  - Menu: `Menu · <Venue>` + "<n> dishes and drinks…"
  - Book: `Book a table · <Venue>`
  - About: `About & contact · <Venue>`
- `app/sitemap.ts` lists every route. `app/robots.ts` allows all and points to the sitemap.
- Icons (HARD RULE): `app/icon.png` (512×512, from the logo or wordmark on `--color-bg`) + `app/apple-icon.png` (180×180). LØV shipped without them.
- `app/opengraph-image.tsx`: the `og` image + wordmark + the city line, 1200×630.

### 10.2 Structured data (JSON-LD in `layout.tsx`)

```json
{
  "@context": "https://schema.org",
  "@type": "<type from Section 5>",
  "name": "", "image": ["<abs url of hero>"], "url": "",
  "telephone": "", "email": "",
  "address": { "@type": "PostalAddress", "streetAddress": "", "postalCode": "", "addressLocality": "", "addressCountry": "NL" },
  "geo": { "@type": "GeoCoordinates", "latitude": 0, "longitude": 0 },
  "openingHoursSpecification": [ /* generated from hours.ts; closesNextDay → closes "02:00" on that dayOfWeek */ ],
  "servesCuisine": [], "priceRange": "€€", "menu": "<url>/menu",
  "acceptsReservations": true, "sameAs": []
}
```

- Plus `FAQPage` on `/about` (from `faq.ts`) and `Event` for each upcoming event.
- Geo coordinates: only if the operator or client provides them, or they can be looked up reliably. Otherwise omit `geo` (don't guess).

### 10.3 Languages (Q10)

- Default: English only.
- If Q10 asks for more: `next-intl` with locale routes (`/en`, `/nl`, …), a default locale redirect, `hreflang` alternates, and translated `menu.ts`, `faq.ts` and all page copy via message files.
- Claude may translate, but every translated file carries `DRAFT — native speaker to review` and is listed in the handover.
- NL venues near borders (Maastricht, Venlo, Enschede): suggest NL + EN (+ DE/FR) as v2 in the handover, even if not requested.

### 10.4 Map (GDPR)

A Google Maps iframe sets third-party cookies, so the map is **click-to-load**:
- A styled block in the palette with the address and a "Show map" button. Clicking it loads the iframe (`https://www.google.com/maps?q=<encoded address>&output=embed`).
- An "Open in Google Maps" link that always works (`https://www.google.com/maps/search/?api=1&query=<encoded>`).

Result: no cookies before consent and no cookie banner needed.

### 10.5 Privacy and analytics

- No tracking by default.
- If the operator or client asks for statistics: cookieless only (Plausible, Umami or Netlify Analytics), mentioned on the privacy page.
- Add a cookie banner only if something non-essential that sets cookies is actually added.

---

## 11. Build details and QA

### 11.1 Scaffold commands

```bash
npx create-next-app@latest <slug> --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes
cd <slug>
npm i resend lenis
npm i -D sharp playwright
mkdir -p data lib components scripts docs public/photos references
printf "references/\npublic/photos/raw/\n" >> .gitignore
```

`.env.example`:
```
RESEND_API_KEY=
BOOKING_FROM_EMAIL="<Venue> <bookings@example.com>"
CAFE_NOTIFICATION_EMAIL=
NEXT_PUBLIC_SITE_URL=
```

Project tree:
```
/app
  layout.tsx          fonts (next/font/google), Header, Footer, SmoothScroll, JSON-LD, metadata
  page.tsx            Home
  menu/page.tsx
  book/page.tsx       (if booking)
  about/page.tsx
  events/page.tsx     (if events)
  private-hire/page.tsx (if Q10)
  privacy/page.tsx
  not-found.tsx
  api/booking/route.ts (if own booking)
  sitemap.ts · robots.ts · icon.png · apple-icon.png · opengraph-image.tsx
/components  Header, MobileMenu, Footer, Photo, Reveal, SmoothScroll, OpenNowBadge,
             HoursList, MenuList, MenuJumpBar, BookingForm, MapClickToLoad, FAQ, EventCard
/data        site-info.ts · hours.ts · menu.ts · faq.ts · events.ts
/lib         booking.ts · email.ts · hours.ts · format.ts
/scripts     check-contrast.mjs · process-images.mjs · screenshots.mjs
/docs        questionnaire.md · brief.md · creative-direction.md · image-prompts.md · image-log.md · handover.md
/references  client photos (git-ignored, never deployed)
```

Data types (`data/types.ts`):
```ts
export type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type Hours = { day: Day; closed?: true; open?: string; close?: string; closesNextDay?: boolean; kitchenClose?: string; note?: string }[];
export type MenuItem = { id: string; name: string; description?: string; price?: number; tags?: ("V"|"VG"|"GF"|"DF"|"N")[]; signature?: boolean; image?: string; draft?: boolean };
export type MenuCategory = { id: string; name: string; note?: string; items: MenuItem[] };
export type SiteInfo = { name: string; legalName?: string; kvk?: string; type: string[]; tagline: string;
  address: { street: string; postcode: string; city: string; country: string }; geo?: { lat: number; lng: number };
  phone: string; phoneDisplay: string; email: string; socials: { label: string; url: string }[]; timeZone: string };
```

- The `Photo` component: a wrapper with `position: relative; overflow: hidden`, **except** when used as a background (`fill` mode). There the wrapper must be `absolute inset-0` with no `relative` class (the LØV hero bug).
- A placeholder block (before images exist): a palette-coloured `div` with the slot id and aspect ratio, labelled in small muted text, e.g. "hero · 16:9".

### 11.2 `scripts/check-contrast.mjs`

```js
// Usage: node scripts/check-contrast.mjs — reads the pairs below, exits 1 on any failure.
const pairs = [
  // [label, foreground, background, minimum]
  ["ink/bg", "#1E2119", "#F7F5EF", 4.5],
  ["muted/bg-alt", "#5E6155", "#EFEBE0", 4.5],
  // …add every pair from Section 4.3
];
const hex = (h) => h.replace("#", "").match(/.{2}/g).map((x) => parseInt(x, 16) / 255);
const lum = (c) => { const [r, g, b] = hex(c).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
let fail = 0;
for (const [label, fg, bg, min] of pairs) {
  const r = ratio(fg, bg); const ok = r >= min; if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"} ${label.padEnd(24)} ${r.toFixed(2)}:1 (min ${min})`);
}
process.exit(fail ? 1 : 0);
```

Keep the pairs in sync with `globals.css`. Semi-transparent colours: flatten them onto their background first.

### 11.3 `scripts/screenshots.mjs`

Playwright with Chromium (`executablePath` from the environment if preinstalled):
- Visit each route at widths 375, 768, 1280 and 1920.
- Save full-page PNGs to `/tmp/shots/<route>-<width>.png`.
- Log console errors and failed requests.
- Log `document.documentElement.scrollWidth > innerWidth` (horizontal overflow).
- Emulate `reducedMotion: 'reduce'` for a second pass at 1280.

Look at the screenshots (Read the PNGs) before handover.

### 11.4 QA checklist — all must pass

Fix failures; don't list them as known issues.

**Build**
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` clean (no warnings about missing `sizes`, fonts or metadata)
- [ ] `grep -rn "className=\"[^\"]*[a-z0-9]btn-" components app` → nothing (merged class names; LØV `py-2btn-primary`)

**Visual** (from the screenshots)
- [ ] Every page at 375 / 768 / 1280 / 1920 looks finished: no overlapping, no orphan headings, no empty slots
- [ ] No horizontal overflow at 375
- [ ] Hero image renders and fills the viewport
- [ ] Headline and nav are readable over the hero
- [ ] Header CTA button styled correctly on transparent *and* solid header
- [ ] All images are Higgsfield images (or labelled placeholders if Higgsfield wasn't available); none distorted or stretched

**Accessibility**
- [ ] `node scripts/check-contrast.mjs` exits 0
- [ ] Keyboard only: skip link works, every control reachable, visible focus ring (≥ 3:1), mobile menu traps and returns focus, Esc closes it
- [ ] Form: labels on every field, errors announced and linked, focus to first error / success
- [ ] Inputs ≥ 16px font size
- [ ] Reduced-motion pass: everything visible and static
- [ ] One `h1` per page, logical heading order, `lang` attribute set, meaningful alt text

**Function**
- [ ] Booking: POST invalid → 400 with field errors; valid → 200; honeypot filled → 200, no email; no API key → `ACTION NEEDED` logged
- [ ] Slots: closed days offer none; the last slot respects kitchen close; `closesNextDay` works (test Friday 01:00 = open)
- [ ] Open-now badge correct in the venue time zone
- [ ] Anchor links land fully below the header
- [ ] Every CTA and link resolves (no 404s); `tel:` and `mailto:` are correct
- [ ] Map loads only after the click

**SEO**
- [ ] Titles and descriptions unique per page; sitemap and robots served; favicon and apple icon present; OG image renders
- [ ] JSON-LD validates (well-formed JSON; types correct)

**Performance**
- [ ] Hero image ≤ 350KB; total Home page weight ≤ 2MB (excluding video)
- [ ] Lighthouse mobile (if available): Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95; LCP < 2.5s

**Content**
- [ ] `grep -rn "PLACEHOLDER\|DRAFT" data app components` → every hit listed in the handover
- [ ] No invented reviews, awards or claims
- [ ] Prices formatted consistently

**Shell tips**
- Never `pkill -f "next start"` in the same command chain (it can kill its own shell: LØV exit 144). Start servers in the background with `&`, save `$!`, and later `kill <pid>`, or kill by port: `kill $(lsof -t -i:3000)`.
- For a production check: `npm run build && (npm start -- -p 3000 & echo $! > /tmp/next.pid)`, wait for the port, test, then `kill $(cat /tmp/next.pid)`.

---

## 12. Deploy

1. Branch: `claude/<venue-slug>-website`. Commit in logical steps (scaffold · pages · booking · images · motion · QA fixes). Commit messages follow the session's attribution rules.
2. Push, and open a PR to `main` with a summary, screenshots and the handover checklist. Never merge without the operator's OK.
3. **Netlify:**
   - If the Netlify connector is available, use it to create or find the site and connect it to the GitHub repo. The build command is `npm run build`; the Next.js runtime is auto-detected.
   - Otherwise, give the operator the exact manual steps: Netlify → Add new site → Import from Git → pick the repo → branch → Deploy. Don't use CLI or API file uploads (they returned 403 on LØV).
   - Deploy previews come from the PR branch.
4. Env vars, set in the Netlify site settings: `RESEND_API_KEY`, `BOOKING_FROM_EMAIL`, `CAFE_NOTIFICATION_EMAIL`, `NEXT_PUBLIC_SITE_URL`. Never commit them.
5. Resend: the sending domain needs verifying (SPF + DKIM DNS records). Until then, confirmations fail or land in spam. List it in the handover.
6. Custom domain (Q10): prepare the steps (Netlify domain settings + DNS records) and **ask before** changing anything.
7. After deploy: open the preview URL, repeat the smoke test (Home, Menu, Book submit with a test entry, About map click), and look at mobile.

---

## 13. Handover

Send it to the operator as a message (and save it as `docs/handover.md`). Keep it short; they read it once.

```
<Venue> website v1 — preview: <url> · PR: <url>

Built: <pages> · booking: <own form | platform | none> · motion level <n> · <languages>
Look: "<concept>" — <archetype>, <display font> + <body font>, <primary hex>

Needs you / the client before launch:
1. Details to confirm (PLACEHOLDER): <address, hours, phone, prices…>
2. Copy to approve (DRAFT): <story, menu descriptions, FAQ, translations>
3. Images to sign off: <slots where likeness to the real dish or room matters>
4. Settings: RESEND_API_KEY, BOOKING_FROM_EMAIL, CAFE_NOTIFICATION_EMAIL, verify the sending domain in Resend
5. Domain: <what's needed>

Decisions I made (questionnaire blank or conflicting):
- <decision> (Q#)

Booking defaults (client can change): every 30 min · last seating 60 min before close · 1–10 guests · 90 days ahead · 30 min notice
Deliberate v1 limits: no availability check or double-booking prevention, no database, no CMS, no payments
Images: <n> generated in Higgsfield (<model>), <n> generations used; prompts in docs/image-prompts.md
Next step: <one real next step>
```

Then add a line to the lessons log (Section 15) for anything new that went wrong or worked unusually well. Propose the update to this skill when there's more than a trivial lesson.

---

## 14. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Hero image invisible / 0 height | `relative` on a `fill` Photo wrapper overrode `absolute inset-0` | Wrapper for background images: `absolute inset-0`, no `relative` |
| Button has no background in one header state | Merged class names (`py-2btn-primary`) | Add the space; run the grep in 11.4 |
| Anchor lands under the header | Lenis offset or `scroll-margin-top` missing | `scroll-margin-top: calc(var(--header-h) + 24px)` + Lenis `offset` |
| Muted text fails contrast on bg-alt | Muted grey tuned only against bg | Darken muted until it passes on both |
| Console 404 `/favicon.ico` | No icon | Add `app/icon.png` + `app/apple-icon.png` |
| Command chain dies with exit 144 | `pkill -f` matched its own shell | Kill by PID or port |
| Netlify upload 403 | API/CLI upload blocked | Link the site to GitHub |
| Fonts fail at build | No network during build | Retry with network; fonts download at build time |
| Resend 403 / "domain not verified" | Sending domain not verified | Operator verifies it; the booking flow still works via the `ACTION NEEDED` log |
| Generated image has garbled text | Model added signage/labels | Regenerate with "no text" stronger, crop, or inpaint |
| Generated food doesn't match the menu | Prompt too vague / no reference | Quote the menu description literally; attach the client's photo as a reference |
| Images look like different shoots | Style line missing or changed | Same style line and light direction on every prompt; regenerate the outliers |

---

## 15. Lessons learned log

Newest first. Add a line after every build.

| Date | Venue | Lesson |
| --- | --- | --- |
| 2026-09 | LØV | Muted grey on the secondary cream failed contrast (4.38:1): always run the contrast script, never hand-calculate |
| 2026-09 | LØV | Merged className (`py-2btn-primary`) removed a button background: grep for merged classes in QA |
| 2026-09 | LØV | `relative` on the Photo wrapper collapsed the absolute hero: background wrappers stay `absolute inset-0` |
| 2026-09 | LØV | A bright hero photo swallowed the headline and nav: a directional shade is default |
| 2026-09 | LØV | Anchor links landed 2px under the header with Lenis: offset + scroll-margin |
| 2026-09 | LØV | No favicon → console 404: icons are a hard rule |
| 2026-09 | LØV | Netlify upload API returned 403: deploy by linking GitHub |
| 2026-09 | LØV | `pkill -f` killed its own shell (exit 144): kill by PID or port |
| 2026-09 | LØV | Stock "close matches" (cinnamon swirl sold as a cardamom bun) misled: now all images are generated to the menu description (Section 8.1) |
