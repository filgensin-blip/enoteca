"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "ul" | "li" | "article";
  /** Stagger direct children marked with data-reveal (80ms each, max 4 steps). */
  stagger?: boolean;
};

/** Fade-up on first view. Content is only hidden once JS has run (see .js in globals.css). */
export function Reveal({ children, className, as: Tag = "div", stagger }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items: HTMLElement[] = stagger
      ? Array.from(root.querySelectorAll<HTMLElement>(":scope > [data-reveal]"))
      : [root];
    items.forEach((el, i) => el.style.setProperty("--reveal-delay", `${Math.min(i, 4) * 80}ms`));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const targets = stagger ? items : [el];
          targets.forEach((t) => t.classList.add("is-in"));
          io.disconnect();
        });
      },
      { threshold: 0.15 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [stagger]);

  return (
    <Tag ref={ref as never} className={clsx(className)} {...(stagger ? {} : { "data-reveal": "" })}>
      {children}
    </Tag>
  );
}
