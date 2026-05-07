// Optional AI-generated Hebrew summary that appears at the top of the report.
// Failures are non-fatal — the PDF generation continues without a summary.
import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claude } from "@/lib/ai/claude";
import type { ReportSummary } from "./types";

const SYSTEM = `You write a single short paragraph (2-3 sentences) in HEBREW only,
summarizing a user's nutrition + training data over a recent period.
Tone: warm, supportive, factual. No emojis. No markdown. Plain prose.
Mention concrete numbers where helpful (calories, protein, workouts, days).`;

export async function generateAISummary(opts: {
  rangeLabel: string;
  summary: ReportSummary;
}): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const userPrompt = `Period: ${opts.rangeLabel}
Tracked days: ${opts.summary.trackedDays}/${opts.summary.totalDays}
Avg daily calories: ${Math.round(opts.summary.avgCalories)} kcal
Avg daily protein: ${Math.round(opts.summary.avgProtein)} g
Total calories: ${Math.round(opts.summary.totalCalories)} kcal
Total protein: ${Math.round(opts.summary.totalProtein)} g
Total workouts: ${opts.summary.totalWorkouts}
Total workout minutes: ${opts.summary.totalWorkoutMinutes}

Write the Hebrew summary now. Reply with ONLY the paragraph, no quotes.`;

  try {
    const c = claude();
    const res = await c.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 300,
      system: SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();
    if (!text) return null;
    return text.slice(0, 600);
  } catch {
    return null;
  }
}
