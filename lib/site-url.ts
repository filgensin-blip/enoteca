// Netlify sets URL at build time, so the first deploy works with no env vars.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "http://localhost:3000").replace(/\/$/, "");
