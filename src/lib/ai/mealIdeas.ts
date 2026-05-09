import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claude, extractJson } from "./claude";

export interface MealIdea {
  name: string;
  description: string;
  calories: number;
  ingredients: string[];
  /** Estimated prep + cook time in minutes (1-30). */
  prepTime?: number;
  /** Short tags like ["ארוחת בוקר", "5 דק׳", "מקרר"] */
  tags?: string[];
}

export interface MealIdeasResult {
  ideas: MealIdea[];
}

const SYSTEM = `אתה מציע רעיונות לארוחות יומיומיות בריאות לישראלים בעברית.
המשתמש נותן תקרת קלוריות. תחזיר 10 רעיונות מגוונים, פשוטים ובריאים, כל אחד מתחת לתקרה.

חוקים נוקשים:
- JSON בלבד. בלי טקסט מסביב. בלי markdown. בלי קוד פנסי.
- בדיוק 10 רעיונות במערך "ideas".
- כל "calories" מספר שלם ריאלי, מתחת לתקרה.

חוקי האוכל (חשוב מאוד):
- אוכל ביתי-יומיומי שאנשים מכינים בארץ — סנדוויצ׳ים, חביתות, סלטים, יוגורט עם פרי, פיתה עם משהו בפנים, קערת דגנים מלאים עם ביצה, פסטה מקמח מלא, טוסט מלחם מלא, שיבולת שועל עם פרי.
- מצרכים שיש כמעט בכל מטבח: ביצים, עגבנייה, מלפפון, גבינה לבנה 5%, קוטג׳ 5%, יוגורט טבעי 0-2%, לחם מחיטה מלאה, פיתה מחיטה מלאה, אורז מלא/חום, פסטה מקמח מלא, שיבולת שועל, טונה במים, שמן זית, חומוס ביתי, טחינה גולמית, חזה עוף, גזר, בצל, שום, פלפל, אבוקדו, בננה, תפוח, חמאת בוטנים טבעית (ללא סוכר), חלב 1%.
- זמן הכנה קצר: 5-15 דקות. אסור מתכונים שדורשים מרינדה, אפייה ארוכה, או טכניקות מסובכות.
- בלי תהליכים מסובכים — בלי "להקציף", "לזלף", "להגיש על מצע" וכד׳.
- 4-7 מצרכים לכל ארוחה.
- מגוון: ערב ארוחות בוקר/צהריים/ערב/חטיפים. אל תחזור על אותו דבר.

מצרכים אסורים בהחלט (אסור לכלול אותם, אפילו לא כמרכיב משני):
- אורז לבן — להחליף באורז מלא / חום / קינואה / כוסמת.
- לחם לבן / חלה / טוסט לבן — רק לחם מחיטה מלאה / לחם שיפון / פיתה מחיטה מלאה.
- פסטה רגילה / מקרוני לבן — רק פסטה מקמח מלא או פסטה מקטניות.
- קמח לבן (כל מאפה ממנו) — בורקס, קרואסון, לחמנייה לבנה, מאפינס תעשייתי, סופגנייה, דונאטס, רוגלך, פיתה לבנה.
- סוכר מוסף / סוכריות / שוקולד חלב / קקאו ממותק / ריבה / נוטלה / דבש בכמויות גדולות.
- דגני בוקר ממותקים (קורנפלקס מצופה, צ׳וקוס וכד׳).
- מיצים בקבוק / שתייה מתוקה / קולה / XL / נקטר.
- בשר מעובד: נקניקיות, סלמי, פסטרמה, קבנוס, נקניק, קציצות תעשייתיות.
- מטוגנים בשמן עמוק: צ׳יפס, שניצל מטוגן, פלאפל, דגים מטוגנים.
- חטיפים מעובדים: במבה, ביסלי, דוריטוס, צ׳יטוס, צ׳יפס תפו"א, ופלים, עוגיות תעשייתיות.
- רטבים מתועשים מתוקים: קטשופ, מיונז רגיל, רוטב BBQ מתוק, רוטב סויה מתוק.
- גבינות שמנות: גבינה צהובה רגילה (מעל 25% שומן), גבינת שמנת רגילה, חמאה במנות גדולות, מרגרינה.
- מנות מוכנות תעשייתיות: נודלס אינסטנט, פיצה קפואה, מאפי שמרים תעשייתיים.
- אלכוהול בכל צורה.

החלפות בריאות פופולריות:
- במקום אורז לבן → אורז מלא / קינואה / כוסמת.
- במקום לחם לבן → לחם מחיטה מלאה.
- במקום פסטה רגילה → פסטה מקמח מלא.
- במקום קורנפלקס ממותק → שיבולת שועל / מוזלי טבעי.
- במקום מיונז → יוגורט טבעי + חרדל / טחינה.
- במקום סוכר → פירות טריים.
- במקום נקניקיות → חזה עוף / טונה / ביצים.
- במקום גבינה צהובה רגילה → גבינה לבנה 5% / גבינת קוטג׳ / מוצרלה דלת שומן.

prepTime: מספר שלם בדקות (5-15 ברוב המקרים).
tags: 2-3 תגיות קצרות, כמו "ארוחת בוקר" / "5 דקות" / "ללא בישול" / "ללא תנור" / "חלבון גבוה" / "סיבים".

לפני שאתה מחזיר את ה-JSON — עבור על כל ארוחה ובדוק: האם יש בה אחד מהמצרכים האסורים? אם כן — החלף לפי טבלת ההחלפות.

צורת היציאה המדויקת:
{
  "ideas": [
    {
      "name": "<שם הארוחה בעברית, עד 6 מילים>",
      "description": "<משפט אחד קצר>",
      "calories": <int>,
      "ingredients": ["<מצרך 1>", "<מצרך 2>", "..."],
      "prepTime": <int דקות>,
      "tags": ["<תג1>", "<תג2>"]
    }
    // ... 10 בדיוק
  ]
}`;

