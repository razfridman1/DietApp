// Built-in seed of food health ratings.
// Used for the "examples" carousel and as instant lookup before hitting AI.
// Every entry is deliberately concise — the full deep analysis is generated on demand.

export type ImpactKey =
  | "heart"
  | "muscles"
  | "energy"
  | "skin"
  | "brain"
  | "satiety"
  | "bloodSugar";

export type Frequency = "daily" | "weekly" | "rare" | "avoid";

export interface SeedFood {
  /** Canonical Hebrew name */
  he: string;
  /** Canonical English name */
  en: string;
  /** Lowercase aliases for fast matching */
  aliases: string[];
  rating: number; // 1 (best) – 10 (worst)
  frequency: Frequency;
  /** Per 100g (or 100ml for drinks) — rough but realistic */
  per100: {
    kcal: number;
    protein: number;
    carbs: number;
    sugar: number;
    fats: number;
    fiber: number;
  };
  category: "produce" | "protein" | "grain" | "dairy" | "fat" | "snack" | "drink" | "fast" | "sweet";
}

/** Normalise a free-text query (lowercase, strip diacritics, collapse spaces). */
export function normalize(s: string): string {
  return (s ?? "")
    .normalize("NFKD")
    // eslint-disable-next-line no-misleading-character-class
    .replace(/[֑-ׇ]/g, "") // hebrew niqqud
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export const SEED: SeedFood[] = [
  // ---- 1-2: very healthy ---------------------------------------------------
  {
    he: "ברוקולי",
    en: "Broccoli",
    aliases: ["ברוקולי", "broccoli"],
    rating: 1,
    frequency: "daily",
    per100: { kcal: 34, protein: 2.8, carbs: 7, sugar: 1.7, fats: 0.4, fiber: 2.6 },
    category: "produce",
  },
  {
    he: "תרד",
    en: "Spinach",
    aliases: ["תרד", "spinach"],
    rating: 1,
    frequency: "daily",
    per100: { kcal: 23, protein: 2.9, carbs: 3.6, sugar: 0.4, fats: 0.4, fiber: 2.2 },
    category: "produce",
  },
  {
    he: "סלמון",
    en: "Salmon",
    aliases: ["סלמון", "salmon"],
    rating: 2,
    frequency: "weekly",
    per100: { kcal: 208, protein: 20, carbs: 0, sugar: 0, fats: 13, fiber: 0 },
    category: "protein",
  },
  {
    he: "ביצים",
    en: "Eggs",
    aliases: ["ביצים", "ביצה", "egg", "eggs"],
    rating: 2,
    frequency: "daily",
    per100: { kcal: 155, protein: 13, carbs: 1.1, sugar: 1.1, fats: 11, fiber: 0 },
    category: "protein",
  },
  {
    he: "אוכמניות",
    en: "Blueberries",
    aliases: ["אוכמניות", "blueberries"],
    rating: 1,
    frequency: "daily",
    per100: { kcal: 57, protein: 0.7, carbs: 14, sugar: 10, fats: 0.3, fiber: 2.4 },
    category: "produce",
  },
  {
    he: "שמן זית",
    en: "Olive oil",
    aliases: ["שמן זית", "olive oil"],
    rating: 2,
    frequency: "daily",
    per100: { kcal: 884, protein: 0, carbs: 0, sugar: 0, fats: 100, fiber: 0 },
    category: "fat",
  },
  {
    he: "אבוקדו",
    en: "Avocado",
    aliases: ["אבוקדו", "avocado"],
    rating: 2,
    frequency: "daily",
    per100: { kcal: 160, protein: 2, carbs: 9, sugar: 0.7, fats: 15, fiber: 7 },
    category: "produce",
  },
  {
    he: "יוגורט יווני",
    en: "Greek yogurt",
    aliases: ["יוגורט יווני", "greek yogurt"],
    rating: 2,
    frequency: "daily",
    per100: { kcal: 59, protein: 10, carbs: 3.6, sugar: 3.2, fats: 0.4, fiber: 0 },
    category: "dairy",
  },
  {
    he: "שיבולת שועל",
    en: "Oats",
    aliases: ["שיבולת שועל", "קוואקר", "oats", "oatmeal"],
    rating: 2,
    frequency: "daily",
    per100: { kcal: 389, protein: 17, carbs: 66, sugar: 0.99, fats: 7, fiber: 11 },
    category: "grain",
  },
  {
    he: "שקדים",
    en: "Almonds",
    aliases: ["שקדים", "almonds"],
    rating: 2,
    frequency: "daily",
    per100: { kcal: 579, protein: 21, carbs: 22, sugar: 4.4, fats: 50, fiber: 12 },
    category: "fat",
  },
  {
    he: "עוף בגריל",
    en: "Grilled chicken",
    aliases: ["עוף", "חזה עוף", "chicken", "grilled chicken"],
    rating: 2,
    frequency: "daily",
    per100: { kcal: 165, protein: 31, carbs: 0, sugar: 0, fats: 3.6, fiber: 0 },
    category: "protein",
  },

  // ---- 4-6: medium --------------------------------------------------------
  {
    he: "פיצה ביתית",
    en: "Homemade pizza",
    aliases: ["פיצה", "pizza", "פיצה ביתית"],
    rating: 5,
    frequency: "weekly",
    per100: { kcal: 266, protein: 11, carbs: 33, sugar: 3.6, fats: 10, fiber: 2.3 },
    category: "fast",
  },
  {
    he: "המבורגר איכותי",
    en: "Quality burger",
    aliases: ["המבורגר", "burger", "hamburger"],
    rating: 6,
    frequency: "weekly",
    per100: { kcal: 295, protein: 17, carbs: 24, sugar: 4, fats: 14, fiber: 1 },
    category: "fast",
  },
  {
    he: "פופקורן",
    en: "Popcorn",
    aliases: ["פופקורן", "popcorn"],
    rating: 4,
    frequency: "weekly",
    per100: { kcal: 387, protein: 13, carbs: 78, sugar: 0.9, fats: 4.5, fiber: 14 },
    category: "snack",
  },
  {
    he: "שוקולד מריר",
    en: "Dark chocolate",
    aliases: ["שוקולד מריר", "dark chocolate"],
    rating: 4,
    frequency: "weekly",
    per100: { kcal: 546, protein: 4.9, carbs: 61, sugar: 48, fats: 31, fiber: 7 },
    category: "sweet",
  },
  {
    he: "סושי",
    en: "Sushi",
    aliases: ["סושי", "sushi"],
    rating: 4,
    frequency: "weekly",
    per100: { kcal: 150, protein: 6, carbs: 28, sugar: 7, fats: 1.5, fiber: 1.2 },
    category: "fast",
  },
  {
    he: "שווארמה",
    en: "Shawarma",
    aliases: ["שווארמה", "shawarma"],
    rating: 6,
    frequency: "weekly",
    per100: { kcal: 290, protein: 18, carbs: 18, sugar: 2.5, fats: 16, fiber: 2 },
    category: "fast",
  },
  {
    he: "במבה",
    en: "Bamba",
    aliases: ["במבה", "bamba"],
    rating: 6,
    frequency: "weekly",
    per100: { kcal: 528, protein: 12, carbs: 51, sugar: 5, fats: 32, fiber: 4 },
    category: "snack",
  },

  // ---- 7-10: less healthy --------------------------------------------------
  {
    he: "קולה",
    en: "Cola",
    aliases: ["קולה", "קוקה קולה", "cola", "coke"],
    rating: 9,
    frequency: "avoid",
    per100: { kcal: 42, protein: 0, carbs: 10.6, sugar: 10.6, fats: 0, fiber: 0 },
    category: "drink",
  },
  {
    he: "XL",
    en: "XL energy drink",
    aliases: ["xl", "אקס אל", "אנרגיה", "energy drink"],
    rating: 10,
    frequency: "avoid",
    per100: { kcal: 45, protein: 0, carbs: 11, sugar: 11, fats: 0, fiber: 0 },
    category: "drink",
  },
  {
    he: "דוריטוס",
    en: "Doritos",
    aliases: ["דוריטוס", "doritos"],
    rating: 8,
    frequency: "rare",
    per100: { kcal: 498, protein: 7, carbs: 64, sugar: 3, fats: 24, fiber: 3.6 },
    category: "snack",
  },
  {
    he: "צ׳יטוס",
    en: "Cheetos",
    aliases: ["צ׳יטוס", "צ'יטוס", "cheetos"],
    rating: 8,
    frequency: "rare",
    per100: { kcal: 553, protein: 7, carbs: 56, sugar: 1.4, fats: 35, fiber: 1.4 },
    category: "snack",
  },
  {
    he: "סוכריות גומי",
    en: "Gummy candy",
    aliases: ["גומי", "סוכריות גומי", "gummy"],
    rating: 9,
    frequency: "rare",
    per100: { kcal: 343, protein: 6, carbs: 78, sugar: 47, fats: 0, fiber: 0.1 },
    category: "sweet",
  },
  {
    he: "קורנפלקס ממותק",
    en: "Sugary cornflakes",
    aliases: ["קורנפלקס", "קורנפלקס ממותק", "cornflakes"],
    rating: 7,
    frequency: "rare",
    per100: { kcal: 357, protein: 6, carbs: 84, sugar: 36, fats: 0.6, fiber: 3 },
    category: "grain",
  },
  {
    he: "דונאטס",
    en: "Donuts",
    aliases: ["דונאט", "דונאטס", "donut", "donuts"],
    rating: 9,
    frequency: "rare",
    per100: { kcal: 452, protein: 4.9, carbs: 51, sugar: 23, fats: 25, fiber: 1.4 },
    category: "sweet",
  },
  {
    he: "צ׳יפס מטוגן",
    en: "Fried chips",
    aliases: ["צ'יפס", "צ׳יפס", "chips", "fries"],
    rating: 8,
    frequency: "rare",
    per100: { kcal: 312, protein: 3.4, carbs: 41, sugar: 0.3, fats: 15, fiber: 3.8 },
    category: "fast",
  },
  {
    he: "נקניקיות",
    en: "Hot dogs",
    aliases: ["נקניקיות", "נקניק", "hot dog", "hot dogs"],
    rating: 9,
    frequency: "rare",
    per100: { kcal: 290, protein: 10, carbs: 4, sugar: 1, fats: 26, fiber: 0 },
    category: "protein",
  },
];

/** Find a seed food matching the query — case insensitive, alias aware. */
export function findSeed(query: string): SeedFood | null {
  const q = normalize(query);
  if (!q) return null;
  for (const f of SEED) {
    if (f.aliases.some((a) => normalize(a) === q)) return f;
  }
  // partial match — startsWith / contains
  for (const f of SEED) {
    if (f.aliases.some((a) => normalize(a).includes(q) || q.includes(normalize(a)))) {
      return f;
    }
  }
  return null;
}

export function ratingTone(r: number): "good" | "medium" | "bad" {
  if (r <= 3) return "good";
  if (r <= 6) return "medium";
  return "bad";
}
