import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claude, extractJson } from "./claude";
import { findSeed } from "@/lib/health/seed";
import type { FoodRatingPayload, Lang, Frequency } from "@/lib/health/types";

// Trimmed prompt — short, schema-only.  Lower max_tokens => faster response.
const SYSTEM_HE = `אתה תזונאי. נתח מאכל ב-JSON בלבד, בעברית, קצר וענייני.
{
  "rating": <1-10, 1=הכי בריא, 10=הכי מזיק>,
  "overview": "<משפט אחד מסכם>",
  "pros": ["<פס׳ קצר>", ...],          // עד 3
  "cons": ["<פס׳ קצר>", ...],          // עד 3
  "effects": { "heart": <1-5>, "muscles": <1-5>, "energy": <1-5>, "skin": <1-5>, "brain": <1-5>, "satiety": <1-5>, "bloodSugar": <1-5> },  // 1=מצוין 5=גרוע
  "nutrition": { "kcal": <num>, "protein": <num>, "carbs": <num>, "sugar": <num>, "fats": <num>, "fiber": <num> },  // ל-100ג׳
  "alternatives": ["<חלופה>", ...]      // עד 3
}
ללא markdown, ללא טקסט מסביב.`;

const SYSTEM_EN = `You are a nutritionist. Analyse a food in JSON only, English, short.
{
  "rating": <1-10, 1=healthiest, 10=worst>,
  "overview": "<one sentence>",
  "pros": ["<short>", ...],            // max 3
  "cons": ["<short>", ...],            // max 3
  "effects": { "heart": <1-5>, "muscles": <1-5>, "energy": <1-5>, "skin": <1-5>, "brain": <1-5>, "satiety": <1-5>, "bloodSugar": <1-5> },  // 1=great 5=bad
  "nutrition": { "kcal": <num>, "protein": <num>, "carbs": <num>, "sugar": <num>, "fats": <num>, "fiber": <num> },  // per 100g
  "alternatives": ["<alt>", ...]       // max 3
}
No markdown, no extra text.`;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Number(n) || 0));
}

function clampInt(n: number, lo: number, hi: number) {
  return Math.round(clamp(n, lo, hi));
}

function freqFromRating(r: number): Frequency {
  if (r <= 3) return "daily";
  if (r <= 6) return "weekly";
  if (r <= 8) return "rare";
  return "avoid";
}

function buildSeedFallback(query: string, lang: Lang, grams?: number): FoodRatingPayload | null {
  const seed = findSeed(query);
  if (!seed) return null;

  const overview =
    lang === "he"
      ? `${seed.he} מקבל דירוג ${seed.rating}/10.`
      : `${seed.en} is rated ${seed.rating}/10.`;

  const pros =
    seed.rating <= 3
      ? lang === "he"
        ? ["עשיר תזונתית", "מתאים לשגרה"]
        : ["Nutrient-dense", "Daily routine fit"]
      : seed.rating <= 6
      ? lang === "he"
        ? ["מספק", "ניתן לאזן"]
        : ["Satisfying", "Can be balanced"]
      : lang === "he"
      ? ["טעים"]
      : ["Tasty"];

  const cons =
    seed.rating <= 3
      ? []
      : seed.rating <= 6
      ? lang === "he"
        ? ["קלוריות גבוהות"]
        : ["Calorie-dense"]
      : lang === "he"
      ? ["סוכר/שומן גבוה", "ערך תזונתי דל"]
      : ["High sugar/fat", "Low nutrient value"];

  const effects = {
    heart: clampInt(seed.rating / 2, 1, 5),
    muscles: clampInt(6 - Math.min(5, seed.per100.protein / 5), 1, 5),
    energy: clampInt(seed.rating / 2.5, 1, 5),
    skin: clampInt(seed.rating / 2.5, 1, 5),
    brain: clampInt(seed.rating / 2.5, 1, 5),
    satiety: clampInt(6 - Math.min(5, seed.per100.fiber / 2 + seed.per100.protein / 8), 1, 5),
    bloodSugar: clampInt(Math.min(5, seed.per100.sugar / 4 + 1), 1, 5),
  };

  return {
    query,
    rating: seed.rating,
    frequency: freqFromRating(seed.rating),
    overview,
    pros,
    cons,
    effects,
    nutrition: { ...seed.per100 },
    alternatives:
      seed.rating <= 3
        ? []
        : lang === "he"
        ? ["סלט עם חלבון", "פירות עם יוגורט"]
        : ["Salad + protein", "Fruit + yogurt"],
    grams,
  };
}

