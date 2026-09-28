# Decisions log

- Questionnaire PDF was blank: test answers written in docs/questionnaire.md from the 13 photos (Q1–Q10).
- City set to Maastricht, English only, name "Enoteca Ombra" (Venetian for a glass of wine). All test values.
- Style from the photos: Dark · Rich · Classic · Calm → Dark Speakeasy archetype tuned to oxblood + amber, motion level 2.
- No events page and no reviews section (none supplied).

## Build decisions (Claude Code, 28 Sep 2026)

- Next.js 16.3 (latest stable): `priority` on `next/image` is deprecated, so the hero uses the replacement prop `preload` (same behaviour).
- Lenis already honours CSS `scroll-margin-top`, so anchor offsets live in CSS only (`[id]` = header + 24px; on /menu + the jump bar). Passing an extra Lenis `offset` doubled it.
- Cormorant's default old-style figures made "12" read as "I2": display type uses lining numerals.
- Signature cards show short prices ("€26", "€4.50"); menu rows keep `formatPrice` ("€26.00") so the price column aligns.
- Home header is `fixed` over the hero (transparent → solid after 40px); all other pages use a `sticky` solid header.
- Menu hover preview only with a mouse on ≥768px (`hover: hover` + `pointer: fine`). Tablets/phones get 64px thumbnails. Before anything is hovered, the preview follows the category in view.
- Mobile menu adds a "Home" link above Menu / About (the wordmark is the only other way home on mobile).
- The unconfirmed FAQ answer (accessibility, PLACEHOLDER) is shown on the page but left out of the FAQPage JSON-LD until confirmed.
- Film-grain overlay included (static SVG noise, 4% opacity, no measurable cost).
- Booking success with `emailSent: false` also shows a "Call 043 000 0000" button, since that's the action we ask for.
- A 404 page gets its own title ("Page not found").
