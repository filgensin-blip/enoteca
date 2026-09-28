import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/data/copy";
import { photos } from "@/data/photos";
import { menu } from "@/data/menu";
import { siteInfo } from "@/data/site-info";
import { aperitivo } from "@/data/hours";
import { formatPriceShort, mapsUrl } from "@/lib/format";
import { Photo } from "@/components/Photo";
import { Button, Arrow } from "@/components/Button";
import { Eyebrow } from "@/components/Eyebrow";
import { OpenNowBadge } from "@/components/OpenNowBadge";
import { HoursList } from "@/components/HoursList";
import { Reveal } from "@/components/Reveal";
import type { MenuItem } from "@/data/types";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const SIGNATURE_ORDER = ["tagliere-misto", "risotto-amarone", "baccala-mantecato"];

function signatures(): MenuItem[] {
  const all = menu.flatMap((c) => c.items).filter((i) => i.signature);
  return SIGNATURE_ORDER.map((id) => all.find((i) => i.id === id)).filter((i): i is MenuItem => Boolean(i));
}

const fullAddress = `${siteInfo.address.street}, ${siteInfo.address.postcode} ${siteInfo.address.city}`;

export default function Home() {
  const { hero, intro, signatures: sig, byTheGlass, atmosphere, hours: hoursCopy, closing } = copy.home;

  return (
    <>
      {/* 1. Hero */}
      <section aria-labelledby="hero-title" className="relative flex min-h-[max(600px,100svh)] items-end overflow-hidden">
        <Photo photo={photos.hero} fill priority sizes="100vw" />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgb(10 8 6 / 0.85), transparent 45%), linear-gradient(to right, rgb(10 8 6 / 0.78) 0%, rgb(10 8 6 / 0.45) 45%, transparent 75%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-40"
          style={{ background: "linear-gradient(to bottom, rgb(10 8 6 / 0.55), transparent)" }}
        />
        <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-20 pt-32 md:px-10 md:pb-28">
          <div className="max-w-3xl">
            <Eyebrow>{hero.eyebrow}</Eyebrow>
            <h1 id="hero-title" className="h-hero mt-6 text-ink">
              {hero.headline}
              <br />
              <span className="italic">{hero.headlineItalic}</span>
            </h1>
            <p className="mt-7 max-w-[44ch] text-lg text-ink/90 md:text-xl">{hero.sub}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Button href={hero.primary.href}>{hero.primary.label}</Button>
              <Link href={hero.secondary.href} className="link link-ink inline-flex items-center gap-2 font-medium">
                {hero.secondary.label} <Arrow />
              </Link>
            </div>
            <OpenNowBadge className="mt-9" />
          </div>
        </div>
      </section>

      {/* 3. Intro */}
      <section aria-labelledby="intro-title" className="bg-bg py-24 md:py-36">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 md:grid-cols-12 md:gap-10 md:px-10">
          <Reveal className="md:col-span-5">
            <Photo photo={photos.intro} ratio="4/5" frame sizes="(min-width: 768px) 40vw, 100vw" />
          </Reveal>
          <Reveal className="md:col-span-6 md:col-start-7">
            <Eyebrow>{intro.eyebrow}</Eyebrow>
            <h2 id="intro-title" className="h-section mt-6 text-ink">
              {intro.title}
            </h2>
            <div className="prose-width mt-8 space-y-5 text-ink/90">
              {intro.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <Link href={intro.link.href} className="link mt-8 inline-flex items-center gap-2 font-medium">
              {intro.link.label} <Arrow />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 4. Signatures */}
      <section aria-labelledby="sig-title" className="bg-bg-alt py-24 md:py-36">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>{sig.eyebrow}</Eyebrow>
              <h2 id="sig-title" className="h-section mt-6 text-ink">
                {sig.title}
              </h2>
            </div>
            <Link href={sig.link.href} className="link inline-flex items-center gap-2 font-medium">
              {sig.link.label} <Arrow />
            </Link>
          </Reveal>
          <Reveal stagger as="ul" className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
            {signatures().map((item) => (
              <li key={item.id} data-reveal="">
                <Link href={`/menu#${item.id}`} className="sig-card group block">
                  {item.image && (
                    <Photo photo={photos[item.image]} ratio="4/5" sizes="(min-width: 768px) 30vw, 100vw" />
                  )}
                  <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-display text-[28px] leading-tight text-ink">
                      <span className="sig-title pb-0.5">{item.name}</span>
                    </h3>
                    {item.price !== undefined && (
                      <p className="sig-price shrink-0 text-right">
                        <span className="font-display text-[28px] text-primary tabular">{formatPriceShort(item.price)}</span>
                        {item.priceNote && <span className="ml-1.5 text-[13px] text-muted">{item.priceNote}</span>}
                      </p>
                    )}
                  </div>
                  {item.description && <p className="mt-2 line-clamp-2 text-[15px] text-muted">{item.description}</p>}
                </Link>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 5. By the glass */}
      <section aria-labelledby="glass-title" className="bg-bg py-24 md:py-36">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="grid items-center gap-12 md:grid-cols-12 md:gap-10">
            <Reveal className="md:col-span-5">
              <Eyebrow>{byTheGlass.eyebrow}</Eyebrow>
              <p className="mt-8 font-display font-medium leading-[0.8] text-primary" style={{ fontSize: "clamp(7rem, 14vw, 13rem)" }}>
                {byTheGlass.numeral}
              </p>
              <p className="mt-3 text-muted">{byTheGlass.numeralLabel}</p>
              <h2 id="glass-title" className="h-section mt-10 text-ink">
                {byTheGlass.title}
              </h2>
              <p className="prose-width mt-6 text-ink/90">{byTheGlass.body}</p>
              <Link href={byTheGlass.link.href} className="link mt-8 inline-flex items-center gap-2 font-medium">
                {byTheGlass.link.label} <Arrow />
              </Link>
            </Reveal>
            <Reveal className="md:col-span-7">
              <Photo photo={photos.glassFlight} ratio="3/2" sizes="(min-width: 768px) 55vw, 100vw" />
            </Reveal>
          </div>
          <Reveal stagger as="ul" className="mt-16 grid grid-cols-3 border-y border-line md:mt-24">
            {byTheGlass.stats.map((s, i) => (
              <li key={s.label} data-reveal="" className={i > 0 ? "border-l border-line px-3 py-8 md:px-10" : "py-8 pr-3 md:pr-10"}>
                <p className="font-display text-[34px] leading-none text-ink tabular md:text-[48px]">{s.value}</p>
                <p className="mt-3 text-[13px] text-muted md:text-[15px]">{s.label}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 6. Atmosphere band */}
      <section aria-label="Atmosphere" className="relative flex min-h-[360px] items-center md:aspect-[21/9] md:min-h-0">
        <Photo photo={photos.atmosphere} fill sizes="100vw" alt="" />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 72% 50%, rgb(10 8 6 / 0.72), rgb(10 8 6 / 0.35) 55%, transparent 80%)" }}
        />
        <div className="relative mx-auto flex w-full max-w-[1440px] justify-center px-5 md:justify-end md:px-10">
          <p className="max-w-[20ch] text-center font-display text-[32px] italic leading-[1.15] text-ink md:w-[45%] md:max-w-none md:text-left md:text-[44px]">
            {atmosphere.line}
          </p>
        </div>
      </section>

      {/* 7. Hours & location */}
      <section aria-labelledby="hours-title" className="bg-bg-alt py-24 md:py-36">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-5 md:grid-cols-12 md:gap-10 md:px-10">
          <Reveal className="md:col-span-6">
            <Eyebrow>{hoursCopy.eyebrow}</Eyebrow>
            <h2 id="hours-title" className="h-section mt-6 text-ink">
              {hoursCopy.title}
            </h2>
            <HoursList className="mt-10" />
            <p className="mt-6 text-muted">{aperitivo.line}</p>
          </Reveal>
          <Reveal className="md:col-span-5 md:col-start-8 md:pt-24">
            <address className="font-display text-[28px] not-italic leading-snug text-ink">
              {siteInfo.address.street}
              <br />
              {siteInfo.address.postcode} {siteInfo.address.city}
            </address>
            <p className="mt-4">
              <a href={`tel:${siteInfo.phone}`} className="link">
                {siteInfo.phoneDisplay}
              </a>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Button href={mapsUrl(`${siteInfo.name}, ${fullAddress}`)} variant="outline" external>
                {hoursCopy.directions}
              </Button>
              <Link href="/about#map" className="link inline-flex items-center gap-2 font-medium">
                {hoursCopy.aboutLink.label} <Arrow />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8. Closing CTA */}
      <section aria-labelledby="closing-title" className="bg-dark py-24 text-on-dark md:py-36">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 md:grid-cols-12 md:gap-10 md:px-10">
          <Reveal className="md:col-span-6">
            <Photo photo={photos.closing} ratio="3/2" sizes="(min-width: 768px) 50vw, 100vw" />
          </Reveal>
          <Reveal className="md:col-span-5 md:col-start-8">
            <Eyebrow>{closing.eyebrow}</Eyebrow>
            <h2 id="closing-title" className="h-closing mt-6">
              {closing.title}
            </h2>
            <p className="mt-6 max-w-[40ch] text-lg text-muted-on-dark">{closing.body}</p>
            <Button href={closing.cta.href} className="mt-9">
              {closing.cta.label}
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
