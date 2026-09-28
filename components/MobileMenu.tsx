"use client";

import { useEffect, useRef, type RefObject } from "react";
import Link from "next/link";
import { copy } from "@/data/copy";
import { siteInfo } from "@/data/site-info";
import { formatDayHours, getNowInZone, dayNames } from "@/lib/hours";
import { startScroll, stopScroll } from "./SmoothScroll";

type Props = { open: boolean; onClose: () => void; toggleRef: RefObject<HTMLButtonElement | null> };

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenu({ open, onClose, toggleRef }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    const panel = panelRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    stopScroll();
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      // Trap focus inside the toggle + the panel.
      const items = [toggle, ...Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))].filter(Boolean) as HTMLElement[];
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !items.includes(active!))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !items.includes(active!))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      startScroll();
      toggle?.focus();
    };
  }, [open, onClose, toggleRef]);

  if (!open) return null;
  const today = getNowInZone().day;

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      className="fixed inset-x-0 bottom-0 top-(--header-h) z-50 overflow-y-auto bg-bg md:hidden"
    >
      <nav aria-label="Mobile" className="flex min-h-full flex-col px-5 pb-10 pt-8">
        <ul className="flex flex-col gap-2">
          <li>
            <Link href="/" onClick={onClose} className="font-display text-[44px] leading-[1.15] text-ink">
              Home
            </Link>
          </li>
          {copy.nav.links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={onClose} className="font-display text-[44px] leading-[1.15] text-ink">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href={copy.nav.cta.href} onClick={onClose} className="btn btn-primary mt-10 w-full">
          {copy.nav.cta.label}
        </Link>
        <div className="mt-auto space-y-1 pt-12 text-[15px] text-muted">
          <p>
            Today, {dayNames[today]}: <span className="text-ink tabular">{formatDayHours(today)}</span>
          </p>
          <p>
            <a href={`tel:${siteInfo.phone}`} className="link">
              {siteInfo.phoneDisplay}
            </a>
          </p>
        </div>
      </nav>
    </div>
  );
}
