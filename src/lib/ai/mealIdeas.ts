import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claude, extractJson } from "./claude";

export interface MealIdea {
  name: string;
  description: string;
  calories: number;
  ingredients: string[];
}

export interface MealIdeasResult {
  ideas: MealIdea[];
}

const SYSTEM = `You are a nutrition expert who suggests realistic, everyday meal ideas in HEBREW.
The user provides a MAXIMUM calorie limit. You MUST generate exactly 10 distinct meal ideas, each STRICTLY BELOW that calorie limit.

Hard rules:
- Reply with ONLY a JSON object — no prose, no markdown, no code fences.
- Exactly 10 ideas in the "ideas" array.
- Every meal's "calories" field MUST be a realistic integer that is strictly LESS than the user's limit.
- Calorie estimates must be believable for the listed ingredients and portion (no random or rounded fantasy numbers).
- Meals should be simple, quick, and realistic for everyday people (Israeli/Mediterranean style is welcome).
- Prefer high-protein, filling, balanced meals.
- Variety is required — do not repeat similar dishes (no two chicken-and-rice variants, etc.). Mix proteins, cuisines, and meal types (breakfast/lunch/dinner/snack).
- No extreme diets, fasting tricks, or unsafe suggestions.
- All Hebrew text must be natural and concise.

Return this EXACT JSON shape:
{
  "ideas": [
    {
      "name": "<short Hebrew meal name, max 6 words>",
      "description": "<one short Hebrew sentence describing the meal>",
      "calories": <integer kcal, strictly below the limit>,
      "ingredients": ["<Hebrew ingredient 1>", "<Hebrew ingredient 2>", "..."]
    }
    // ... 10 total
  ]
}`;

export async function generateMealIdeas(maxCalories: number): Promise<MealIdeasResult> {
  const c = claude();
  const limit = Math.max(50, Math.round(maxCalories));
  const userMsg = `Maximum calorie limit per meal: ${limit} kcal.
Generate exactly 10 distinct meal ideas in Hebrew, each strictly below ${limit} kcal.`;

  const res = await c.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2000,
    system: SYSTEM,
    messages: [{ role: "user", content: userMsg }],
  });

  const text = res.content
    .filter((b: any): b is Anthropic.TextBlock => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");

  const parsed = extractJson<MealIdeasResult>(text);
  const rawIdeas = Array.isArray(parsed?.ideas) ? parsed.ideas : [];

  // Sanitise + enforce the calorie ceiling defensively.
  const ideas: MealIdea[] = rawIdeas
    .map((it: any) => ({
      name: String(it?.name ?? "ארוחה").slice(0, 80),
      description: String(it?.description ?? "").slice(0, 240),
      calories: Math.max(0, Math.round(Number(it?.calories) || 0)),
      ingredients: Array.isArray(it?.ingredients)
        ? it.ingredients.map((x: any) => String(x).slice(0, 80)).filter(Boolean).slice(0, 12)
        : [],
    }))
    .filter((it) => it.calories > 0 && it.calories < limit)
    .slice(0, 10);

  return { ideas };
}
