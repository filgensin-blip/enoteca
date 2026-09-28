import type { SiteInfo } from "./types";

// PLACEHOLDER — every contact and legal detail below is a test value. Replace before launch.
export const siteInfo: SiteInfo = {
  name: "Enoteca Ombra",
  shortName: "Ombra",
  legalName: "Enoteca Ombra B.V.", // PLACEHOLDER
  kvk: "00000000", // PLACEHOLDER
  type: ["wine-bar", "restaurant"],
  tagline: "vino, cicchetti & candlelight · Maastricht",
  description:
    "An Italian enoteca in Maastricht: around 300 wines, twelve by the glass, cicchetti, taglieri and a few honest plates, by candlelight.",
  address: {
    street: "Wolfstraat 00", // PLACEHOLDER
    postcode: "6211 GN", // PLACEHOLDER
    city: "Maastricht",
    country: "Netherlands",
    countryCode: "NL",
  },
  // geo omitted on purpose: no verified coordinates (skill 10.2 — don't guess)
  phone: "+31430000000", // PLACEHOLDER
  phoneDisplay: "043 000 0000", // PLACEHOLDER
  email: "ciao@enoteca-ombra.nl", // PLACEHOLDER
  socials: [{ label: "Instagram", url: "https://instagram.com/enotecaombra" }], // PLACEHOLDER
  timeZone: "Europe/Amsterdam",
  priceRange: "€€",
  servesCuisine: ["Italian", "Venetian", "Wine bar"],
};
