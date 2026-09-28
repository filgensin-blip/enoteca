import { hours, dayNames, aperitivo, TIME_ZONE } from "@/data/hours";
import type { Day, DayHours } from "@/data/types";

// All maths happens in Europe/Amsterdam, whatever the server or visitor time zone.

export const DAYS: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const WEEKDAY_TO_DAY: Record<string, Day> = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
};

export type ZonedNow = { day: Day; minutes: number; dateISO: string };

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getNowInZone(date: Date = new Date()): ZonedNow {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = Number(get("hour")) % 24;
  return {
    day: WEEKDAY_TO_DAY[get("weekday")],
    minutes: hour * 60 + Number(get("minute")),
    dateISO: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

export function hoursFor(day: Day): DayHours {
  return hours.find((h) => h.day === day) ?? { day, closed: true };
}

function prevDay(day: Day): Day {
  return DAYS[(DAYS.indexOf(day) + 6) % 7];
}

function nextDayOf(day: Day): Day {
  return DAYS[(DAYS.indexOf(day) + 1) % 7];
}

/** Session end in minutes from that day's midnight (may exceed 1440 when closesNextDay). */
function sessionEnd(h: DayHours): number {
  const close = toMinutes(h.close!);
  return h.closesNextDay || close <= toMinutes(h.open!) ? close + 1440 : close;
}

export type OpenState = { open: true; until: string } | { open: false };

export function isOpenNow(now: ZonedNow = getNowInZone()): OpenState {
  // Yesterday's session running past midnight (e.g. Friday until 00:30 on Saturday).
  const yesterday = hoursFor(prevDay(now.day));
  if (!yesterday.closed && yesterday.open && yesterday.close) {
    const end = sessionEnd(yesterday) - 1440;
    if (end > 0 && now.minutes < end) return { open: true, until: yesterday.close };
  }
  const today = hoursFor(now.day);
  if (!today.closed && today.open && today.close) {
    const start = toMinutes(today.open);
    if (now.minutes >= start && now.minutes < sessionEnd(today)) return { open: true, until: today.close };
  }
  return { open: false };
}

export function nextOpening(now: ZonedNow = getNowInZone()): { day: Day; time: string; isToday: boolean } | null {
  for (let offset = 0; offset < 8; offset++) {
    let day = now.day;
    for (let i = 0; i < offset; i++) day = nextDayOf(day);
    const h = hoursFor(day);
    if (h.closed || !h.open) continue;
    if (offset === 0 && now.minutes >= toMinutes(h.open)) continue;
    return { day, time: h.open, isToday: offset === 0 };
  }
  return null;
}

export function dayOfISO(dateISO: string): Day {
  // Noon UTC keeps the calendar date stable in any zone.
  const d = new Date(`${dateISO}T12:00:00Z`);
  return DAYS[(d.getUTCDay() + 6) % 7];
}

export function addDaysISO(dateISO: string, days: number): string {
  const d = new Date(`${dateISO}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isClosedDay(dateISO: string): boolean {
  const h = hoursFor(dayOfISO(dateISO));
  return Boolean(h.closed || !h.open);
}

export const SLOT_STEP = 30;
export const LAST_SEATING_BEFORE_KITCHEN_CLOSE = 60;
export const MIN_NOTICE_MINUTES = 30;

/** Bookable times: every 30 min from opening until 60 min before kitchen close. */
export function getSlots(dateISO: string, now: ZonedNow = getNowInZone()): string[] {
  const h = hoursFor(dayOfISO(dateISO));
  if (h.closed || !h.open) return [];
  const start = toMinutes(h.open);
  const lastOrder = h.kitchenClose ? toMinutes(h.kitchenClose) : sessionEnd(h);
  const last = lastOrder - LAST_SEATING_BEFORE_KITCHEN_CLOSE;
  const slots: string[] = [];
  for (let t = start; t <= last; t += SLOT_STEP) {
    if (dateISO === now.dateISO && t < now.minutes + MIN_NOTICE_MINUTES) continue;
    slots.push(fromMinutes(t));
  }
  return slots;
}

export function todayKey(now: ZonedNow = getNowInZone()): Day {
  return now.day;
}

export function formatDayHours(day: Day): string {
  const h = hoursFor(day);
  if (h.closed || !h.open || !h.close) return "Closed";
  return `${h.open}–${h.close}`;
}

const SHORT: Record<Day, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

/** e.g. "Tue–Thu 16:00–23:00 · Fri–Sat 16:00–00:30 · Sun 15:00–22:00 · Mon closed" (week starts Tuesday). */
export function formatHoursCompact(): string {
  const order: Day[] = ["tue", "wed", "thu", "fri", "sat", "sun", "mon"];
  const groups: { days: Day[]; label: string }[] = [];
  for (const day of order) {
    const label = formatDayHours(day);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.days.push(day);
    else groups.push({ days: [day], label });
  }
  return groups
    .map(({ days, label }) => {
      const range = days.length > 1 ? `${SHORT[days[0]]}–${SHORT[days[days.length - 1]]}` : SHORT[days[0]];
      return label === "Closed" ? `${range} closed` : `${range} ${label}`;
    })
    .join(" · ");
}

export { dayNames, aperitivo };
