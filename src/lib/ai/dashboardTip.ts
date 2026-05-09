import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claude } from "./claude";

export interface QuickSuggestion {
  name: string;
  description: string;
  calories: number;
  protein: number;
  ingredients: string[];
  prepTime: number; // minutes
  fills: string;
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
זהה מה חסר לו (חלבון/ירקות/פירות/סיבים/מים/שומן בריא/קלוריות) כדי להגיע לציון מצוין,
והצע 2-4 ארוחות / נשנושים זריזים מאוד שיכולים להשלים את החסר.

חוקים:
- כל הצעה: 5-15 דקות הכנה, 4-7 מצרכים שיש בכל מטבח רגיל.
- אסור: אורז לבן, לחם לבן, פסטה לבנה, סוכר מוסף, נקניקיות, סלמי, מטוגנים, חטיפי במבה/דוריטוס, סופגניות, בורקס, מיונז, קטשופ, ופלים, סוכריות, קולה, אלכוהול, נודלס אינסטנט, פיצה קפואה.
- מצרכים מומלצים: ביצים, גבינה לבנה 5%, קוטג׳, יוגורט יווני 0%, חזה עוף, טונה במים, אבוקדו, חמאת בוטנים טבעית, שיבולת שועל, לחם מחיטה מלאה, טחינה גולמית, ירקות, פירות, אגוזים, שקדים, סלמון.
- gaps: 2-4 פריטים, כל אחד משפט קצר.
- fills: משפט קצר על איזה חסר ההצעה מכסה.
- כל הטקסט בעברית טבעית.`;

// Tool-use schema — Anthropic enforces that the model returns a valid object
// matching this exact shape, so we never need to parse free-form JSON.
const TOOL_SCHEMA: Anthropic.Tool = {
  name: "report_missing",
  description: "Report nutritional gaps for today and propose quick meals to fill them.",
  input_schema: {
    type: "object",
    properties: {
      gaps: {
        type: "array",
        items: { type: "string" },
        description: "Short Hebrew descriptions of what is missing in today's intake.",
      },
      suggestions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Hebrew meal name, max 6 words." },
            description: { type: "string", description: "One short Hebrew sentence." },
            calories: { type: "integer", description: "Estimated kcal." },
            protein: { type: "integer", description: "Grams of protein." },
            ingredients: {
              type: "array",
              items: { type: "string" },
              description: "4-7 Hebrew ingredient names from a normal pantry.",
            },
            prepTime: {
              type: "integer",
              description: "Prep + cook time in minutes (5-15).",
            },
            fills: {
              type: "string",
              description: "What gap this meal fills, in Hebrew.",
            },
          },
          required: ["name", "calories", "protein", "ingredients", "prepTime", "fills"],
        },
      },
    },
    required: ["gaps", "suggestions"],
  } as any,
};

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
  const calorieGap = Math.max(
    0,
    Math.round(input.goalCalories + input.caloriesOut - input.caloriesIn),
  );

  const mealsList = input.meals.length
    ? input.meals
        .map((m) => `${m.name} (~${Math.round(m.calories)} kcal, ${Math.round(m.protein)}g protein)`)
        .join("; ")
    : "טרם נרשמו ארוחות";

  const userMsg = `יעד יומי: ${input.goalCalories} קק"ל, ${input.proteinTarget} גרם חלבון. יעד: ${input.goal}.
היום צרכתי: ${input.caloriesIn} קק"ל, ${input.proteinIn} גרם חלבון, ${input.carbsIn} גרם פחמימות, ${input.fatsIn} גרם שומן.
שרפתי ${input.caloriesOut} קק"ל באימון.
ארוחות עד עכשיו: ${mealsList}.

חסר חלבון: ~${proteinGap} גרם. חסרים קלוריות: ~${calorieGap} קק"ל (לפי הפעילות).

נתח מה חסר וקרא לכלי report_missing.`;

  const res = await c.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1500,
    system: SYSTEM,
    tools: [TOOL_SCHEMA],
    tool_choice: { type: "tool", name: "report_missing" },
    messages: [{ role: "user", content: userMsg }],
  });

  // Locate the tool_use block (Anthropic guarantees valid input matching the schema).
  const toolBlock = res.content.find(
    (b: any): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );

  if (!toolBlock || typeof toolBlock.input !== "object" || toolBlock.input === null) {
    throw new Error("ai_no_tool_use");
  }

  const data = toolBlock.input as {
    gaps?: unknown;
    suggestions?: unknown;
  };

  const gaps: string[] = Array.isArray(data.gaps)
    ? data.gaps.map((s: any) => String(s).slice(0, 240)).filter(Boolean).slice(0, 6)
    : [];

  const rawSuggestions: any[] = Array.isArray(data.suggestions) ? data.suggestions : [];
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
    .filter((s) => s.name && !dropBanned(s))
    .slice(0, 4);

  return { gaps, suggestions };
}
