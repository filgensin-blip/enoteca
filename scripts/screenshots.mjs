// Usage: start the prod server on :3100, then `node scripts/screenshots.mjs [baseUrl]`.
// Full-page PNGs go to /tmp/shots. Logs console errors, failed requests and horizontal overflow.
import { chromium } from "playwright";
import { existsSync, mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const out = "/tmp/shots";
mkdirSync(out, { recursive: true });
const routes = ["/", "/menu", "/book", "/about", "/privacy", "/does-not-exist"];
const widths = [375, 768, 1280, 1440];
const executablePath = existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined;
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const problems = [];

async function shoot(route, width, { reducedMotion = "no-preference", scrollY = null, suffix = "", fullPage = true } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 768 ? 812 : 900 }, reducedMotion });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && problems.push(`${route}@${width}${suffix} console: ${m.text()}`));
  page.on("requestfailed", (r) => problems.push(`${route}@${width}${suffix} failed: ${r.url()}`));
  page.on("response", (r) => r.status() >= 400 && !r.url().includes("does-not-exist") && problems.push(`${route}@${width}${suffix} ${r.status()}: ${r.url()}`));
  await page.goto(base + route, { waitUntil: "networkidle" });
  // Reveal everything that scrolls into view, then return to the top.
  if (fullPage) {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(900);
  }
  if (scrollY !== null) { await page.evaluate((y) => window.scrollTo(0, y), scrollY); await page.waitForTimeout(500); }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) problems.push(`${route}@${width}${suffix} horizontal overflow ${overflow}px`);
  const name = `${route === "/" ? "home" : route.slice(1)}-${width}${suffix}.png`;
  await page.screenshot({ path: `${out}/${name}`, fullPage });
  await ctx.close();
}

for (const route of routes) for (const w of widths) await shoot(route, w);
await shoot("/", 1280, { scrollY: 0, suffix: "-top", fullPage: false });
await shoot("/", 1280, { scrollY: 200, suffix: "-scrolled", fullPage: false });
for (const route of routes) await shoot(route, 1280, { reducedMotion: "reduce", suffix: "-reduced" });

await browser.close();
console.log(problems.length ? problems.join("\n") : "No console errors, failed requests or overflow.");
