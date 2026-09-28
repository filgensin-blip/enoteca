// v1 scope: this is a booking REQUEST flow. There is no availability check,
// no double-booking prevention and no database. Bookings are logged to server
// logs and emailed. Staff confirm manually. A database-backed booking log is v2.
import { Resend } from "resend";
import { siteInfo } from "@/data/site-info";
import { maskEmail, sanitize, validateBooking } from "@/lib/booking";
import { guestEmail, venueEmail } from "@/lib/email";

export const runtime = "nodejs";

const GENERIC_ERROR = `Something went wrong on our side. Please call us on ${siteInfo.phoneDisplay} and we'll book you in.`;

// Best-effort rate limit: 5 requests per IP per 10 minutes. On serverless each
// instance keeps its own memory, so this only slows down the obvious cases.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

function clientIp(req: Request): string {
  return (
    req.headers.get("x-nf-client-connection-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return Response.json({ errors: { form: "Invalid request." } }, { status: 400 });
    }

    if (rateLimited(clientIp(req))) {
      return Response.json(
        { errors: { form: `That's a lot of requests in a short time. Please wait a few minutes, or call us on ${siteInfo.phoneDisplay}.` } },
        { status: 429 },
      );
    }

    // Honeypot: pretend all is well and do nothing.
    const company = body && typeof body === "object" ? (body as Record<string, unknown>).company : undefined;
    if (typeof company === "string" && company.trim() !== "") {
      return Response.json({ ok: true, emailSent: true });
    }

    const result = validateBooking(body);
    if (!result.ok) return Response.json({ errors: result.errors }, { status: 400 });

    const data = sanitize(result.data);
    const receivedAt = new Date();
    console.log("[BOOKING]", JSON.stringify({ ...data, email: maskEmail(data.email), receivedAt: receivedAt.toISOString() }));

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[BOOKING] ACTION NEEDED: email not configured");
      return Response.json({ ok: true, emailSent: false });
    }

    // Created inside the handler: the constructor throws without a key and would break the build.
    const resend = new Resend(apiKey);
    const from = process.env.BOOKING_FROM_EMAIL || "Enoteca Ombra <onboarding@resend.dev>";
    const venueTo = process.env.CAFE_NOTIFICATION_EMAIL || siteInfo.email;
    const guest = guestEmail(data);
    const venue = venueEmail(data, receivedAt);

    const [guestResult, venueResult] = await Promise.allSettled([
      resend.emails.send({ from, to: data.email, replyTo: siteInfo.email, subject: guest.subject, html: guest.html, text: guest.text }),
      resend.emails.send({ from, to: venueTo, replyTo: data.email, subject: venue.subject, html: venue.html, text: venue.text }),
    ]);

    const failed = (r: PromiseSettledResult<{ error: unknown }>) => r.status === "rejected" || Boolean(r.value.error);
    if (failed(venueResult)) {
      console.error("[BOOKING] ACTION NEEDED: venue notification failed", venueResult.status === "rejected" ? venueResult.reason : venueResult.value.error);
    }
    if (failed(guestResult)) {
      console.error("[BOOKING] ACTION NEEDED: guest confirmation failed", guestResult.status === "rejected" ? guestResult.reason : guestResult.value.error);
      return Response.json({ ok: true, emailSent: false });
    }
    return Response.json({ ok: true, emailSent: true });
  } catch (err) {
    console.error("[BOOKING] ACTION NEEDED: unexpected error", err);
    return Response.json({ errors: { form: GENERIC_ERROR } }, { status: 500 });
  }
}
