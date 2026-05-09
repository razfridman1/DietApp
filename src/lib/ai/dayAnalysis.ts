import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claude, extractJson } from "./claude";
import type { DailyIntakeItem, DayAnalysisPayload, Lang } from "@/lib/health/types";

const SYSTEM_HE = `אתה דיאטן קליני שמנתח יום צריכה אחד של משתמש. החזר אובייקט JSON בלבד, בלי טקסט נוסף.
- "score": 1 (יום מצוין) עד 10 (יום שצריך שיפור משמעותי).
- "status": "excellent" / "balanced" / "needs_work" — תואם את הציון.
- "summary": 1-2 משפטי תקציר.
- "warnings": רשימה של הערות בעייתיות (למשל "יותר מדי סוכר", "מעט חלבון", "מעט מים", "חסר ירקות", "עודף מזון מעובד").
- "suggestions": 3-5 הצעות פעולה קונקרטיות.
- "totals": אומדן יומי — sugar/protein/water/calories/fiber/omega3 (מספרים אמיתיים בגרם או מ״ל).
- "targets": אחוז מהיעד היומי (0-150) — sugar/protein/water/calories/fiber/omega3.
- בעברית טבעית.

צורת היציאה:
{
  "score": <1-10>,
  "status": "excellent|balanced|needs_work",
  "summary": "<text>",
  "warnings": ["..."],
  "suggestions": ["..."],
  "totals": { "sugar": <num>, "protein": <num>, "water": <num>, "calories": <num>, "fiber": <num>, "omega3": <num> },
  "targets": { "sugar": <num>, "protein": <num>, "water": <num>, "calories": <num>, "fiber": <num>, "omega3": <num> }
}`;

const SYSTEM_EN = `You are a clinical dietician analysing one day of the user's intake. Reply with ONLY JSON.
- "score": 1 (excellent day) to 10 (needs major improvement).
- "status": "excellent" / "balanced" / "needs_work" matching the score.
- "summary": 1-2 sentence summary.
- "warnings": problematic notes (e.g. "too much sugar", "low protein", "low water", "no vegetables", "highly processed").
- "suggestions": 3-5 concrete actions.
- "totals": daily estimate — sugar/protein/water/calories/fiber/omega3 (real numbers in g/ml).
- "targets": % of daily goal (0-150) per nutrient.

Exact shape:
{
  "score": <1-10>,
  "status": "excellent|balanced|needs_work",
  "summary": "<text>",
  "warnings": ["..."],
  "suggestions": ["..."],
  "totals": { "sugar": <num>, "protein": <num>, "water": <num>, "calories": <num>, "fiber": <num>, "omega3": <num> },
  "targets": { "sugar": <num>, "protein": <num>, "water": <num>, "calories": <num>, "fiber": <num>, "omega3": <num> }
}`;

function clamp(n: any, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Number(n) || 0));
}

function fallback(items: DailyIntakeItem[], lang: Lang): DayAnalysisPayload {
  const empty = items.length === 0;
  return {
    score: empty ? 5 : 5,
    status: "balanced",
    summary: empty
      ? lang === "he"
        ? "לא הוזנו פריטים היום."
        : "No items logged today."
      : lang === "he"
      ? "סיכום בסיסי — נסה/י לרענן בעוד רגע."
      : "Basic summary — try refreshing in a moment.",
    warnings: [],
    suggestions: empty
      ? lang === "he"
        ? ["התחל/י עם ארוחה מאוזנת — חלבון, ירקות ומעט שומן בריא."]
        : ["Start with a balanced meal — protein, veggies and a bit of healthy fat."]
      : [],
    totals: { sugar: 0, protein: 0, water: 0, calories: 0, fiber: 0, omega3: 0 },
    targets: { sugar: 0, protein: 0, water: 0, calories: 0, fiber: 0, omega3: 0 },
  };
}

export async function analyzeDay(
  items: DailyIntakeItem[],
  opts: { lang: Lang; profile?: { weight_kg?: number | null; goal?: string | null } } = { lang: "he" },
): Promise<DayAnalysisPayload> {
  const { lang, profile } = opts;

  if (items.length === 0) {
    return fallback([], lang);
  }

  const lines = items
    .map((it, i) => {
      const qty = it.qty_value ? `${it.qty_value} ${it.qty_unit}` : "";
      return `${i + 1}. ${it.name}${qty ? ` — ${qty}` : ""}${it.kind === "drink" ? " (drink)" : ""}${
        it.notes ? ` — ${it.notes}` : ""
      }`;
    })
    .join("\n");

  const profileLine =
    profile?.weight_kg
      ? lang === "he"
        ? `משקל המשתמש: ${profile.weight_kg} ק"ג. יעד: ${profile.goal ?? "maintain"}.`
        : `User weight: ${profile.weight_kg} kg. Goal: ${profile.goal ?? "maintain"}.`
      : "";

  const userMsg =
    lang === "he"
      ? `${profileLine}\nפריטים שצרך/ה היום:\n${lines}\nהחזר/י JSON בלבד.`
      : `${profileLine}\nItems consumed today:\n${lines}\nReturn JSON only.`;

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

    const score = clamp(parsed.score, 1, 10);
    const status =
      parsed.status === "excellent" || parsed.status === "balanced" || parsed.status === "needs_work"
        ? parsed.status
        : score <= 3
        ? "excellent"
        : score <= 6
        ? "balanced"
        : "needs_work";
    const cleanList = (xs: unknown, max: number) =>
      Array.isArray(xs) ? xs.map(String).map((s) => s.slice(0, 240)).filter(Boolean).slice(0, max) : [];
    const num = (v: unknown, hi = 5000) => clamp(v, 0, hi);

    return {
      score,
      status,
      summary: String(parsed.summary ?? "").slice(0, 500),
      warnings: cleanList(parsed.warnings, 8),
      suggestions: cleanList(parsed.suggestions, 8),
      totals: {
        sugar: num(parsed?.totals?.sugar, 500),
        protein: num(parsed?.totals?.protein, 500),
        water: num(parsed?.totals?.water, 6000),
        calories: num(parsed?.totals?.calories, 8000),
        fiber: num(parsed?.totals?.fiber, 200),
        omega3: num(parsed?.totals?.omega3, 50),
      },
      targets: {
        sugar: num(parsed?.targets?.sugar, 200),
        protein: num(parsed?.targets?.protein, 200),
        water: num(parsed?.targets?.water, 200),
        calories: num(parsed?.targets?.calories, 200),
        fiber: num(parsed?.targets?.fiber, 200),
        omega3: num(parsed?.targets?.omega3, 200),
      },
    };
  } catch {
    return fallback(items, lang);
  }
}
