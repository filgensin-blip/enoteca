# Handover

Enoteca Ombra website v1: live: one click away (see README "Deploy it") · repo: https://github.com/filgensin-blip/enoteca (branch `claude/stoic-allen-3l9hpb`)

Built: Home, Menu, Book (own booking form + API), About & contact, Privacy, 404 · motion level 2 · English
Look: "A glass of wine, after dark." Dark Speakeasy tuned to oxblood + candle amber, Cormorant Garamond + Manrope, #D09A45

Needs you / the client before launch:
1. Details to confirm (PLACEHOLDER): address, phone, email, Instagram, hours + aperitivo, all prices, legal name + KvK, accessibility (FAQ), privacy retention period
2. Copy to approve (DRAFT): all page copy (data/copy.ts), menu descriptions, FAQ
3. Images to sign off: the 3 signatures + burrata, tiramisù, spritz, wine flight (they must match what's served). Hero is 1344px wide; upscale or regenerate it at 2400px in Higgsfield
4. Email: RESEND_API_KEY, CAFE_NOTIFICATION_EMAIL, BOOKING_FROM_EMAIL + verify the sending domain in Resend
5. Domain: none yet (Netlify URL)

Decisions I made: see docs/decisions.md (Next 16 `preload` instead of `priority`; anchor offsets in CSS only because Lenis honours scroll-margin; lining numerals in Cormorant; short prices on signature cards; menu preview only with a mouse; Home link in the mobile menu; unconfirmed FAQ answer kept out of JSON-LD; film grain on).
Booking defaults: every 30 min · last seating 60 min before kitchen close · 1–10 guests · 90 days ahead · 30 min notice
Deliberate v1 limits: no availability check or double-booking prevention, no database, no CMS, no payments

QA:
- `npx tsc --noEmit`: pass · `npm run lint`: pass · `npm run build`: pass, no warnings
- `node scripts/check-contrast.mjs`: 16/16 PASS · merged-class and stock-image greps: clean
- Hours unit check: Tue 16:00–21:00, Fri 16:00–21:30, Sun 15:00–20:00, Mon none; Sat 00:15 open, Sat 00:45 and Mon 20:00 closed
- Booking API (prod server): invalid → 400 with name/email/date errors · valid Tue 19:00 → 200 `emailSent:false` + `[BOOKING]` and `ACTION NEEDED` logged · Tue 22:00 → 400 on time · honeypot → 200, nothing logged · bad JSON → 400
- Browser: form end-to-end (success + error summary focus), skip link first, mobile menu focus + Esc, anchors land below header/jump bar, map iframe only after click
- Screenshots: checked, 6 routes × 375/768/1280/1440 + header states + reduced motion. No console errors, failed requests or horizontal overflow

Next step: import the repo into Netlify (README), then add the Resend variables so guests get confirmation emails.
