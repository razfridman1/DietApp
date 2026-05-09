import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claude, extractJson } from "./claude";
import type { Lang } from "@/lib/health/types";

export type ListPreset =
  | "cut"
  | "muscle"
  | "general"
  | "teens"
  | "family"
  | "energy"
  | "brain"
  | "sleep";

export type ListType = "shopping" | "weekly" | "meal_prep" | "recommended" | "avoid";

export interface GeneratedItem {
  name: string;
  qty?: string;
  rating?: number; // 1-10
  reason?: string;
  category?: string;
}

export interface GeneratedList {
  name: string;
  list_type: ListType;
  items: GeneratedItem[];
}

const presetGoalHe: Record<ListPreset, string> = {
  cut: "חיטוב והפחתת אחוזי שומן",
  muscle: "בניית מסת שריר",
  general: "בריאות כללית",
  teens: "נוער בגיל גדילה",
  family: "משפחה כולה",
  energy: "אנרגיה לאורך היום",
  brain: "בריאות המוח וריכוז",
  sleep: "שיפור איכות השינה",
};

const presetGoalEn: Record<ListPreset, string> = {
  cut: "Cutting / fat loss",
  muscle: "Muscle building",
  general: "General health",
  teens: "Growing teens",
  family: "Whole family",
  energy: "All-day energy",
  brain: "Brain health & focus",
  sleep: "Better sleep",
};

const SYSTEM_HE = `אתה תזונאי שמייצר רשימה ממוקדת לפי מטרה ספציפית.
חוקים:
- החזר/י JSON בלבד.
- אורך: 8-15 פריטים.
- כל פריט בריא יקבל "rating" 1-3, פריט בינוני 4-6, פריט שיש להפחית 7-10.
- שדה "reason" — משפט קצר למה כדאי או לא כדאי.
- שדה "qty" — כמות מומלצת לשבוע (למשל "1 ק״ג", "5 יחידות").
- שדה "category" — "פירות", "ירקות", "חלבון", "שומנים", "פחמימות", "שתייה", "תבלינים" וכד׳.
- שמות בעברית בלבד.

צורת היציאה:
{
  "name": "<שם הרשימה>",
  "list_type": "shopping|weekly|meal_prep|recommended|avoid",
  "items": [
    { "name": "...", "qty": "...", "rating": <1-10>, "reason": "...", "category": "..." }
  ]
}`;

const SYSTEM_EN = `You are a nutritionist generating a focused list for a specific goal.
Rules:
- Reply with JSON only.
- Length: 8-15 items.
- Healthy items rating 1-3, medium 4-6, reduce/avoid 7-10.
- "reason" — short why-to-eat / why-to-avoid sentence.
- "qty" — weekly recommended quantity (e.g. "1 kg", "5 units").
- "category" — "Produce", "Protein", "Fats", "Carbs", "Drinks", "Spices", etc.
- All names in English.

Exact shape:
{
  "name": "<list name>",
  "list_type": "shopping|weekly|meal_prep|recommended|avoid",
  "items": [
    { "name": "...", "qty": "...", "rating": <1-10>, "reason": "...", "category": "..." }
  ]
}`;

const VALID_TYPES: ListType[] = ["shopping", "weekly", "meal_prep", "recommended", "avoid"];

export async function generateList(
  preset: ListPreset,
  listType: ListType,
  lang: Lang,
): Promise<GeneratedList> {
  const goal = lang === "he" ? presetGoalHe[preset] : presetGoalEn[preset];
  const userMsg =
    lang === "he"
      ? `צור רשימה מסוג "${listType}" עבור המטרה: ${goal}. החזר/י JSON בלבד.`
      : `Create a "${listType}" list for goal: ${goal}. Return JSON only.`;

  const c = claude();
  const res = await c.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2000,
    system: lang === "he" ? SYSTEM_HE : SYSTEM_EN,
    messages: [{ role: "user", content: userMsg }],
  });

  const text = res.content
    .filter((b: any): b is Anthropic.TextBlock => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");
  const parsed = extractJson<any>(text);

  const items: GeneratedItem[] = Array.isArray(parsed?.items)
    ? parsed.items
        .map((it: any) => ({
          name: String(it?.name ?? "").slice(0, 80),
          qty: it?.qty ? String(it.qty).slice(0, 60) : undefined,
          rating:
            it?.rating !== undefined
              ? Math.max(1, Math.min(10, Math.round(Number(it.rating) || 5)))
              : undefined,
          reason: it?.reason ? String(it.reason).slice(0, 240) : undefined,
          category: it?.category ? String(it.category).slice(0, 40) : undefined,
        }))
        .filter((it: GeneratedItem) => Boolean(it.name))
        .slice(0, 20)
    : [];

  const list_type: ListType = VALID_TYPES.includes(parsed?.list_type) ? parsed.list_type : listType;
  const name = String(parsed?.name ?? goal).slice(0, 80);

  return { name, list_type, items };
}
