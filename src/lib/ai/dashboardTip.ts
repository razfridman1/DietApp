import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claude, extractJson } from "./claude";

export interface QuickSuggestion {
  name: string;
  description: string;
  calories: number;
  protein: number;
  ingredients: string[];
  prepTime: number; // minutes
  fills: string;   // what gap this fills
}

export interface DashboardTipResult {
  gaps: string[];
  suggestions: QuickSuggestion[];
}

export interface DashboardTipInput {
  caloriesIn: number;
  caloriesOut: number;
  proteinIn: number;
  carbsIn: number;
  fatsIn: number;
  goalCalories: number;
  proteinTarget: number;
  meals: Array<{ name: string; calories: number; protein: number }>;
  goal: "cut" | "bulk" | "maintain";
}

const SYSTEM = `אתה תזונאי שעוזר למשתמש להגיע ליום מצוין.
המשתמש שלח לך מה אכל היום, מה היעד שלו, וכמה אנרגיה הוא שרף באימון.
תזהה מה חסר לו (חלבון/ירקות/פירות/סיבים/מים/שומן בריא/קלוריות) כדי להגיע לציון מצוין,
ותציע 2-4 ארוחות / נשנושים זריזים מאוד שיכולים להשלים את החסר.

חוקים נוקשים:
- JSON בלבד. בלי טקסט מסביב, בלי markdown.
- "gaps": 2-4 תיאורים קצרים בעברית של מה חסר. למשל "חסרים כ-30 גרם חלבון", "אין ירקות בכלל", "מעט סיבים".
- "suggestions": 2-4 הצעות פשוטות.
- כל הצעה: 5-15 דקות הכנה, 4-7 מצרכים שיש בכל מטבח רגיל.
- אסור: אורז לבן, לחם לבן, פסטה לבנה, סוכר מוסף, נקניקיות, סלמי, מטוגנים, חטיפי במבה/דוריטוס, סופגניות, בורקס, מיונז, קטשופ, ופלים, סוכריות, קולה, אלכוהול, נודלס אינסטנט, פיצה קפואה.
- מצרכים מומלצים: ביצים, גבינה לבנה 5%, קוטג׳, יוגורט יווני 0%, חזה עוף, טונה במים, אבוקדו, חמאת בוטנים טבעית, שיבולת שועל, לחם מחיטה מלאה, טחינה גולמית, ירקות, פירות, אגוזים, שקדים, סלמון.
- "fills": משפט קצר שמסביר איזה חסר הסעיף מכסה. למשל "מוסיף 25 גרם חלבון" או "ירקות + סיבים".
- prepTime: מספר שלם בדקות.

צורת היציאה:
{
  "gaps": ["..."],
  "suggestions": [
    {
      "name": "<שם>",
      "description": "<משפט קצר>",
      "calories": <int>,
      "protein": <int>,
      "ingredients": ["<מצרך 1>", "..."],
      "prepTime": <int דקות>,
      "fills": "<מה זה משלים>"
    }
  ]
}`;

const BANNED = new RegExp(
  [
    "אורז לבן","פסטה לבנה","ספגטי לבן","מקרוני לבן","לחם לבן","חלה לבנה","פיתה לבנה",
    "קמח לבן","סוכר לבן","סוכר מוסף","סוכריה","סוכריות","קורנפלקס","נוטלה","ריבה",
    "במבה","ביסלי","דוריטוס","צ׳יטוס","צ'יטוס","ופלים","סופגנייה","סופגניות",
    "דונאטס","בורקס","קרואסון","מאפינס תעשייתי","מיונז","קטשופ","רוטב BBQ",
    "מרגרינה","נקניקייה","נקניקיות","סלמי","פסטרמה","מטוגן","אינסטנט","פיצה קפואה",
    "קולה","אלכוהול","בירה","יין",
  ].join("|"),
);

function dropBanned(s: QuickSuggestion): boolean {
  const haystack = [s.name, s.description, ...s.ingredients].join(" | ").toLowerCase();
  return BANNED.test(haystack);
}

export async function whatsMissing(input: DashboardTipInput): Promise<DashboardTipResult> {
  const c = claude();

  const proteinGap = Math.max(0, Math.round(input.proteinTarget - input.proteinIn));
  const calorieGap = Math.max(0, Math.round(input.goalCalories + input.caloriesOut - input.caloriesIn));

  const mealsList = input.meals.length
    ? input.meals.map((m) => `${m.name} (${Math.round(m.calories)} kcal, ${Math.round(m.protein)}g חלבון)`).join("; ")
    : "טרם נרשמו ארוחות";

  const userMsg = `יעד יומי: ${input.goalCalories} קק"ל, ${input.proteinTarget} גרם חלבון. יעד: ${input.goal}.
היום צרכתי: ${input.caloriesIn} קק"ל, ${input.proteinIn} גרם חלבון, ${input.carbsIn} גרם פחמימות, ${input.fatsIn} גרם שומן.
שרפתי ${input.caloriesOut} קק"ל באימון.
ארוחות עד עכשיו: ${mealsList}.

חסר חלבון: ~${proteinGap} גרם. חסרים קלוריות: ~${calorieGap} קק"ל (לפי הפעילות).

נתח מה חסר וענה ב-JSON.`;

  const res = await c.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 900,
    system: SYSTEM,
    messages: [{ role: "user", content: userMsg }],
  });

  const text = res.content
    .filter((b: any): b is Anthropic.TextBlock => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");

  const parsed = extractJson<any>(text);

  const gaps: string[] = Array.isArray(parsed?.gaps)
    ? parsed.gaps.map((s: any) => String(s).slice(0, 240)).filter(Boolean).slice(0, 6)
    : [];

  const rawSuggestions = Array.isArray(parsed?.suggestions) ? parsed.suggestions : [];
  const suggestions: QuickSuggestion[] = rawSuggestions
    .map((s: any) => ({
      name: String(s?.name ?? "").slice(0, 80),
      description: String(s?.description ?? "").slice(0, 240),
      calories: Math.max(0, Math.round(Number(s?.calories) || 0)),
      protein: Math.max(0, Math.round(Number(s?.protein) || 0)),
      ingredients: Array.isArray(s?.ingredients)
        ? s.ingredients.map((x: any) => String(x).slice(0, 80)).filter(Boolean).slice(0, 8)
        : [],
      prepTime:
        s?.prepTime !== undefined && Number.isFinite(Number(s.prepTime))
          ? Math.max(1, Math.min(60, Math.round(Number(s.prepTime))))
          : 5,
      fills: String(s?.fills ?? "").slice(0, 200),
    }))
    .filter((s: QuickSuggestion) => s.name && !dropBanned(s))
    .slice(0, 4);

  return { gaps, suggestions };
}
