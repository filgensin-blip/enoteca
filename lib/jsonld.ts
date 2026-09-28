import { siteInfo } from "@/data/site-info";
import { hours } from "@/data/hours";
import { photos } from "@/data/photos";
import { faq } from "@/data/faq";
import { siteUrl } from "@/lib/site-url";
import type { Day } from "@/data/types";

const schemaDay: Record<Day, string> = {
  mon: "https://schema.org/Monday",
  tue: "https://schema.org/Tuesday",
  wed: "https://schema.org/Wednesday",
  thu: "https://schema.org/Thursday",
  fri: "https://schema.org/Friday",
  sat: "https://schema.org/Saturday",
  sun: "https://schema.org/Sunday",
};

export function venueJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    name: siteInfo.name,
    description: siteInfo.description,
    url: siteUrl,
    image: [siteUrl + photos.hero.src],
    telephone: siteInfo.phone,
    email: siteInfo.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteInfo.address.street,
      postalCode: siteInfo.address.postcode,
      addressLocality: siteInfo.address.city,
      addressCountry: siteInfo.address.countryCode,
    },
    servesCuisine: siteInfo.servesCuisine,
    priceRange: siteInfo.priceRange,
    menu: siteUrl + "/menu",
    acceptsReservations: true,
    sameAs: siteInfo.socials.map((s) => s.url),
    openingHoursSpecification: hours
      .filter((h) => !h.closed && h.open && h.close)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: schemaDay[h.day],
        opens: h.open,
        closes: h.close,
      })),
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    // Unconfirmed answers stay out of structured data until the venue confirms them.
    mainEntity: faq.filter((f) => !f.a.startsWith("PLACEHOLDER")).map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Safe JSON for a <script type="application/ld+json"> tag. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
