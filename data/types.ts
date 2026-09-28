export type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type DayHours = {
  day: Day;
  closed?: true;
  open?: string; // "HH:MM", 24h, venue time zone
  close?: string; // "HH:MM"; if earlier than open, closesNextDay must be true
  closesNextDay?: boolean;
  kitchenClose?: string; // last food orders; booking slots end 60 min before this
  note?: string;
};

export type Tag = "V" | "VG" | "GF" | "DF" | "N";

export type MenuItem = {
  id: string; // also the anchor id on /menu
  name: string;
  description?: string;
  price?: number; // euros, e.g. 4.5 -> "€4.50"
  priceNote?: string; // e.g. "per piece", "for two", "glass"
  tags?: Tag[];
  signature?: boolean;
  image?: PhotoKey;
  draft?: boolean; // copy written by Claude, client to approve
};

export type MenuCategory = {
  id: string;
  name: string;
  italian?: string; // small italic subtitle
  note?: string;
  items: MenuItem[];
};

export type SiteInfo = {
  name: string;
  shortName: string;
  legalName: string;
  kvk: string;
  type: string[];
  tagline: string;
  description: string;
  address: { street: string; postcode: string; city: string; country: string; countryCode: string };
  geo?: { lat: number; lng: number };
  phone: string; // E.164 for tel:
  phoneDisplay: string;
  email: string;
  socials: { label: string; url: string }[];
  timeZone: string;
  priceRange: string;
  servesCuisine: string[];
};

export type Photo = {
  src: string;
  width: number;
  height: number;
  alt: string; // "" = decorative
  blurDataURL: string;
  objectPosition?: string;
};

// Declared here so data files can reference photo keys without a cycle.
export type PhotoKey =
  | "hero"
  | "intro"
  | "sigTagliere"
  | "sigRisotto"
  | "sigBaccala"
  | "glassFlight"
  | "atmosphere"
  | "closing"
  | "book"
  | "about"
  | "menuBurrata"
  | "menuTiramisu"
  | "menuSpritz";
