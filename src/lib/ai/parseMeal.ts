import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claude, extractJson } from "./claude";

export interface ParsedMeal {
  name: string;
  grams: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  confidence: number;
}

const SYSTEM = `You are a nutrition expert. The user describes a meal in HEBREW (or any language).
Estimate macronutrients accurately. Reply ONLY with a JSON object — no prose, no markdown — in this exact shape:
{
  "name": "<short Hebrew label, max 6 words>",
  "grams": <total grams or null>,
  "calories": <kcal as integer>,
  "protein": <grams as integer>,
  "carbs": <grams as integer>,
  "fats": <grams as integer>,
  "confidence": <0..1>
}
Use realistic Israeli/Mediterranean serving sizes when not specified.
If the user specifies an exact gram weight, calculate macros for EXACTLY that weight and return that weight in "grams".
If the input is impossible to parse as food, return zeros with confidence 0.`;

export async function parseMeal(input: string, gramsHint?: number | null): Promise<ParsedMeal> {
  const c = claude();
  const userMsg = gramsHint && gramsHint > 0
    ? `Total portion is exactly ${Math.round(gramsHint)} grams.\nDescription: ${input.trim()}`
    : input.trim();
  const res = await c.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 400,
    system: SYSTEM,
    messages: [{ role: "user", content: userMsg }],
  });
  const text = res.content
    .filter((b: any): b is Anthropic.TextBlock => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");
  const parsed = extractJson<ParsedMeal>(text);
  return {
    name: String(parsed.name ?? "ארוחה").slice(0, 80),
    grams: parsed.grams != null ? Math.max(0, Math.round(Number(parsed.grams))) : null,
    calories: Math.max(0, Math.round(Number(parsed.calories) || 0)),
    protein: Math.max(0, Math.round(Number(parsed.protein) || 0)),
    carbs: Math.max(0, Math.round(Number(parsed.carbs) || 0)),
    fats: Math.max(0, Math.round(Number(parsed.fats) || 0)),
    confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
  };
}
