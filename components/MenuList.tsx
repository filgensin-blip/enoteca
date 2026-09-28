"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { photos } from "@/data/photos";
import { tagLegend } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import type { MenuCategory, MenuItem, PhotoKey } from "@/data/types";

type Props = { categories: MenuCategory[]; signatureLabel: string };

function Tags({ tags }: { tags: MenuItem["tags"] }) {
  if (!tags?.length) return null;
  return (
    <span className="inline-flex gap-1.5 align-middle">
      {tags.map((t) => (
        <abbr
          key={t}
          title={tagLegend[t]}
          className="inline-flex h-5 min-w-5 items-center justify-center rounded-[2px] border border-field px-1 text-[11px] font-medium leading-none text-muted no-underline"
        >
          <span aria-hidden="true">{t}</span>
          <span className="sr-only">{tagLegend[t]}</span>
        </abbr>
      ))}
    </span>
  );
}

export function MenuList({ categories, signatureLabel }: Props) {
  const firstImage = categories.flatMap((c) => c.items).find((i) => i.image);
  const [preview, setPreview] = useState<{ key: PhotoKey; name: string } | null>(
    firstImage?.image ? { key: firstImage.image, name: firstImage.name } : null,
  );

  const hovered = useRef(false);

  const show = (item: MenuItem) => {
    if (!item.image) return;
    hovered.current = true;
    setPreview({ key: item.image, name: item.name });
  };

  // Until something is hovered, follow the category in view: its first image, or nothing.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        if (hovered.current) return;
        const entry = entries.find((e) => e.isIntersecting);
        if (!entry) return;
        const cat = categories.find((c) => c.id === entry.target.id);
        const img = cat?.items.find((i) => i.image);
        setPreview(img?.image ? { key: img.image, name: img.name } : null);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    categories.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [categories]);

  const imageKeys = Array.from(new Set(categories.flatMap((c) => c.items.map((i) => i.image)).filter(Boolean))) as PhotoKey[];

  return (
    <div className="menu-grid mx-auto max-w-[1440px] px-5 md:px-10">
      <div className="menu-list">
        {categories.map((cat) => (
          <section key={cat.id} id={cat.id} aria-labelledby={`${cat.id}-title`} className="border-b border-line py-16 last:border-b-0 md:py-20">
            <h2 id={`${cat.id}-title`} className="font-display text-[40px] font-medium leading-none text-ink md:text-[44px]">
              {cat.name}
            </h2>
            {cat.italian && <p className="mt-2 font-display text-xl italic text-muted">{cat.italian}</p>}
            {cat.note && <p className="prose-width mt-4 text-[15px] text-ink/85">{cat.note}</p>}
            <div className="mt-10 space-y-7">
              {cat.items.map((item) => (
                <article
                  key={item.id}
                  id={item.id}
                  tabIndex={item.image ? 0 : undefined}
                  onMouseEnter={() => show(item)}
                  onFocus={() => show(item)}
                  className="menu-row group rounded-[2px] outline-offset-8"
                >
                  <div className="grid grid-cols-[1fr_auto] items-end gap-x-3">
                    <div className="flex min-w-0 items-end gap-3">
                      <h3 className="menu-name min-w-0 font-medium text-ink">
                        {item.name}
                        {item.signature && (
                          <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-primary sm:ml-2.5 sm:mt-0 sm:inline-block sm:align-middle">
                            {signatureLabel}
                          </span>
                        )}
                      </h3>
                      <span aria-hidden="true" className="menu-leader mb-1 hidden min-w-8 flex-1 sm:block" />
                    </div>
                    {item.price !== undefined && (
                      <p className="whitespace-nowrap text-right tabular">
                        {item.priceNote && <span className="mr-2 text-[13px] text-muted">{item.priceNote}</span>}
                        <span className="text-ink">{formatPrice(item.price)}</span>
                      </p>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      {item.description && <p className="text-[15px] leading-relaxed text-muted">{item.description}</p>}
                      {item.tags?.length ? (
                        <p className="mt-2">
                          <Tags tags={item.tags} />
                        </p>
                      ) : null}
                    </div>
                    {item.image && (
                      <div className="menu-thumb relative size-16 shrink-0 overflow-hidden rounded-[2px]">
                        <Image
                          src={photos[item.image].src}
                          alt=""
                          fill
                          sizes="64px"
                          placeholder="blur"
                          blurDataURL={photos[item.image].blurDataURL}
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Hover preview: desktop with a fine pointer only (see .menu-preview in globals.css). */}
      <aside aria-hidden="true" className="menu-preview">
        <div className="sticky top-[calc(var(--header-h)+80px)] pt-16">
          <div className="relative aspect-square overflow-hidden rounded-[2px] bg-bg-alt shadow-[0_24px_60px_-30px_rgb(0_0_0/0.8)]">
            {imageKeys.map((key) => (
              <Image
                key={key}
                src={photos[key].src}
                alt=""
                fill
                sizes="(min-width: 768px) 38vw, 0px"
                placeholder="blur"
                blurDataURL={photos[key].blurDataURL}
                className={clsx("preview-img object-cover", preview?.key === key ? "opacity-100" : "opacity-0")}
              />
            ))}
          </div>
          <p className="mt-4 min-h-7 font-display text-xl italic text-muted">{preview?.name}</p>
        </div>
      </aside>
    </div>
  );
}
