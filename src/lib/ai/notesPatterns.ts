import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claude, extractJson } from "./claude";
import type { HealthNote, Lang, PatternFinding } from "@/lib/health/types";

const SYSTEM_HE = `אתה מאמן בריאות שמזהה דפוסים ברישומים יומיים של משתמש.
- קבל הערות לפי תאריך.
- חפש קשרים: עייפות, סוכר, קפאין, אכילה רגשית, חוסר שינה, חלבון בבוקר וכו׳.
- החזר/י JSON בלבד עם מערך "patterns" של 3-6 ממצאים.
- כל ממצא: { "pattern": "<תיאור קצר>", "evidence": "<דוגמה מהנתונים>", "recommendation": "<מה לעשות>", "severity": "info|warn|critical" }
- ככל שאין מספיק נתונים, החזר/י מערך ריק.`;

const SYSTEM_EN = `You are a health coach detecting patterns in a user's daily notes.
- Receive notes by date.
- Look for links: tiredness, sugar, caffeine, emotional eating, sleep deprivation, morning protein, etc.
- Reply with JSON only — a "patterns" array of 3-6 findings.
- Each finding: { "pattern": "<short>", "evidence": "<example from notes>", "recommendation": "<action>", "severity": "info|warn|critical" }
- If not enough data, return an empty array.`;

export async function findPatterns(
  notes: HealthNote[],
  lang: Lang = "he",
): Promise<PatternFinding[]> {
  if (notes.length < 2) return [];

  const lines = notes
    .slice(0, 60) // last ~60 entries — keep prompt size in check
    .map((n) => {
      const meta: string[] = [];
      if (n.mood) meta.push(`mood:${n.mood}`);
      if (n.tags?.length) meta.push(`tags:${n.tags.join(",")}`);
      return `[${n.log_date}] (${meta.join(" ")}) ${n.body}`;
    })
    .join("\n");

  const userMsg =
    lang === "he"
      ? `הנה הערות מהשבועות האחרונים:\n${lines}\nזהה דפוסים והחזר/י JSON.`
      : `Here are recent notes:\n${lines}\nIdentify patterns and return JSON.`;

  try {
    const c = claude();
    const res = await c.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      system: lang === "he" ? SYSTEM_HE : SYSTEM_EN,
      messages: [{ role: "user", content: userMsg }],
    });
    const text = res.content
      .filter((b: any): b is Anthropic.TextBlock => b.type === "text")
      .map((b: any) => b.text)
      .join("\n");
    const parsed = extractJson<any>(text);
    const arr = Array.isArray(parsed?.patterns) ? parsed.patterns : [];
    return arr
      .map((p: any) => ({
        pattern: String(p?.pattern ?? "").slice(0, 200),
        evidence: String(p?.evidence ?? "").slice(0, 240),
        recommendation: String(p?.recommendation ?? "").slice(0, 240),
        severity:
          p?.severity === "warn" || p?.severity === "critical" ? p.severity : "info",
      }))
      .filter((p: PatternFinding) => Boolean(p.pattern))
      .slice(0, 8);
  } catch {
    return [];
  }
}
