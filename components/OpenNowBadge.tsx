"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { dayNames, isOpenNow, nextOpening } from "@/lib/hours";

type State = { open: boolean; label: string } | null;

function compute(): State {
  const state = isOpenNow();
  if (state.open) return { open: true, label: `Open now · until ${state.until}` };
  const next = nextOpening();
  if (!next) return { open: false, label: "Closed" };
  return {
    open: false,
    label: next.isToday ? `Closed · opens today at ${next.time}` : `Closed · opens ${dayNames[next.day]} ${next.time}`,
  };
}

/** Server renders a neutral default; the real state is computed after mount (no hydration mismatch). */
export function OpenNowBadge({ className }: { className?: string }) {
  const [state, setState] = useState<State>(null);

  useEffect(() => {
    const update = () => setState(compute());
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const open = state?.open ?? true;
  return (
    <p aria-live="polite" className={clsx("inline-flex items-center gap-3 text-sm text-ink/90", className)}>
      <span
        aria-hidden="true"
        className={clsx("inline-block size-2 rounded-full", open ? "bg-primary" : "bg-muted")}
      />
      <span>{state ? state.label : "Open tonight from 16:00"}</span>
    </p>
  );
}
