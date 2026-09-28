# Enoteca Ombra: website

Italian enoteca in Maastricht. Next.js + Tailwind + Resend, deployed on Netlify.

## Build it (Claude Code)

Open this repo in Claude Code and send:

> Read CLAUDE.md and MASTER.md, then build the whole site, run the QA, commit and push. Don't ask me anything.

## Deploy it (one click)

1. app.netlify.com → **Add new project** → **Import an existing project** → **GitHub** → pick this repo.
2. Leave the detected settings (they come from `netlify.toml`) and click **Deploy**.

The site works right away with no environment variables. Bookings show up in Netlify under **Logs → Functions** as `[BOOKING]` lines, and guests are asked to call to confirm.

## Turn on booking emails (optional)

In Netlify → **Project configuration → Environment variables**, add the four variables from `.env.example`, then **Deploys → Trigger deploy**. Real guest emails need a domain verified in Resend (SPF + DKIM).

## Where things live

- `data/`: all content (menu, hours, contact, copy, photos). Edit here, never in components.
- `public/photos/`: the 13 Higgsfield images (see `docs/image-log.md`).
- `docs/questionnaire.md`: the client brief. `docs/handover.md`: what still needs the client.
