import { TIME_ZONE } from "@/data/hours";

const priceFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });

export function formatPrice(n: number): string {
  return priceFormatter.format(n);
}

/** For display prices on cards: "€26" rather than "€26.00"; "€4.50" stays as is. */
export function formatPriceShort(n: number): string {
  return Number.isInteger(n) ? priceFormatter.format(n).replace(/\.00$/, "") : priceFormatter.format(n);
}

/** "2026-10-17" → "Saturday 17 October" */
export function formatDateLong(dateISO: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TIME_ZONE,
  }).format(new Date(`${dateISO}T12:00:00Z`));
}

/** "2026-10-17" → "Sat 17 Oct" */
export function formatDateShort(dateISO: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: TIME_ZONE,
  }).format(new Date(`${dateISO}T12:00:00Z`));
}

export function formatDateTimeInZone(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  }).format(date);
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function mapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