export async function rateFood(
  query: string,
  opts: { lang: Lang; grams?: number } = { lang: "he" },
): Promise<FoodRatingPayload> {
  const { lang, grams } = opts;
  const trimmed = (query ?? "").trim();
  if (!trimmed) throw new Error("empty query");

  const sys = lang === "he" ? SYSTEM_HE : SYSTEM_EN;
  const userMsg =
    lang === "he"
      ? `מאכל: "${trimmed}"${grams ? ` (${grams} גרם)` : ""}. JSON בלבד.`
      : `Food: "${trimmed}"${grams ? ` (${grams} g)` : ""}. JSON only.`;

  let parsed: any = null;
  try {
    const c = claude();
    const res = await c.messages.create({
      model: CLAUDE_MODEL,
      // Significantly smaller — output is short JSON.
      max_tokens: 600,
      system: sys,
      messages: [{ role: "user", content: userMsg }],
    });
    const text = res.content
      .filter((b: any): b is Anthropic.TextBlock => b.type === "text")
      .map((b: any) => b.text)
      .join("\n");
    parsed = extractJson<any>(text);
  } catch {
    // fall through to seed
  }

  if (!parsed || typeof parsed !== "object") {
    const seedFallback = buildSeedFallback(trimmed, lang, grams);
    if (seedFallback) return seedFallback;
    throw new Error("ai_food_rating_failed");
  }

  // Sanitise everything.
  const rating = clampInt(Number(parsed.rating), 1, 10);
  const frequency: Frequency = freqFromRating(rating);

  const effects = {
    heart: clampInt(parsed?.effects?.heart, 1, 5),
    muscles: clampInt(parsed?.effects?.muscles, 1, 5),
    energy: clampInt(parsed?.effects?.energy, 1, 5),
    skin: clampInt(parsed?.effects?.skin, 1, 5),
    brain: clampInt(parsed?.effects?.brain, 1, 5),
    satiety: clampInt(parsed?.effects?.satiety, 1, 5),
    bloodSugar: clampInt(parsed?.effects?.bloodSugar, 1, 5),
  };

  const seed = findSeed(trimmed);
  const fallbackNutrition = seed?.per100 ?? {
    kcal: 0,
    protein: 0,
    carbs: 0,
    sugar: 0,
    fats: 0,
    fiber: 0,
  };

  const nutrition = {
    kcal: clamp(Number(parsed?.nutrition?.kcal ?? fallbackNutrition.kcal), 0, 1500),
    protein: clamp(Number(parsed?.nutrition?.protein ?? fallbackNutrition.protein), 0, 200),
    carbs: clamp(Number(parsed?.nutrition?.carbs ?? fallbackNutrition.carbs), 0, 200),
    sugar: clamp(Number(parsed?.nutrition?.sugar ?? fallbackNutrition.sugar), 0, 200),
    fats: clamp(Number(parsed?.nutrition?.fats ?? fallbackNutrition.fats), 0, 200),
    fiber: clamp(Number(parsed?.nutrition?.fiber ?? fallbackNutrition.fiber), 0, 100),
  };

  const cleanList = (xs: unknown, max: number): string[] =>
    Array.isArray(xs)
      ? xs.map((s) => String(s).slice(0, 120)).filter(Boolean).slice(0, max)
      : [];

  return {
    query: trimmed,
    rating,
    frequency,
    overview: String(parsed.overview ?? "").slice(0, 240),
    pros: cleanList(parsed.pros, 3),
    cons: cleanList(parsed.cons, 3),
    effects,
    nutrition,
    alternatives: cleanList(parsed.alternatives, 3),
    grams,
  };
}
