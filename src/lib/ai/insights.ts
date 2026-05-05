import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claude, extractJson } from "./claude";
import type { BehaviorSignals } from "@/lib/calc/analytics";
import type { InsightCategory, InsightSeverity } from "@/types";

export interface GeneratedInsight {
  category: InsightCategory;
  severity: InsightSeverity;
  insight_text: string;
  recommendation: string;
}

const SYSTEM = `You are a behavioral nutrition coach speaking HEBREW only.
Given user behavior signals over the last few weeks, return 3-5 concise insights.
Tone: warm, direct, never judgmental. No emojis. Each insight must be specific.

Reply ONLY with a JSON object:
{
  "insights": [
    {
      "category": "diet|training|behavior|goal",
      "severity": "info|warn|critical",
      "insight_text": "<one Hebrew sentence describing what you noticed>",
      "recommendation": "<one Hebrew sentence with a concrete next step>"
    }
  ]
}`;

export async function generateInsights(signals: BehaviorSignals & {
  goal: string;
  proteinTarget: number;
  avgProtein: number;
  avgNet: number;
  tdee: number;
}): Promise<GeneratedInsight[]> {
  const c = claude();
  const userPrompt = `Behavior signals over ${signals.totalDays} days:
- Goal: ${signals.goal}
- TDEE: ${signals.tdee} kcal/day
- Avg net calories: ${Math.round(signals.avgNet)} kcal/day
- Avg protein: ${Math.round(signals.avgProtein)}g (target ${signals.proteinTarget}g)
- Night-eating ratio (>=20:00): ${(signals.nightEatingRatio * 100).toFixed(0)}%
- Weekend net calorie overflow vs weekday: ${Math.round(signals.weekendOverflow)} kcal
- Avg protein deficit: ${Math.round(signals.proteinDeficitAvg)}g
- Inactive days: ${signals.inactiveDays}/${signals.totalDays}

Produce Hebrew insights tailored to these numbers.`;

  const res = await c.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 800,
    system: SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
  });
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const parsed = extractJson<{ insights: GeneratedInsight[] }>(text);
  return (parsed.insights ?? []).slice(0, 6).map((x) => ({
    category: (["diet", "training", "behavior", "goal"].includes(x.category)
      ? x.category
      : "behavior") as InsightCategory,
    severity: (["info", "warn", "critical"].includes(x.severity)
      ? x.severity
      : "info") as InsightSeverity,
    insight_text: String(x.insight_text || "").slice(0, 280),
    recommendation: String(x.recommendation || "").slice(0, 280),
  }));
}
