"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { getNowInZone } from "@/lib/hours";
import type { Day, DayHours } from "@/data/types";

type Props = { hours: DayHours[]; dayNames: Record<Day, string>; className?: string };

export function HoursTable({ hours, dayNames, className }: Props) {
  const [today, setToday] = useState<Day | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setToday(getNowInZone().day));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <table className={clsx("w-full border-collapse text-left", className)}>
      <thead>
        <tr className="border-b border-line text-[13px] uppercase tracking-[0.14em] text-muted">
          <th scope="col" className="py-3 pr-4 font-medium">Day</th>
          <th scope="col" className="py-3 pr-4 font-medium">Open</th>
          <th scope="col" className="py-3 font-medium">Kitchen</th>
        </tr>
      </thead>
      <tbody>
        {hours.map((h) => {
          const isToday = h.day === today;
          return (
            <tr key={h.day} className={clsx("hours-row border-b border-line", isToday && "bg-bg-alt")} aria-current={isToday ? "date" : undefined}>
              <th scope="row" className={clsx("py-4 pr-4 font-normal", isToday && "border-l-2 border-primary pl-4")}>
                <span className="hours-day inline-flex items-baseline gap-3">
                  {dayNames[h.day]}
                  {isToday && <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">Today</span>}
                </span>
              </th>
              <td className={clsx("py-4 pr-4 tabular", h.closed && "text-muted")}>
                {h.closed ? "Closed" : `${h.open}–${h.close}`}
              </td>
              <td className="py-4 text-muted tabular">{h.closed ? "—" : h.kitchenClose ? `until ${h.kitchenClose}` : "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
