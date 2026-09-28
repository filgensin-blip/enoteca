# CLAUDE.md

This repo is the Enoteca Ombra website (an Italian enoteca in Maastricht).

**Read `MASTER.md` end to end, then build the whole site in one run, exactly as specified.**

- Don't ask questions. Every decision is in `MASTER.md` or in the prewritten `data/` files. Log any judgement call in `docs/decisions.md` and keep going.
- Content (`data/*.ts`), images (`public/photos/`), icons and the OG image are final. Build around them; never add other images.
- Stack: Next.js App Router + TypeScript strict + Tailwind CSS v4 + Resend + Lenis. Deploy: Git-linked Netlify only.
- The site must build and work with zero environment variables.
- Before pushing: `npx tsc --noEmit`, `npm run build`, `node scripts/check-contrast.mjs` and the checks in MASTER.md Section 8 all pass.
- Finish with the handover in MASTER.md Section 10.
