import type { DayHours } from "./types";

// PLACEHOLDER — test hours from docs/questionnaire.md (Q2). Replace before launch.
export const hours: DayHours[] = [
  { day: "mon", closed: true },
  { day: "tue", open: "16:00", close: "23:00", kitchenClose: "22:00" },
  { day: "wed", open: "16:00", close: "23:00", kitchenClose: "22:00" },
  { day: "thu", open: "16:00", close: "23:00", kitchenClose: "22:00" },
  { day: "fri", open: "16:00", close: "00:30", closesNextDay: true, kitchenClose: "22:30" },
  { day: "sat", open: "16:00", close: "00:30", closesNextDay: true, kitchenClose: "22:30" },
  { day: "sun", open: "15:00", close: "22:00", kitchenClose: "21:00" },
];

export const aperitivo = { until: "18:00", line: "Aperitivo until 18:00: a cicchetto with every glass." }; // PLACEHOLDER

export const TIME_ZONE = "Europe/Amsterdam";

export const dayNames: Record<DayHours["day"], string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};
