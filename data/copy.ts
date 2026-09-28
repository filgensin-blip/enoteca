// DRAFT — all page copy written by Claude for the test build; client to approve.
// Components import from here. Do not hardcode copy in layout code.

export const copy = {
  nav: {
    links: [
      { href: "/menu", label: "Menu" },
      { href: "/about", label: "About & contact" },
    ],
    cta: { href: "/book", label: "Book a table" },
    mobileToggleOpen: "Menu",
    mobileToggleClose: "Close",
  },

  home: {
    hero: {
      eyebrow: "Enoteca · Maastricht",
      headline: "A glass of wine,", // line 1
      headlineItalic: "after dark.", // line 2, set in Cormorant italic — the page's one flourish
      sub: "Twelve wines open every night, cicchetti from the counter, and a candle on every table.",
      primary: { href: "/book", label: "Book a table" },
      secondary: { href: "/menu", label: "See the menu" },
    },
    intro: {
      eyebrow: "Un'ombra",
      title: "In Venice, a glass of wine is called an ombra.",
      body: [
        "The name comes from the shade: wine sellers in St Mark's Square moved their stalls with the shadow of the bell tower to keep the bottles cool. Asking for an ombra still means a small glass, poured without ceremony, drunk standing at the bar with something to eat.",
        "We opened Enoteca Ombra to do exactly that, a long way from the lagoon. A dark room, a long bar, around three hundred bottles, and a kitchen that cooks the way a bacaro does: small, generous, unfussy.",
      ],
      link: { href: "/about", label: "Our story" },
    },
    signatures: {
      eyebrow: "La casa",
      title: "Three things to order first",
      link: { href: "/menu", label: "The full menu" },
    },
    byTheGlass: {
      eyebrow: "By the glass",
      numeral: "12", // large Cormorant numeral, the site's recurring typographic anchor
      numeralLabel: "bottles open tonight",
      title: "Pour by pour, from Prosecco to Amarone.",
      body: "The open list changes every week and leans on small growers from the Veneto, Piedmont and Friuli. Not sure where to start? Order the degustazione: eight small pours in a row, with a word on each.",
      stats: [
        { value: "300", label: "labels in the cellar" },
        { value: "€32", label: "bottles from" },
        { value: "18:00", label: "aperitivo until" },
      ],
      link: { href: "/menu#vino", label: "Wines by the glass" },
    },
    atmosphere: {
      line: "Velvet, candlelight and a long wooden bar. Stay for one glass, or for the evening.",
    },
    hours: {
      eyebrow: "Opening hours",
      title: "Come by",
      directions: "Get directions",
      aboutLink: { href: "/about", label: "Contact & map" },
    },
    closing: {
      eyebrow: "Prenota",
      title: "Your table is waiting.",
      body: "Book online in a minute. The bar is always kept for walk-ins.",
      cta: { href: "/book", label: "Book a table" },
    },
  },

  menu: {
    title: "Menu",
    intro: "Cicchetti to start, taglieri to share, a few plates from the kitchen, and wine to go with all of it.",
    signatureLabel: "Signature",
  },

  book: {
    title: "Book a table",
    intro: "Tables of up to 10, up to 90 days ahead. We'll confirm by email. For larger groups or the whole room, call us.",
    walkIn: "No booking? The bar is kept for walk-ins.",
    submit: "Confirm reservation",
    sending: "Sending…",
    privacy: "We'll only use your details for this reservation.",
    partyHelp: "For parties larger than 10, please contact us directly.",
    successTitle: "Grazie",
  },

  about: {
    title: "About & contact",
    story: [
      "Ombra is what Venetians call a glass of wine, after the shade that kept it cool in St Mark's Square.",
      "We opened a small enoteca in Maastricht to pour one properly: a dark room with a long bar, candles on every table, and around three hundred bottles, mostly Italian, many from growers who make only a few thousand bottles a year.",
      "The kitchen follows the bacaro: cicchetti from the counter, boards of salumi and cheese, a risotto, a pasta, a tiramisù. Nothing complicated, everything made here.",
    ],
    values: [
      { title: "Small growers", body: "Most of the list comes from families we can name, not brands." },
      { title: "Generous pours", body: "A glass is a proper glass, and the cicchetti come without asking." },
      { title: "No rush", body: "Your table is yours for the evening. Stay for another." },
    ],
    contactTitle: "Contact",
    hoursTitle: "Opening hours",
    mapTitle: "Map & directions",
    mapButton: "Show map",
    mapNote: "The map loads from Google Maps when you click.",
    openInMaps: "Open in Google Maps",
    faqTitle: "Good to know",
  },

  notFound: {
    title: "This table doesn't exist.",
    body: "But the bar is open. Try one of these instead.",
  },

  footer: {
    photography: "Photography generated for Enoteca Ombra",
    ageNote: "18+ · Geen 18, geen alcohol",
  },
} as const;
