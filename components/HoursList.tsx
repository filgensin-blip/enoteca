"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { hours } from "@/data/hours";
import { dayNames, formatDayHours, getNowInZone } from "@/lib/hours";
import type { Day } from "@/data/types";

const ORDER: Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** Weekly hours; today's row is highlighted after mount (Amsterdam time). */
export function HoursList({ compact = false, className }: { compact?: boolean; className?: string }) {
  const [today, setToday] = useState<Day | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setToday(getNowInZone().day));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <ul className={clsx("divide-y divide-line border-y border-line", className)}>
      {ORDER.map((day) => {
        const h = hours.find((x) => x.day === day);
        const isToday = day === today;
        return (
          <li
            key={day}
            className={clsx(
              "hours-row relative flex items-baseline justify-between gap-4",
              compact ? "py-2 text-[15px]" : "py-3",
              isToday && "pl-4",
            )}
          >
            {isToday && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 bg-primary" />}
            <span className="hours-day inline-flex items-baseline gap-3">
              <span className={clsx(isToday ? "text-ink" : "text-ink/90")}>{dayNames[day]}</span>
              {isToday && <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">Today</span>}
            </span>
            <span className="text-right tabular">
              <span className={clsx(h?.closed ? "text-muted" : "text-ink")}>{formatDayHours(day)}</span>
              {!compact && h?.kitchenClose && (
                <span className="block text-[13px] text-muted">Kitchen until {h.kitchenClose}</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
