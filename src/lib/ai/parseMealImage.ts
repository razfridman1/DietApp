import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claude, extractJson } from "./claude";
import type { ParsedMeal } from "./parseMeal";

/**
 * Analyze a meal photo with Claude's vision capability.
 *
 * The image is passed as base64 (without the `data:image/...;base64,` prefix —
 * the caller strips that off and supplies the raw payload + media type).
 * Returns the same ParsedMeal shape that the text-based parseMeal returns,
 * so the UI can treat both flows identically downstream.
 */

export type SupportedImageMediaType =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif";

const SYSTEM = `You are a nutrition expert analyzing a photograph of a meal.
Examine the image carefully and identify all visible food items and their approximate portions.
Use realistic Israeli/Mediterranean serving sizes when scale isn't obvious.
Reply ONLY with a JSON object — no prose, no markdown — in this exact shape:
{
  "name": "<short Hebrew label describing the meal, max 6 words>",
  "grams": <total estimated grams of food in the photo, or null if you cannot estimate>,
  "calories": <total kcal as integer>,
  "protein": <grams as integer>,
  "carbs": <grams as integer>,
  "fats": <grams as integer>,
  "confidence": <0..1 — lower the value when image is blurry, dark, or ambiguous>
}
If the image clearly contains no food, return zeros with confidence 0.`;

export async function parseMealImage(
  base64: string,
  mediaType: SupportedImageMediaType,
  gramsHint?: number | null,
  extraText?: string | null,
): Promise<ParsedMeal> {
  const c = claude();
  const userText = [
    gramsHint && gramsHint > 0
      ? `Total portion shown is exactly ${Math.round(gramsHint)} grams.`
      : null,
    extraText && extraText.trim() ? `User note: ${extraText.trim()}` : null,
    "Analyze the meal in this image and return the JSON described in the system instructions.",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await c.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 500,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          { type: "text", text: userText },
        ],
      },
    ],
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
