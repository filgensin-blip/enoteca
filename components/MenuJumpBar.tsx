"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { MenuCategory } from "@/data/types";

export function MenuJumpBar({ categories }: { categories: Pick<MenuCategory, "id" | "name">[] }) {
  const [active, setActive] = useState(categories[0]?.id);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        const first = categories.find((c) => visible.get(c.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-180px 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [categories]);

  // Keep the active link in view on the horizontally scrolling mobile bar.
  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    if (!list || !link || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: link.offsetLeft - 20, behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label="Menu categories"
      data-jumpbar=""
      className="sticky top-(--header-h) z-40 border-b border-line bg-bg"
    >
      <ul
        ref={listRef}
        className="no-scrollbar mx-auto flex max-w-[1440px] snap-x gap-7 overflow-x-auto px-5 md:gap-10 md:px-10"
      >
        {categories.map((c) => (
          <li key={c.id} className="shrink-0 snap-start">
            <a
              href={`#${c.id}`}
              data-cat={c.id}
              aria-current={active === c.id ? "true" : undefined}
              className={clsx(
                "link inline-flex min-h-14 items-center text-[15px] font-medium",
                active === c.id ? "text-primary" : "link-ink",
              )}
            >
              {c.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
