import { siteInfo } from "@/data/site-info";
import { aperitivo } from "@/data/hours";
import type { BookingData } from "@/lib/booking";
import { firstName, formatDateLong, formatDateShort, formatDateTimeInZone, mapsUrl } from "@/lib/format";
import { formatHoursCompact } from "@/lib/hours";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const fullAddress = `${siteInfo.address.street}, ${siteInfo.address.postcode} ${siteInfo.address.city}`;

export type Email = { subject: string; html: string; text: string };

export function guestEmail(b: BookingData): Email {
  const dateLong = formatDateLong(b.date);
  const guests = `${b.party} ${b.party === 1 ? "guest" : "guests"}`;
  const subject = `Your table at ${siteInfo.name} — ${dateLong}, ${b.time}`;
  const serif = "Georgia, 'Times New Roman', serif";
  const sans = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;color:#B5A792;font-family:${sans};font-size:14px;width:90px;vertical-align:top">${label}</td><td style="padding:6px 0;color:#F1E8DA;font-family:${sans};font-size:16px">${esc(value)}</td></tr>`;

  const html = `<!doctype html>
<html lang="en"><body style="margin:0;padding:0;background:#14100D">
<div style="max-width:560px;margin:0 auto;padding:40px 24px;background:#14100D;color:#F1E8DA;font-family:${sans};line-height:1.6">
  <p style="margin:0;font-family:${sans};font-size:10px;letter-spacing:0.32em;color:#D09A45">ENOTECA</p>
  <p style="margin:0 0 32px;font-family:${serif};font-style:italic;font-size:32px;color:#F1E8DA">Ombra</p>
  <h1 style="margin:0 0 16px;font-family:${serif};font-weight:normal;font-size:28px;color:#F1E8DA">Ciao ${esc(firstName(b.name))},</h1>
  <p style="margin:0 0 24px;font-size:16px">Thank you for your reservation. Here are the details:</p>
  <table role="presentation" style="width:100%;border-top:1px solid #3a322a;border-bottom:1px solid #3a322a;margin:0 0 24px;padding:12px 0">
    ${row("Date", dateLong)}
    ${row("Time", b.time)}
    ${row("Party", guests)}
    ${b.notes ? row("Notes", b.notes) : ""}
  </table>
  <p style="margin:0 0 24px;font-family:${serif};font-size:22px;color:#D09A45">We look forward to seeing you.</p>
  <p style="margin:0 0 8px;font-size:15px">${esc(siteInfo.name)}<br>${esc(fullAddress)}<br>
  <a href="${mapsUrl(`${siteInfo.name}, ${fullAddress}`)}" style="color:#D09A45">Open in Google Maps</a></p>
  <p style="margin:24px 0 8px;font-size:15px">Need to change or cancel? Reply to this email or call <a href="tel:${siteInfo.phone}" style="color:#D09A45">${esc(siteInfo.phoneDisplay)}</a>.</p>
  <p style="margin:24px 0 0;font-size:13px;color:#B5A792">${esc(formatHoursCompact())}<br>${esc(aperitivo.line)}</p>
</div>
</body></html>`;

  const text = [
    `Ciao ${firstName(b.name)},`,
    "",
    "Thank you for your reservation.",
    "",
    `Date:  ${dateLong}`,
    `Time:  ${b.time}`,
    `Party: ${guests}`,
    b.notes ? `Notes: ${b.notes}` : "",
    "",
    "We look forward to seeing you.",
    "",
    siteInfo.name,
    fullAddress,
    mapsUrl(`${siteInfo.name}, ${fullAddress}`),
    "",
    `Need to change or cancel? Reply to this email or call ${siteInfo.phoneDisplay}.`,
    "",
    formatHoursCompact(),
    aperitivo.line,
  ]
    .filter((line, i, all) => !(line === "" && all[i - 1] === ""))
    .join("\n");

  return { subject, html, text };
}

export function venueEmail(b: BookingData, receivedAt: Date): Email {
  const short = formatDateShort(b.date).replace(",", "");
  const subject = `New booking: ${short} ${b.time} · ${b.party}p · ${b.name}`;
  const lines: [string, string][] = [
    ["Name", b.name],
    ["Email", b.email],
    ["Phone", b.phone || "—"],
    ["Notes", b.notes || "—"],
    ["Received", formatDateTimeInZone(receivedAt)],
  ];
  const top = `${formatDateLong(b.date)} ${b.time} · ${b.party} guests`;
  const html = `<p><strong>${esc(top)}</strong></p>\n${lines
    .map(([k, v]) => `<p>${k}: ${esc(v)}</p>`)
    .join("\n")}`;
  const text = [top, "", ...lines.map(([k, v]) => `${k}: ${v}`)].join("\n");
  return { subject, html, text };
}
