"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

let lenis: Lenis | null = null;

/**
 * Smoothly scrolls to an element. The header offset (header height + 24px, plus the jump bar on /menu)
 * comes from `scroll-margin-top` in globals.css, which both Lenis and native scrolling honour,
 * so there is one source of truth and no double offset.
 */
export function scrollToTarget(target: HTMLElement) {
  if (lenis) {
    lenis.scrollTo(target);
  } else {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
}

export function stopScroll() {
  lenis?.stop();
}
export function startScroll() {
  lenis?.start();
}

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId = 0;

    const destroy = () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = null;
    };

    const setup = () => {
      destroy();
      if (!fine.matches || reduce.matches) return;
      const instance = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis = instance;
      const raf = (time: number) => {
        instance.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    };

    setup();
    fine.addEventListener("change", setup);
    reduce.addEventListener("change", setup);

    // Same-page anchors (#x, or /menu#x while on /menu) glide with the header offset.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || !a.hash || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target);
      history.pushState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      fine.removeEventListener("change", setup);
      reduce.removeEventListener("change", setup);
      document.removeEventListener("click", onClick);
      destroy();
    };
  }, []);

  // Scroll to top on route change (unless the URL targets an anchor).
  useEffect(() => {
    if (window.location.hash) {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target) {
        requestAnimationFrame(() => scrollToTarget(target));
        return;
      }
    }
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
