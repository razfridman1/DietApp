import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claude, extractJson } from "./claude";
import type { ActivityType, Intensity } from "@/types";

export interface ParsedActivity {
  type: ActivityType;
  description: string;
  duration_min: number;
  intensity: Intensity;
  calories_burned: number;
  confidence: number;
}

const SYSTEM = `You are an exercise physiologist. The user describes a workout in HEBREW (or any language).
Reply ONLY with a JSON object — no prose, no markdown — in this exact shape:
{
  "type": "walk|run|gym|swim|cycle|yoga|other",
  "description": "<short Hebrew label>",
  "duration_min": <integer minutes>,
  "intensity": "low|moderate|high",
  "calories_burned": <integer kcal, assume 75kg adult unless specified>,
  "confidence": <0..1>
}
If unparseable, return type:"other" with zeros and confidence 0.`;

export async function parseActivity(input: string, weightKg?: number | null): Promise<ParsedActivity> {
  const c = claude();
  const userPrefix = weightKg ? `User weight: ${weightKg}kg.\n` : "";
  const res = await c.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 350,
    system: SYSTEM,
    messages: [{ role: "user", content: userPrefix + input.trim() }],
  });
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const parsed = extractJson<ParsedActivity>(text);
  const type = (["walk", "run", "gym", "swim", "cycle", "yoga", "other"].includes(parsed.type)
    ? parsed.type
    : "other") as ActivityType;
  const intensity = (["low", "moderate", "high"].includes(parsed.intensity)
    ? parsed.intensity
    : "moderate") as Intensity;
  return {
    type,
    description: String(parsed.description ?? "").slice(0, 80),
    duration_min: Math.max(0, Math.round(Number(parsed.duration_min) || 0)),
    intensity,
    calories_burned: Math.max(0, Math.round(Number(parsed.calories_burned) || 0)),
    confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0)),
  };
}
