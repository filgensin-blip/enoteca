import type { Metadata } from "next";
import { menu, tagLegend, allergenLine } from "@/data/menu";
import { copy } from "@/data/copy";
import { MenuJumpBar } from "@/components/MenuJumpBar";
import { MenuList } from "@/components/MenuList";

export const metadata: Metadata = {
  title: "Menu",
  description: "Cicchetti, taglieri, risotto and twelve wines by the glass at Enoteca Ombra, Maastricht.",
  alternates: { canonical: "/menu" },
};

export default function MenuPage() {
  return (
    <div className="menu-page">
      <header className="bg-bg pb-12 pt-16 md:pb-16 md:pt-24">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <p className="eyebrow">Enoteca Ombra</p>
          <h1 className="h-hero mt-6 text-ink">{copy.menu.title}</h1>
          <p className="prose-width mt-6 text-lg text-ink/90">{copy.menu.intro}</p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
            {Object.entries(tagLegend).map(([k, v]) => (
              <li key={k}>
                {k} · {v}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[13px] text-muted">{allergenLine}</p>
        </div>
      </header>
      <MenuJumpBar categories={menu.map(({ id, name }) => ({ id, name }))} />
      <MenuList categories={menu} signatureLabel={copy.menu.signatureLabel} />
    </div>
  );
}
