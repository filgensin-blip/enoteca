import type { MenuCategory } from "./types";

// PLACEHOLDER — test menu, all prices are placeholders. DRAFT — descriptions written by Claude.
// Items with an `image` are drawn exactly as photographed; do not change their descriptions
// without regenerating the photo (skill 8.1).
export const menu: MenuCategory[] = [
  {
    id: "aperitivi",
    name: "Aperitivi",
    italian: "before anything else",
    note: "Until 18:00 every glass comes with a cicchetto.",
    items: [
      {
        id: "spritz-veneziano",
        name: "Spritz Veneziano",
        description: "Bitter orange aperitivo, Prosecco, a splash of soda, an orange slice and a green olive",
        price: 9,
        image: "menuSpritz",
        tags: ["VG", "GF"],
        draft: true,
      },
      { id: "negroni", name: "Negroni", description: "Gin, bitter, sweet vermouth, orange peel, stirred over one big cube", price: 11, tags: ["VG", "GF"], draft: true },
      { id: "americano", name: "Americano", description: "Bitter, sweet vermouth, soda. The lighter way in", price: 9, tags: ["VG", "GF"], draft: true },
      { id: "analcolico", name: "Bitter analcolico", description: "Alcohol-free bitter, tonic, rosemary, orange", price: 7, tags: ["VG", "GF"], draft: true },
    ],
  },
  {
    id: "vino",
    name: "Wine by the glass",
    italian: "un'ombra",
    note: "Twelve open bottles, changed every week. Around 300 more in the cellar, from €32. Ask us.",
    items: [
      { id: "prosecco", name: "Prosecco Superiore, Valdobbiadene", description: "Fine bubbles, green apple, dry finish", price: 7, priceNote: "glass", draft: true },
      { id: "soave", name: "Soave Classico", description: "Garganega from volcanic soil: almond, white flowers, salt", price: 7.5, priceNote: "glass", draft: true },
      { id: "lugana", name: "Lugana", description: "Turbiana from the south shore of Lake Garda, round and citrusy", price: 8, priceNote: "glass", draft: true },
      { id: "chiaretto", name: "Chiaretto di Bardolino", description: "Pale rosé, wild strawberry, served cold", price: 7, priceNote: "glass", draft: true },
      { id: "barbera", name: "Barbera d'Alba", description: "Bright cherry, soft tannin, made for food", price: 8.5, priceNote: "glass", draft: true },
      { id: "ripasso", name: "Valpolicella Ripasso", description: "Re-passed over Amarone skins: dark cherry, spice, velvet", price: 9, priceNote: "glass", draft: true },
      { id: "amarone", name: "Amarone della Valpolicella", description: "Dried-grape red, fig, cocoa, a long warm finish", price: 14, priceNote: "glass", draft: true },
      {
        id: "degustazione",
        name: "Degustazione",
        description: "Eight small pours in a row, from Prosecco to Amarone, with a word on each",
        price: 24,
        priceNote: "flight",
        image: "glassFlight",
        draft: true,
      },
    ],
  },
  {
    id: "cicchetti",
    name: "Cicchetti",
    italian: "small bites, Venetian bacaro style",
    items: [
      {
        id: "baccala-mantecato",
        name: "Baccalà mantecato",
        description: "Whipped salt cod with olive oil and parsley, on grilled polenta",
        price: 4.5,
        priceNote: "per piece",
        signature: true,
        image: "sigBaccala",
        tags: ["GF"],
        draft: true,
      },
      { id: "polpette", name: "Polpette al sugo", description: "Veal and pork meatballs, slow tomato sauce, Parmigiano", price: 4.5, priceNote: "per piece", draft: true },
      { id: "mozzarella-carrozza", name: "Mozzarella in carrozza", description: "Fried mozzarella sandwich, anchovy, lemon", price: 4, priceNote: "per piece", draft: true },
      { id: "lardo", name: "Crostino, lardo & rosemary", description: "Lardo di Colonnata melting on warm toasted bread", price: 4, priceNote: "per piece", draft: true },
      { id: "olive", name: "Warm olives", description: "Green olives, orange peel, fennel seed", price: 5, tags: ["VG", "GF"], draft: true },
    ],
  },
  {
    id: "taglieri",
    name: "Taglieri & antipasti",
    italian: "to share",
    items: [
      {
        id: "tagliere-misto",
        name: "Tagliere misto",
        description:
          "Prosciutto crudo, salame, Parmigiano Reggiano, a soft white-rind cheese, gorgonzola, focaccia and green olives, on an oak board",
        price: 26,
        priceNote: "for two",
        signature: true,
        image: "sigTagliere",
        draft: true,
      },
      {
        id: "burrata",
        name: "Burrata & heirloom tomatoes",
        description: "Burrata, red, yellow and green heirloom tomatoes, basil, herb oil, flaky salt",
        price: 14,
        image: "menuBurrata",
        tags: ["V", "GF"],
        draft: true,
      },
      { id: "vitello-tonnato", name: "Vitello tonnato", description: "Thin rosé veal, tuna and caper mayonnaise", price: 13, tags: ["GF"], draft: true },
      { id: "focaccia", name: "Focaccia", description: "Baked this afternoon, olive oil, rosemary, sea salt", price: 5, tags: ["VG"], draft: true },
    ],
  },
  {
    id: "piatti",
    name: "Piatti",
    italian: "from the kitchen",
    items: [
      {
        id: "risotto-amarone",
        name: "Risotto all'Amarone",
        description: "Carnaroli rice cooked in Amarone until deep garnet, finished with shaved Parmigiano",
        price: 19,
        signature: true,
        image: "sigRisotto",
        tags: ["V", "GF"],
        draft: true,
      },
      { id: "bigoli", name: "Bigoli in salsa", description: "Thick Venetian pasta, slow-cooked onion and anchovy", price: 16, tags: ["DF"], draft: true },
      { id: "tagliatelle", name: "Tagliatelle al ragù bianco", description: "Egg pasta, white veal ragù, sage butter", price: 17, draft: true },
    ],
  },
  {
    id: "dolci",
    name: "Dolci",
    italian: "to finish",
    items: [
      {
        id: "tiramisu",
        name: "Tiramisù della casa",
        description: "Espresso-soaked savoiardi, mascarpone cream, a heavy dusting of cocoa",
        price: 8,
        image: "menuTiramisu",
        tags: ["V"],
        draft: true,
      },
      { id: "cantucci", name: "Cantucci & Vin Santo", description: "Almond biscuits with a small glass to dip them in", price: 9, tags: ["V", "N"], draft: true },
      { id: "affogato", name: "Affogato", description: "Vanilla gelato, a hot espresso poured over", price: 7, tags: ["V", "GF"], draft: true },
    ],
  },
];

export const tagLegend: Record<string, string> = {
  V: "Vegetarian",
  VG: "Vegan",
  GF: "Gluten-free",
  DF: "Dairy-free",
  N: "Contains nuts",
};

export const allergenLine =
  "Allergies or intolerances? Ask our team — we'll tell you exactly what's in every dish.";