// Defensive filter — drop ideas whose ingredients list contains any of these
// banned substrings.  We try to phrase them so they only match the unhealthy
// variant (e.g. "אורז לבן" matches but "אורז מלא"/"אורז חום" don't).
const BANNED_INGREDIENT_RE = new RegExp(
  [
    "אורז לבן",
    "פסטה לבנה",
    "מקרוני לבן",
    "ספגטי לבן",
    "לחם לבן",
    "חלה לבנה",
    "פיתה לבנה",
    "קמח לבן",
    "סוכר לבן",
    "סוכר מוסף",
    "סוכריה",
    "סוכריות",
    "קורנפלקס",
    "צ׳וקוס",
    "צ'וקוס",
    "ריבה",
    "נוטלה",
    "ממרח שוקולד",
    "שוקולד חלב",
    "במבה",
    "ביסלי",
    "דוריטוס",
    "צ׳יטוס",
    "צ'יטוס",
    "צ׳יפס תפו",
    "צ'יפס תפו",
    "ופלים",
    "עוגיות תעשייתיות",
    "סופגניות",
    "סופגנייה",
    "דונאטס",
    "דונאט",
    "בורקס",
    "קרואסון",
    "לחמנייה לבנה",
    "מאפינס תעשייתי",
    "מיונז",
    "קטשופ",
    "רוטב BBQ",
    "רוטב סויה מתוק",
    "מרגרינה",
    "נקניקייה",
    "נקניקיות",
    "סלמי",
    "פסטרמה",
    "קבנוס",
    "מטוגן",
    "צ׳יפס מטוגן",
    "צ'יפס מטוגן",
    "פלאפל מטוגן",
    "שניצל מטוגן",
    "נודלס אינסטנט",
    "אינסטנט",
    "פיצה קפואה",
    "קולה",
    "סודה מתוקה",
    "אלכוהול",
    "בירה",
    "יין",
    "ויסקי",
    "וודקה",
  ].join("|"),
);

function hasBannedIngredient(idea: MealIdea): boolean {
  // Look at ingredients AND name+description, since the AI may slip a banned
  // term into the title.
  const haystack = [idea.name, idea.description, ...idea.ingredients]
    .join(" | ")
    .toLowerCase();
  return BANNED_INGREDIENT_RE.test(haystack);
}

export async function generateMealIdeas(maxCalories: number): Promise<MealIdeasResult> {
  const c = claude();
  const limit = Math.max(50, Math.round(maxCalories));
  const userMsg = `תקרת קלוריות לכל ארוחה: ${limit} קק"ל. החזר 10 ארוחות יומיומיות פשוטות ובריאות בעברית, כל אחת מתחת ל-${limit} קק"ל. הקפד/י לא לכלול את המצרכים האסורים. JSON בלבד.`;

  const res = await c.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2000,
    system: SYSTEM,
    messages: [{ role: "user", content: userMsg }],
  });

  const text = res.content
    .filter((b: any): b is Anthropic.TextBlock => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");

  const parsed = extractJson<MealIdeasResult>(text);
  const rawIdeas = Array.isArray(parsed?.ideas) ? parsed.ideas : [];

  // Sanitise + enforce constraints defensively.
  const cleaned: MealIdea[] = rawIdeas
    .map((it: any) => ({
      name: String(it?.name ?? "ארוחה").slice(0, 80),
      description: String(it?.description ?? "").slice(0, 240),
      calories: Math.max(0, Math.round(Number(it?.calories) || 0)),
      ingredients: Array.isArray(it?.ingredients)
        ? it.ingredients.map((x: any) => String(x).slice(0, 80)).filter(Boolean).slice(0, 8)
        : [],
      prepTime:
        it?.prepTime !== undefined && Number.isFinite(Number(it.prepTime))
          ? Math.max(1, Math.min(60, Math.round(Number(it.prepTime))))
          : undefined,
      tags: Array.isArray(it?.tags)
        ? it.tags.map((x: any) => String(x).slice(0, 30)).filter(Boolean).slice(0, 4)
        : undefined,
    }))
    .filter((it) => it.calories > 0 && it.calories < limit);

  // Drop anything that contains a banned ingredient anywhere in the recipe.
  const ideas = cleaned.filter((it) => !hasBannedIngredient(it)).slice(0, 10);

  return { ideas };
}
