import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/data/copy";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-[70svh] items-center justify-center bg-bg px-5 py-24 text-center">
      <div>
        <p className="font-display text-[clamp(6rem,14vw,11rem)] leading-[0.8] text-primary">404</p>
        <h1 className="h-section mt-8 text-ink">{copy.notFound.title}</h1>
        <p className="mx-auto mt-5 max-w-[44ch] text-muted">{copy.notFound.body}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
          <Link href="/" className="link link-ink font-medium">
            Home
          </Link>
          <Link href="/menu" className="link link-ink font-medium">
            Menu
          </Link>
          <Link href="/book" className="btn btn-primary">
            Book a table
          </Link>
        </div>
      </div>
    </div>
  );
}
