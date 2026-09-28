"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { copy } from "@/data/copy";
import { Wordmark } from "./Wordmark";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const solid = !isHome || scrolled || open;

  return (
    <header
      className={clsx(
        "header-shell z-50 h-(--header-h) border-b",
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0",
        solid ? "border-line bg-bg" : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-6 px-5 md:px-10">
        <Wordmark />
        <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
          {copy.nav.links.map((link) => {
            const current = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className="link link-ink text-[15px] font-medium"
              >
                {link.label}
              </Link>
            );
          })}
          <Link href={copy.nav.cta.href} aria-current={pathname === copy.nav.cta.href ? "page" : undefined} className="btn btn-primary btn-sm">
            {copy.nav.cta.label}
          </Link>
        </nav>
        <button
          ref={toggleRef}
          type="button"
          className="-mr-2 inline-flex min-h-11 items-center px-2 text-[15px] font-medium text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? copy.nav.mobileToggleClose : copy.nav.mobileToggleOpen}
        </button>
      </div>
      <MobileMenu open={open} onClose={() => setOpen(false)} toggleRef={toggleRef} />
    </header>
  );
}
