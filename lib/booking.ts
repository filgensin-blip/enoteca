import { addDaysISO, getNowInZone, getSlots, isClosedDay, type ZonedNow } from "@/lib/hours";

// Shared by the booking form (client) and /api/booking (server).

export const BOOKING_FIELDS = ["name", "email", "phone", "date", "time", "party", "notes"] as const;
export type BookingField = (typeof BOOKING_FIELDS)[number];

export type BookingInput = {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  party: number;
  notes: string;
  company?: string;
};

export type BookingData = Omit<BookingInput, "company">;
export type BookingErrors = Partial<Record<BookingField | "form", string>>;
export type BookingResult = { ok: true; data: BookingData } | { ok: false; errors: BookingErrors };

export const MAX_PARTY = 10;
export const MAX_DAYS_AHEAD = 90;
export const NOTES_MAX = 500;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+0-9 ()-]{6,20}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const messages = {
  name: "Please tell us your name.",
  email: "Please enter a valid email address.",
  phone: "Please check your phone number.",
  datePast: "Please choose a date from today onwards.",
  dateClosed: "We're closed on Mondays. Please pick another day.",
  dateFar: "We take bookings up to 90 days ahead.",
  time: "Please choose one of the available times.",
  party: "Tables online are for 1 to 10 guests.",
  notes: "Please keep notes under 500 characters.",
} as const;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validateField(field: BookingField, input: Partial<BookingInput>, now: ZonedNow = getNowInZone()): string | undefined {
  switch (field) {
    case "name": {
      const v = str(input.name);
      return v.length < 2 || v.length > 80 ? messages.name : undefined;
    }
    case "email": {
      const v = str(input.email);
      return !EMAIL_RE.test(v) || v.length > 120 ? messages.email : undefined;
    }
    case "phone": {
      const v = str(input.phone);
      return v && !PHONE_RE.test(v) ? messages.phone : undefined;
    }
    case "date": {
      const v = str(input.date);
      if (!DATE_RE.test(v) || Number.isNaN(Date.parse(`${v}T12:00:00Z`))) return messages.datePast;
      if (v < now.dateISO) return messages.datePast;
      if (v > addDaysISO(now.dateISO, MAX_DAYS_AHEAD)) return messages.dateFar;
      if (isClosedDay(v)) return messages.dateClosed;
      return undefined;
    }
    case "time": {
      const v = str(input.time);
      const date = str(input.date);
      if (!DATE_RE.test(date)) return messages.time;
      return getSlots(date, now).includes(v) ? undefined : messages.time;
    }
    case "party": {
      const n = Number(input.party);
      return Number.isInteger(n) && n >= 1 && n <= MAX_PARTY ? undefined : messages.party;
    }
    case "notes": {
      return str(input.notes).length > NOTES_MAX ? messages.notes : undefined;
    }
  }
}

export function validateBooking(raw: unknown, now: ZonedNow = getNowInZone()): BookingResult {
  const input = (raw && typeof raw === "object" ? raw : {}) as Partial<BookingInput>;
  const errors: BookingErrors = {};
  for (const field of BOOKING_FIELDS) {
    const message = validateField(field, input, now);
    if (message) errors[field] = message;
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: {
      name: str(input.name),
      email: str(input.email),
      phone: str(input.phone),
      date: str(input.date),
      time: str(input.time),
      party: Number(input.party),
      notes: str(input.notes),
    },
  };
}

/** Strip angle brackets before anything goes into an email. */
export function sanitize(data: BookingData): BookingData {
  const clean = (s: string) => s.replace(/[<>]/g, "");
  return {
    ...data,
    name: clean(data.name),
    email: clean(data.email),
    phone: clean(data.phone),
    date: clean(data.date),
    time: clean(data.time),
    notes: clean(data.notes),
  };
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user.slice(0, 1)}***@${domain}`;
}
