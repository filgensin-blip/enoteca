import type { Metadata } from "next";
import { copy } from "@/data/copy";
import { photos } from "@/data/photos";
import { siteInfo } from "@/data/site-info";
import { hours, dayNames, aperitivo } from "@/data/hours";
import { mapsUrl } from "@/lib/format";
import { faqJsonLd, jsonLdString } from "@/lib/jsonld";
import { Photo } from "@/components/Photo";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { FAQ } from "@/components/FAQ";
import { MapClickToLoad } from "@/components/MapClickToLoad";
import { HoursTable } from "@/components/HoursTable";

export const metadata: Metadata = {
  title: "About & contact",
  description: "The story of Enoteca Ombra, a Venetian-style wine bar in Maastricht, with address, opening hours, map and FAQ.",
  alternates: { canonical: "/about" },
};

const fullAddress = `${siteInfo.address.street}, ${siteInfo.address.postcode} ${siteInfo.address.city}`;
const mapQuery = `${siteInfo.name}, ${fullAddress}, ${siteInfo.address.country}`;

export default function AboutPage() {
  const a = copy.about;
  const [lede, ...rest] = a.story;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(faqJsonLd()) }} />

      <section className="bg-bg pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <Eyebrow>Enoteca Ombra</Eyebrow>
          <h1 className="h-hero mt-6 text-ink">{a.title}</h1>
          <Photo photo={photos.about} ratio="3/2" frame className="mt-12 md:mt-16" sizes="(min-width: 1440px) 1360px, 100vw" />
        </div>
      </section>

      <section aria-labelledby="story-title" className="bg-bg pb-24 md:pb-36">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 md:grid-cols-12 md:px-10">
          <Reveal className="md:col-span-3">
            <h2 id="story-title" className="eyebrow">
              Our story
            </h2>
          </Reveal>
          <Reveal className="md:col-span-8">
            <p className="font-display text-[26px] leading-snug text-ink md:text-[30px]">{lede}</p>
            <div className="prose-width mt-8 space-y-5 text-ink/90">
              {rest.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-label="What we care about" className="bg-bg-alt py-24 md:py-32">
        <Reveal stagger as="ul" className="mx-auto grid max-w-[1440px] gap-14 px-5 md:grid-cols-3 md:gap-10 md:px-10">
          {a.values.map((v) => (
            <li key={v.title} data-reveal="" className="value">
              <h3 className="font-display text-[32px] leading-tight text-ink">{v.title}</h3>
              <span aria-hidden="true" className="value-line mt-4 block h-px w-8 bg-primary" />
              <p className="mt-5 max-w-[36ch] text-muted">{v.body}</p>
            </li>
          ))}
        </Reveal>
      </section>

      <section className="bg-bg py-24 md:py-36">
        <div className="mx-auto grid max-w-[1440px] gap-16 px-5 md:grid-cols-12 md:gap-10 md:px-10">
          <Reveal className="md:col-span-4">
            <h2 id="contact" className="h-section text-ink">
              {a.contactTitle}
            </h2>
            <address className="mt-8 not-italic leading-8">
              <p className="font-display text-[26px] leading-snug text-ink">
                {siteInfo.address.street}
                <br />
                {siteInfo.address.postcode} {siteInfo.address.city}
              </p>
              <p className="mt-5">
                <a href={`tel:${siteInfo.phone}`} className="link">
                  {siteInfo.phoneDisplay}
                </a>
              </p>
              <p>
                <a href={`mailto:${siteInfo.email}`} className="link">
                  {siteInfo.email}
                </a>
              </p>
              {siteInfo.socials.map((s) => (
                <p key={s.url}>
                  <a href={s.url} className="link" target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </p>
              ))}
            </address>
          </Reveal>
          <Reveal className="md:col-span-7 md:col-start-6">
            <h2 id="hours" className="h-section text-ink">
              {a.hoursTitle}
            </h2>
            <HoursTable hours={hours} dayNames={dayNames} className="mt-8" />
            <p className="mt-5 text-muted">{aperitivo.line}</p>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="map" className="bg-bg-alt py-24 md:py-36">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <h2 id="map" className="h-section text-ink">
            {a.mapTitle}
          </h2>
          <div className="mt-10">
            <MapClickToLoad query={mapQuery} address={fullAddress} buttonLabel={a.mapButton} note={a.mapNote} />
          </div>
          <a href={mapsUrl(mapQuery)} target="_blank" rel="noopener noreferrer" className="link mt-6 inline-flex items-center gap-2 font-medium">
            {a.openInMaps} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="bg-bg py-24 md:py-36">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 md:grid-cols-12 md:px-10">
          <div className="md:col-span-4">
            <h2 id="faq-title" className="h-section text-ink">
              {a.faqTitle}
            </h2>
          </div>
          <div className="md:col-span-8">
            <FAQ />
          </div>
        </div>
      </section>
    </>
  );
}
