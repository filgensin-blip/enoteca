// Usage: node scripts/check-contrast.mjs — exits 1 on any failure. Keep in sync with app/globals.css.
const pairs = [
  // [label, foreground, background, minimum]
  ["ink/bg", "#F1E8DA", "#14100D", 4.5],
  ["ink/bg-alt", "#F1E8DA", "#1D1713", 4.5],
  ["muted/bg", "#B5A792", "#14100D", 4.5],
  ["muted/bg-alt", "#B5A792", "#1D1713", 4.5],
  ["primary(link)/bg", "#D09A45", "#14100D", 4.5],
  ["primary(link)/bg-alt", "#D09A45", "#1D1713", 4.5],
  ["on-primary/primary", "#14100D", "#D09A45", 4.5],
  ["on-dark/dark", "#F1E8DA", "#3A1418", 4.5],
  ["muted-on-dark/dark", "#D6C3B0", "#3A1418", 4.5],
  ["primary/dark", "#D09A45", "#3A1418", 3.0],
  ["focus-ring/bg", "#D09A45", "#14100D", 3.0],
  ["input-border/bg", "#7A6D5E", "#14100D", 3.0],
  ["input-border/bg-alt", "#7A6D5E", "#1D1713", 3.0],
  ["error/bg", "#F08A7E", "#14100D", 4.5],
  ["hero-headline over lamp hotspot under 50% shade (large text)", "#F1E8DA", "#7C7C7C", 3.0],
  ["hero-subline over headline zone under shade (mean luma 15)", "#F1E8DA", "#0A0806", 4.5],
];
const hex = (h) => h.replace("#", "").match(/.{2}/g).map((x) => parseInt(x, 16) / 255);
const lum = (c) => { const [r, g, b] = hex(c).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
let fail = 0;
for (const [label, fg, bg, min] of pairs) {
  const r = ratio(fg, bg); const ok = r >= min; if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"} ${label.padEnd(58)} ${r.toFixed(2)}:1 (min ${min})`);
}
process.exit(fail ? 1 : 0);
