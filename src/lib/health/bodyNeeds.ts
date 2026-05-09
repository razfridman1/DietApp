// Comprehensive built-in dataset for the "What your body needs" tab.
// Bilingual content — UI picks the language based on the user's selection.

export type NutrientCategory =
  | "vitamins"
  | "minerals"
  | "antioxidants"
  | "protein"
  | "omega3"
  | "fiber"
  | "water"
  | "electrolytes"
  | "probiotics"
  | "goodFats";

export interface DailyAmount {
  child: string;
  teen: string;
  adult: string;
  athlete: string;
}

export interface NutrientSource {
  /** Hebrew + English food name */
  food: { he: string; en: string };
  /** How much of this food gets you the daily amount */
  amount: { he: string; en: string };
}

export interface Nutrient {
  id: string;
  category: NutrientCategory;
  name: { he: string; en: string };
  role: { he: string; en: string };
  daily: DailyAmount;
  deficiency: { he: string; en: string };
  excess: { he: string; en: string };
  sources: NutrientSource[];
  /** Hex tone for the UI card */
  color: string;
}

export const NUTRIENTS: Nutrient[] = [
  // ============================ Vitamins ============================
  {
    id: "vit-c",
    category: "vitamins",
    name: { he: "ויטמין C", en: "Vitamin C" },
    role: {
      he: "תורם למערכת חיסון, ייצור קולגן, ספיגת ברזל ומגן מפני נזק חמצוני.",
      en: "Supports the immune system, collagen production, iron absorption and antioxidant defence.",
    },
    daily: { child: "45 מ״ג", teen: "75 מ״ג", adult: "90 מ״ג", athlete: "120 מ״ג" },
    deficiency: {
      he: "חוסר אנרגיה, חניכיים מדממות, נטייה להידבקויות, ריפוי איטי של פצעים.",
      en: "Fatigue, bleeding gums, frequent infections, slow wound healing.",
    },
    excess: {
      he: "מינונים מעל 2000 מ״ג עלולים לגרום לשלשולים וכאבי בטן.",
      en: "Doses above 2000 mg may cause diarrhea and stomach pain.",
    },
    sources: [
      { food: { he: "פלפל אדום", en: "Red bell pepper" }, amount: { he: "50 גרם — 75 מ״ג", en: "50 g — 75 mg" } },
      { food: { he: "תפוז", en: "Orange" }, amount: { he: "1 בינוני — 70 מ״ג", en: "1 medium — 70 mg" } },
      { food: { he: "תות שדה", en: "Strawberries" }, amount: { he: "150 גרם — 90 מ״ג", en: "150 g — 90 mg" } },
      { food: { he: "ברוקולי", en: "Broccoli" }, amount: { he: "100 גרם — 90 מ״ג", en: "100 g — 90 mg" } },
      { food: { he: "קיווי", en: "Kiwi" }, amount: { he: "1 גדול — 70 מ״ג", en: "1 large — 70 mg" } },
      { food: { he: "גויאבה", en: "Guava" }, amount: { he: "1 — 200 מ״ג", en: "1 — 200 mg" } },
      { food: { he: "פלפל ירוק", en: "Green pepper" }, amount: { he: "100 גרם — 80 מ״ג", en: "100 g — 80 mg" } },
      { food: { he: "כרובית", en: "Cauliflower" }, amount: { he: "100 גרם — 48 מ״ג", en: "100 g — 48 mg" } },
    ],
    color: "#22c55e",
  },
  {
    id: "vit-d",
    category: "vitamins",
    name: { he: "ויטמין D", en: "Vitamin D" },
    role: {
      he: "חיוני לעצמות, שרירים, מערכת חיסון ומצב רוח.",
      en: "Vital for bones, muscles, the immune system and mood.",
    },
    daily: { child: "600 IU", teen: "600 IU", adult: "800 IU", athlete: "1000-2000 IU" },
    deficiency: {
      he: "חולשת שרירים, עייפות, סיכון מוגבר לשברים ולמחלות לב.",
      en: "Muscle weakness, fatigue, higher fracture and heart-disease risk.",
    },
    excess: {
      he: "מעל 4000 IU/יום ברציפות עלול להעלות סידן בדם ולפגוע בכליות.",
      en: "Continuous doses over 4000 IU/day can elevate blood calcium and harm kidneys.",
    },
    sources: [
      { food: { he: "סלמון אטלנטי", en: "Atlantic salmon" }, amount: { he: "100 גרם — 600 IU", en: "100 g — 600 IU" } },
      { food: { he: "חלמון ביצה", en: "Egg yolk" }, amount: { he: "2 ביצים — 80 IU", en: "2 eggs — 80 IU" } },
      { food: { he: "סרדינים", en: "Sardines" }, amount: { he: "85 גרם — 200 IU", en: "85 g — 200 IU" } },
      { food: { he: "טונה משומרת", en: "Canned tuna" }, amount: { he: "100 גרם — 230 IU", en: "100 g — 230 IU" } },
      { food: { he: "פטריות מסביב לשמש", en: "Sun-exposed mushrooms" }, amount: { he: "100 גרם — 130 IU", en: "100 g — 130 IU" } },
      { food: { he: "חלב מועשר", en: "Fortified milk" }, amount: { he: "1 כוס — 100 IU", en: "1 cup — 100 IU" } },
      { food: { he: "חשיפה לשמש", en: "Sun exposure" }, amount: { he: "15 דק׳ בצהריים", en: "15 min midday" } },
    ],
    color: "#facc15",
  },
  {
    id: "vit-b12",
    category: "vitamins",
    name: { he: "ויטמין B12", en: "Vitamin B12" },
    role: {
      he: "ייצור תאי דם אדומים, תפקוד עצבים ומטבוליזם של חלבון.",
      en: "Red blood cell production, nerve function, protein metabolism.",
    },
    daily: { child: "1.2 מק״ג", teen: "2.4 מק״ג", adult: "2.4 מק״ג", athlete: "2.6 מק״ג" },
    deficiency: {
      he: "אנמיה, עייפות, נימול בידיים/רגליים, ירידה בריכוז.",
      en: "Anemia, fatigue, tingling in hands/feet, poor concentration.",
    },
    excess: {
      he: "אין רעילות ידועה — עודף מופרש בשתן.",
      en: "No known toxicity — excess is excreted in urine.",
    },
    sources: [
      { food: { he: "בשר בקר", en: "Beef" }, amount: { he: "85 גרם — 2.4 מק״ג", en: "85 g — 2.4 mcg" } },
      { food: { he: "סלמון", en: "Salmon" }, amount: { he: "100 גרם — 2.6 מק״ג", en: "100 g — 2.6 mcg" } },
      { food: { he: "ביצים", en: "Eggs" }, amount: { he: "2 ביצים — 1 מק״ג", en: "2 eggs — 1 mcg" } },
      { food: { he: "יוגורט", en: "Yogurt" }, amount: { he: "200 גרם — 1.5 מק״ג", en: "200 g — 1.5 mcg" } },
      { food: { he: "חלב", en: "Milk" }, amount: { he: "1 כוס — 1.3 מק״ג", en: "1 cup — 1.3 mcg" } },
      { food: { he: "סרדינים", en: "Sardines" }, amount: { he: "100 גרם — 8.9 מק״ג", en: "100 g — 8.9 mcg" } },
      { food: { he: "גבינה צהובה", en: "Yellow cheese" }, amount: { he: "30 גרם — 0.4 מק״ג", en: "30 g — 0.4 mcg" } },
    ],
    color: "#f97316",
  },
  {
    id: "vit-a",
    category: "vitamins",
    name: { he: "ויטמין A", en: "Vitamin A" },
    role: {
      he: "ראייה, עור בריא ומערכת חיסון תקינה.",
      en: "Vision, healthy skin, immune defence.",
    },
    daily: { child: "400 מק״ג", teen: "700 מק״ג", adult: "900 מק״ג", athlete: "900 מק״ג" },
    deficiency: {
      he: "עיוורון לילה, עור יבש, נטייה להידבקויות.",
      en: "Night blindness, dry skin, frequent infections.",
    },
    excess: {
      he: "מעל 3000 מק״ג ביום — בחילות, כאבי ראש ופגיעה בכבד.",
      en: "Doses above 3000 mcg/day cause nausea, headaches and liver damage.",
    },
    sources: [
      { food: { he: "בטטה אפויה", en: "Baked sweet potato" }, amount: { he: "100 גרם — 960 מק״ג", en: "100 g — 960 mcg" } },
      { food: { he: "גזר", en: "Carrot" }, amount: { he: "100 גרם — 830 מק״ג", en: "100 g — 830 mcg" } },
      { food: { he: "תרד מבושל", en: "Cooked spinach" }, amount: { he: "100 גרם — 470 מק״ג", en: "100 g — 470 mcg" } },
      { food: { he: "כבד עוף", en: "Chicken liver" }, amount: { he: "85 גרם — 4000 מק״ג", en: "85 g — 4000 mcg" } },
      { food: { he: "מנגו", en: "Mango" }, amount: { he: "1 שלם — 100 מק״ג", en: "1 whole — 100 mcg" } },
      { food: { he: "פלפל אדום", en: "Red pepper" }, amount: { he: "100 גרם — 160 מק״ג", en: "100 g — 160 mcg" } },
    ],
    color: "#fb923c",
  },
  {
    id: "vit-e",
    category: "vitamins",
    name: { he: "ויטמין E", en: "Vitamin E" },
    role: {
      he: "נוגד חמצון מרכזי, מגן על תאים ועל קרומי תאים.",
      en: "Major antioxidant, protects cells and cell membranes.",
    },
    daily: { child: "7 מ״ג", teen: "11 מ״ג", adult: "15 מ״ג", athlete: "15-20 מ״ג" },
    deficiency: {
      he: "פגיעה במערכת העצבים, חולשת שרירים, ירידה בראייה.",
      en: "Nerve damage, muscle weakness, vision impairment.",
    },
    excess: {
      he: "מעל 1000 מ״ג ביום עלול להגביר סיכון לדימומים.",
      en: "Doses over 1000 mg/day may increase bleeding risk.",
    },
    sources: [
      { food: { he: "שקדים", en: "Almonds" }, amount: { he: "30 גרם — 7.3 מ״ג", en: "30 g — 7.3 mg" } },
      { food: { he: "אבוקדו", en: "Avocado" }, amount: { he: "1 שלם — 4 מ״ג", en: "1 whole — 4 mg" } },
      { food: { he: "שמן חמניות", en: "Sunflower oil" }, amount: { he: "1 כף — 5.6 מ״ג", en: "1 tbsp — 5.6 mg" } },
      { food: { he: "גרעיני חמניות", en: "Sunflower seeds" }, amount: { he: "30 גרם — 11 מ״ג", en: "30 g — 11 mg" } },
      { food: { he: "תרד", en: "Spinach" }, amount: { he: "200 גרם — 4.2 מ״ג", en: "200 g — 4.2 mg" } },
      { food: { he: "אגוזי לוז", en: "Hazelnuts" }, amount: { he: "30 גרם — 4.5 מ״ג", en: "30 g — 4.5 mg" } },
      { food: { he: "מנגו", en: "Mango" }, amount: { he: "1 שלם — 1.5 מ״ג", en: "1 whole — 1.5 mg" } },
    ],
    color: "#84cc16",
  },

  // ============================ Minerals ============================
  {
    id: "iron",
    category: "minerals",
    name: { he: "ברזל", en: "Iron" },
    role: {
      he: "נשיאת חמצן בדם, ייצור אנרגיה ותפקוד מערכת חיסון.",
      en: "Oxygen transport, energy production, immune function.",
    },
    daily: { child: "10 מ״ג", teen: "11-15 מ״ג", adult: "8-18 מ״ג", athlete: "20 מ״ג" },
    deficiency: {
      he: "אנמיה, עייפות, חיוורון, קוצר נשימה.",
      en: "Anemia, fatigue, paleness, shortness of breath.",
    },
    excess: {
      he: "עומס יתר — נזק לכבד, ללב ולמפרקים.",
      en: "Iron overload damages liver, heart and joints.",
    },
    sources: [
      { food: { he: "בשר בקר", en: "Beef" }, amount: { he: "100 גרם — 2.7 מ״ג", en: "100 g — 2.7 mg" } },
      { food: { he: "עדשים מבושלות", en: "Cooked lentils" }, amount: { he: "200 גרם — 6.6 מ״ג", en: "200 g — 6.6 mg" } },
      { food: { he: "תרד מבושל", en: "Cooked spinach" }, amount: { he: "180 גרם — 6.4 מ״ג", en: "180 g — 6.4 mg" } },
      { food: { he: "טופו", en: "Tofu" }, amount: { he: "200 גרם — 5.4 מ״ג", en: "200 g — 5.4 mg" } },
      { food: { he: "טחינה", en: "Tahini" }, amount: { he: "30 גרם — 2.7 מ״ג", en: "30 g — 2.7 mg" } },
      { food: { he: "שעועית שחורה", en: "Black beans" }, amount: { he: "200 גרם — 7.2 מ״ג", en: "200 g — 7.2 mg" } },
      { food: { he: "כבד עוף", en: "Chicken liver" }, amount: { he: "100 גרם — 11.6 מ״ג", en: "100 g — 11.6 mg" } },
      { food: { he: "קישוא דלעת", en: "Pumpkin seeds" }, amount: { he: "30 גרם — 2.5 מ״ג", en: "30 g — 2.5 mg" } },
    ],
    color: "#dc2626",
  },
  {
    id: "calcium",
    category: "minerals",
    name: { he: "סידן", en: "Calcium" },
    role: {
      he: "בניית עצמות ושיניים, התכווצות שרירים והעברת אותות עצביים.",
      en: "Bone & teeth health, muscle contraction, nerve signalling.",
    },
    daily: { child: "1000 מ״ג", teen: "1300 מ״ג", adult: "1000 מ״ג", athlete: "1200 מ״ג" },
    deficiency: {
      he: "עצמות חלשות, אוסטיאופורוזיס, התכווצויות שרירים.",
      en: "Weak bones, osteoporosis, muscle cramps.",
    },
    excess: {
      he: "מעל 2500 מ״ג ביום — אבני כליה ופגיעה בספיגת מינרלים אחרים.",
      en: "Above 2500 mg/day — kidney stones and impaired absorption of other minerals.",
    },
    sources: [
      { food: { he: "יוגורט", en: "Yogurt" }, amount: { he: "200 גרם — 240 מ״ג", en: "200 g — 240 mg" } },
      { food: { he: "טחינה גולמית", en: "Raw tahini" }, amount: { he: "30 גרם — 130 מ״ג", en: "30 g — 130 mg" } },
      { food: { he: "סרדינים עם עצמות", en: "Sardines with bones" }, amount: { he: "85 גרם — 325 מ״ג", en: "85 g — 325 mg" } },
      { food: { he: "ברוקולי מבושל", en: "Cooked broccoli" }, amount: { he: "200 גרם — 90 מ״ג", en: "200 g — 90 mg" } },
      { food: { he: "חלב", en: "Milk" }, amount: { he: "1 כוס — 300 מ״ג", en: "1 cup — 300 mg" } },
      { food: { he: "גבינה צהובה", en: "Yellow cheese" }, amount: { he: "30 גרם — 200 מ״ג", en: "30 g — 200 mg" } },
      { food: { he: "טופו (סידן-מועשר)", en: "Calcium-set tofu" }, amount: { he: "200 גרם — 400 מ״ג", en: "200 g — 400 mg" } },
      { food: { he: "שקדים", en: "Almonds" }, amount: { he: "30 גרם — 75 מ״ג", en: "30 g — 75 mg" } },
    ],
    color: "#3b82f6",
  },
  {
    id: "magnesium",
    category: "minerals",
    name: { he: "מגנזיום", en: "Magnesium" },
    role: {
      he: "מעורב ביותר מ-300 תהליכים — שרירים, עצבים, רמות סוכר וייצור אנרגיה.",
      en: "Involved in 300+ processes — muscles, nerves, blood sugar, energy.",
    },
    daily: { child: "130 מ״ג", teen: "360 מ״ג", adult: "400 מ״ג", athlete: "450 מ״ג" },
    deficiency: {
      he: "התכווצויות שרירים, עייפות, נדודי שינה, עצבנות.",
      en: "Muscle cramps, fatigue, insomnia, irritability.",
    },
    excess: {
      he: "מעל 350 מ״ג מתוסף — שלשולים ובחילות.",
      en: "Over 350 mg from supplements — diarrhea and nausea.",
    },
    sources: [
      { food: { he: "שקדים", en: "Almonds" }, amount: { he: "60 גרם — 160 מ״ג", en: "60 g — 160 mg" } },
      { food: { he: "תרד מבושל", en: "Cooked spinach" }, amount: { he: "180 גרם — 157 מ״ג", en: "180 g — 157 mg" } },
      { food: { he: "שוקולד מריר 70%+", en: "Dark chocolate 70%+" }, amount: { he: "30 גרם — 65 מ״ג", en: "30 g — 65 mg" } },
      { food: { he: "אבוקדו", en: "Avocado" }, amount: { he: "1 שלם — 58 מ״ג", en: "1 whole — 58 mg" } },
      { food: { he: "אגוזי קשיו", en: "Cashews" }, amount: { he: "30 גרם — 80 מ״ג", en: "30 g — 80 mg" } },
      { food: { he: "שעועית שחורה", en: "Black beans" }, amount: { he: "200 גרם — 120 מ״ג", en: "200 g — 120 mg" } },
      { food: { he: "קינואה מבושלת", en: "Cooked quinoa" }, amount: { he: "200 גרם — 118 מ״ג", en: "200 g — 118 mg" } },
      { food: { he: "בננה", en: "Banana" }, amount: { he: "1 בינונית — 32 מ״ג", en: "1 medium — 32 mg" } },
    ],
    color: "#0ea5e9",
  },
  {
    id: "zinc",
    category: "minerals",
    name: { he: "אבץ", en: "Zinc" },
    role: {
      he: "מערכת חיסון, ריפוי פצעים, חוש טעם וריח, סינתזת חלבון.",
      en: "Immune system, wound healing, taste & smell, protein synthesis.",
    },
    daily: { child: "5 מ״ג", teen: "11 מ״ג", adult: "11 מ״ג", athlete: "15 מ״ג" },
    deficiency: {
      he: "ריפוי איטי, נשירת שיער, ירידה בחוש הטעם, מערכת חיסון חלשה.",
      en: "Slow healing, hair loss, reduced taste, weak immunity.",
    },
    excess: {
      he: "מעל 40 מ״ג — בחילות, פגיעה בספיגת נחושת.",
      en: "Above 40 mg — nausea and impaired copper absorption.",
    },
    sources: [
      { food: { he: "בשר בקר", en: "Beef" }, amount: { he: "100 גרם — 5.3 מ״ג", en: "100 g — 5.3 mg" } },
      { food: { he: "גרעיני דלעת", en: "Pumpkin seeds" }, amount: { he: "30 גרם — 2.2 מ״ג", en: "30 g — 2.2 mg" } },
      { food: { he: "עדשים מבושלות", en: "Cooked lentils" }, amount: { he: "200 גרם — 2.5 מ״ג", en: "200 g — 2.5 mg" } },
      { food: { he: "אגוזי קשיו", en: "Cashews" }, amount: { he: "30 גרם — 1.6 מ״ג", en: "30 g — 1.6 mg" } },
      { food: { he: "צדפות (מקסימום)", en: "Oysters (max)" }, amount: { he: "85 גרם — 32 מ״ג", en: "85 g — 32 mg" } },
      { food: { he: "חזה עוף", en: "Chicken breast" }, amount: { he: "100 גרם — 1 מ״ג", en: "100 g — 1 mg" } },
    ],
    color: "#a855f7",
  },

  // ============================ Antioxidants ============================
  {
    id: "antiox-poly",
    category: "antioxidants",
    name: { he: "פוליפנולים", en: "Polyphenols" },
    role: {
      he: "מגינים על תאים מנזק חמצוני, תורמים לבריאות הלב והמוח.",
      en: "Protect cells from oxidative damage, support heart and brain.",
    },
    daily: { child: "500 מ״ג", teen: "650 מ״ג", adult: "650 מ״ג", athlete: "1000 מ״ג" },
    deficiency: {
      he: "האצת הזדקנות, דלקת כרונית, סיכון מוגבר למחלות לב.",
      en: "Accelerated aging, chronic inflammation, higher heart-disease risk.",
    },
    excess: {
      he: "צריכה תזונתית רגילה בטוחה. תוספים מעל 1000 מ״ג עלולים להפריע לבלוטת התריס.",
      en: "Diet sources are safe. Supplements over 1000 mg may interfere with the thyroid.",
    },
    sources: [
      { food: { he: "תה ירוק", en: "Green tea" }, amount: { he: "2-3 כוסות ביום", en: "2-3 cups/day" } },
      { food: { he: "אוכמניות", en: "Blueberries" }, amount: { he: "100 גרם — 525 מ״ג", en: "100 g — 525 mg" } },
      { food: { he: "שוקולד מריר 70%+", en: "Dark chocolate 70%+" }, amount: { he: "30 גרם — 350 מ״ג", en: "30 g — 350 mg" } },
      { food: { he: "ענבים אדומים", en: "Red grapes" }, amount: { he: "100 גרם — 175 מ״ג", en: "100 g — 175 mg" } },
      { food: { he: "רימון", en: "Pomegranate" }, amount: { he: "1/2 שלם — 250 מ״ג", en: "1/2 whole — 250 mg" } },
      { food: { he: "ציפורן", en: "Cloves" }, amount: { he: "1 כפית — 80 מ״ג", en: "1 tsp — 80 mg" } },
      { food: { he: "קפה שחור", en: "Black coffee" }, amount: { he: "1 כוס — 220 מ״ג", en: "1 cup — 220 mg" } },
    ],
    color: "#7c3aed",
  },

  // ============================ Protein ============================
  {
    id: "protein",
    category: "protein",
    name: { he: "חלבון", en: "Protein" },
    role: {
      he: "בנייה ושיקום של שרירים, אנזימים והורמונים.",
      en: "Builds and repairs muscles, enzymes and hormones.",
    },
    daily: { child: "15-25 גרם", teen: "45-55 גרם", adult: "0.8 גרם/ק״ג", athlete: "1.6-2.2 גרם/ק״ג" },
    deficiency: {
      he: "אובדן מסת שריר, רעב מוגבר, ירידה במערכת חיסון.",
      en: "Loss of muscle mass, increased hunger, weakened immunity.",
    },
    excess: {
      he: "מעל 3.5 גרם/ק״ג — עומס על הכליות אצל אנשים עם רקע רפואי.",
      en: "Above 3.5 g/kg may stress kidneys in people with medical risk.",
    },
    sources: [
      { food: { he: "חזה עוף", en: "Chicken breast" }, amount: { he: "150 גרם — 45 גרם חלבון", en: "150 g → 45 g protein" } },
      { food: { he: "ביצים", en: "Eggs" }, amount: { he: "3 ביצים — 18 גרם", en: "3 eggs → 18 g" } },
      { food: { he: "טופו", en: "Tofu" }, amount: { he: "200 גרם — 16 גרם", en: "200 g → 16 g" } },
      { food: { he: "יוגורט יווני 0%", en: "Greek yogurt 0%" }, amount: { he: "200 גרם — 20 גרם", en: "200 g → 20 g" } },
      { food: { he: "טונה במים", en: "Tuna in water" }, amount: { he: "1 קופסה — 28 גרם", en: "1 can → 28 g" } },
      { food: { he: "סלמון", en: "Salmon" }, amount: { he: "150 גרם — 30 גרם", en: "150 g → 30 g" } },
      { food: { he: "עדשים מבושלות", en: "Cooked lentils" }, amount: { he: "200 גרם — 18 גרם", en: "200 g → 18 g" } },
      { food: { he: "קוטג׳ 5%", en: "Cottage cheese 5%" }, amount: { he: "200 גרם — 25 גרם", en: "200 g → 25 g" } },
      { food: { he: "אבקת חלבון", en: "Whey protein" }, amount: { he: "1 מנה (30 גרם) — 24 גרם", en: "1 scoop (30 g) → 24 g" } },
    ],
    color: "#ef4444",
  },

  // ============================ Omega 3 ============================
  {
    id: "omega3",
    category: "omega3",
    name: { he: "אומגה 3", en: "Omega-3" },
    role: {
      he: "תומך במוח, בלב ובהפחתת דלקת.",
      en: "Supports brain, heart and reduces inflammation.",
    },
    daily: { child: "1 גרם", teen: "1.2 גרם", adult: "1.6 גרם", athlete: "2 גרם" },
    deficiency: {
      he: "עור יבש, ירידה בריכוז, מצב רוח ירוד, דלקתיות.",
      en: "Dry skin, poor focus, low mood, inflammation.",
    },
    excess: {
      he: "מעל 5 גרם ליום — עלול להעלות סיכון לדימומים.",
      en: "Over 5 g/day may increase bleeding risk.",
    },
    sources: [
      { food: { he: "סלמון אטלנטי", en: "Atlantic salmon" }, amount: { he: "100 גרם — 2.3 גרם", en: "100 g → 2.3 g" } },
      { food: { he: "אגוזי מלך", en: "Walnuts" }, amount: { he: "30 גרם — 2.5 גרם ALA", en: "30 g → 2.5 g ALA" } },
      { food: { he: "זרעי צ׳יה", en: "Chia seeds" }, amount: { he: "20 גרם — 5 גרם", en: "20 g → 5 g" } },
      { food: { he: "זרעי פשתן טחונים", en: "Ground flaxseed" }, amount: { he: "1 כף — 2.4 גרם ALA", en: "1 tbsp → 2.4 g ALA" } },
      { food: { he: "סרדינים", en: "Sardines" }, amount: { he: "85 גרם — 1.4 גרם", en: "85 g → 1.4 g" } },
      { food: { he: "מקרל", en: "Mackerel" }, amount: { he: "100 גרם — 2.6 גרם", en: "100 g → 2.6 g" } },
      { food: { he: "ביצים מועשרות", en: "Omega-3 eggs" }, amount: { he: "2 ביצים — 0.6 גרם", en: "2 eggs → 0.6 g" } },
      { food: { he: "אצות (סוג צמחי DHA)", en: "Algae (plant DHA)" }, amount: { he: "1 כמוסה — 250 מ״ג", en: "1 capsule → 250 mg" } },
    ],
    color: "#06b6d4",
  },

  // ============================ Fiber ============================
  {
    id: "fiber",
    category: "fiber",
    name: { he: "סיבים תזונתיים", en: "Dietary fiber" },
    role: {
      he: "תומך בעיכול, באיזון סוכר ובחיידקי המעי הטובים.",
      en: "Supports digestion, blood sugar balance and gut microbes.",
    },
    daily: { child: "20 גרם", teen: "26 גרם", adult: "25-38 גרם", athlete: "35-40 גרם" },
    deficiency: {
      he: "עצירות, רעב מהיר, תנודות בסוכר בדם.",
      en: "Constipation, quick hunger, blood sugar swings.",
    },
    excess: {
      he: "מעל 70 גרם ביום — נפיחות, גזים ופגיעה בספיגת מינרלים.",
      en: "Over 70 g/day — bloating, gas, mineral malabsorption.",
    },
    sources: [
      { food: { he: "שיבולת שועל", en: "Oats" }, amount: { he: "50 גרם — 5 גרם", en: "50 g → 5 g" } },
      { food: { he: "שעועית שחורה מבושלת", en: "Cooked black beans" }, amount: { he: "150 גרם — 12 גרם", en: "150 g → 12 g" } },
      { food: { he: "אבוקדו", en: "Avocado" }, amount: { he: "1 שלם — 10 גרם", en: "1 whole → 10 g" } },
      { food: { he: "תפוח עם קליפה", en: "Apple with skin" }, amount: { he: "1 גדול — 5 גרם", en: "1 large → 5 g" } },
      { food: { he: "פטל", en: "Raspberries" }, amount: { he: "100 גרם — 6.5 גרם", en: "100 g → 6.5 g" } },
      { food: { he: "אגסים עם קליפה", en: "Pear with skin" }, amount: { he: "1 בינוני — 5.5 גרם", en: "1 medium → 5.5 g" } },
      { food: { he: "ארטישוק", en: "Artichoke" }, amount: { he: "1 שלם — 10 גרם", en: "1 whole → 10 g" } },
      { food: { he: "זרעי צ׳יה", en: "Chia seeds" }, amount: { he: "20 גרם — 7 גרם", en: "20 g → 7 g" } },
      { food: { he: "אדממה", en: "Edamame" }, amount: { he: "150 גרם — 8 גרם", en: "150 g → 8 g" } },
    ],
    color: "#92400e",
  },

  // ============================ Water ============================
  {
    id: "water",
    category: "water",
    name: { he: "מים", en: "Water" },
    role: {
      he: "ויסות חום, הובלת חומרים, סיכוך מפרקים, עיכול ותפקוד מוחי.",
      en: "Temperature regulation, nutrient transport, joint lubrication, digestion, brain function.",
    },
    daily: { child: "1.5 ל׳", teen: "2 ל׳", adult: "2.5-3 ל׳", athlete: "3.5-4.5 ל׳" },
    deficiency: {
      he: "עייפות, כאבי ראש, ריכוז ירוד, עצירות, ירידה בביצועים.",
      en: "Fatigue, headaches, poor focus, constipation, reduced performance.",
    },
    excess: {
      he: 'מעל 5 ל׳ בשעה — היפונתרמיה ("הרעלת מים"), נדיר אך מסוכן.',
      en: "Over 5 L/hour — hyponatremia (water intoxication), rare but dangerous.",
    },
    sources: [
      { food: { he: "מים", en: "Water" }, amount: { he: "8 כוסות (≈2 ל׳)", en: "8 glasses (≈2 L)" } },
      { food: { he: "מלפפון", en: "Cucumber" }, amount: { he: "200 גרם — 95% מים", en: "200 g — 95% water" } },
      { food: { he: "אבטיח", en: "Watermelon" }, amount: { he: "200 גרם — 92% מים", en: "200 g — 92% water" } },
      { food: { he: "תה צמחים ללא קפאין", en: "Caffeine-free herbal tea" }, amount: { he: "ללא הגבלה", en: "Unlimited" } },
      { food: { he: "סלרי", en: "Celery" }, amount: { he: "100 גרם — 95% מים", en: "100 g — 95% water" } },
      { food: { he: "תפוז", en: "Orange" }, amount: { he: "1 בינוני — 130 מ״ל", en: "1 medium — 130 ml" } },
      { food: { he: "מרק ירקות", en: "Vegetable broth" }, amount: { he: "1 כוס — 240 מ״ל", en: "1 cup — 240 ml" } },
    ],
    color: "#0284c7",
  },

  // ============================ Electrolytes ============================
  {
    id: "potassium",
    category: "electrolytes",
    name: { he: "אשלגן", en: "Potassium" },
    role: {
      he: "ויסות לחץ דם, התכווצות שרירים ואיזון נוזלים.",
      en: "Blood pressure, muscle contraction, fluid balance.",
    },
    daily: { child: "2300 מ״ג", teen: "3000 מ״ג", adult: "3400 מ״ג", athlete: "4000 מ״ג" },
    deficiency: {
      he: "התכווצויות, חולשה, פעימות לב לא סדירות.",
      en: "Cramps, weakness, irregular heartbeat.",
    },
    excess: {
      he: "מעל 18 גרם ביום עלול לגרום לבעיות לב.",
      en: "Over 18 g/day can cause heart issues.",
    },
    sources: [
      { food: { he: "בננה", en: "Banana" }, amount: { he: "1 בינונית — 420 מ״ג", en: "1 medium → 420 mg" } },
      { food: { he: "תפוח אדמה אפוי", en: "Baked potato" }, amount: { he: "1 בינוני — 925 מ״ג", en: "1 medium → 925 mg" } },
      { food: { he: "תרד מבושל", en: "Cooked spinach" }, amount: { he: "180 גרם — 840 מ״ג", en: "180 g → 840 mg" } },
      { food: { he: "בטטה אפויה", en: "Baked sweet potato" }, amount: { he: "1 בינונית — 540 מ״ג", en: "1 medium → 540 mg" } },
      { food: { he: "אבוקדו", en: "Avocado" }, amount: { he: "1 שלם — 970 מ״ג", en: "1 whole → 970 mg" } },
      { food: { he: "סלמון", en: "Salmon" }, amount: { he: "100 גרם — 360 מ״ג", en: "100 g → 360 mg" } },
      { food: { he: "שעועית לבנה מבושלת", en: "Cooked white beans" }, amount: { he: "200 גרם — 1190 מ״ג", en: "200 g → 1190 mg" } },
      { food: { he: "יוגורט יווני", en: "Greek yogurt" }, amount: { he: "200 גרם — 280 מ״ג", en: "200 g → 280 mg" } },
    ],
    color: "#65a30d",
  },

  // ============================ Probiotics ============================
  {
    id: "probiotics",
    category: "probiotics",
    name: { he: "פרוביוטיקה", en: "Probiotics" },
    role: {
      he: "חיידקים טובים שמשפרים עיכול, חיסון ומצב רוח.",
      en: "Good bacteria that improve digestion, immunity and mood.",
    },
    daily: { child: "1-5 מיליארד CFU", teen: "5-10 מיליארד CFU", adult: "10 מיליארד CFU", athlete: "20 מיליארד CFU" },
    deficiency: {
      he: "בעיות עיכול, נפיחות, חיסון חלש, מצב רוח ירוד.",
      en: "Digestive issues, bloating, weak immunity, low mood.",
    },
    excess: {
      he: "בדרך כלל בטוח. ייתכן גזים בתחילת הצריכה.",
      en: "Generally safe. Gas may occur when starting.",
    },
    sources: [
      { food: { he: "יוגורט עם תרבית פעילה", en: "Live-culture yogurt" }, amount: { he: "200 גרם — 10 מיליארד CFU", en: "200 g — 10B CFU" } },
      { food: { he: "כרוב כבוש (Sauerkraut)", en: "Sauerkraut" }, amount: { he: "60 גרם — מיליארדי CFU", en: "60 g — billions CFU" } },
      { food: { he: "קפיר", en: "Kefir" }, amount: { he: "200 מ״ל — 50 מיליארד CFU", en: "200 ml — 50B CFU" } },
      { food: { he: "קימצ׳י", en: "Kimchi" }, amount: { he: "60 גרם — 100 מיליון CFU", en: "60 g — 100M CFU" } },
      { food: { he: "מיסו", en: "Miso" }, amount: { he: "1 כף — מיליוני CFU", en: "1 tbsp — millions CFU" } },
      { food: { he: "טמפה", en: "Tempeh" }, amount: { he: "100 גרם", en: "100 g" } },
      { food: { he: "קומבוצ׳ה", en: "Kombucha" }, amount: { he: "240 מ״ל", en: "240 ml" } },
    ],
    color: "#ec4899",
  },

  // ============================ Good fats ============================
  {
    id: "good-fats",
    category: "goodFats",
    name: { he: "שומנים בריאים", en: "Healthy fats" },
    role: {
      he: "תמיכה בהורמונים, ספיגת ויטמינים מסיסי שומן ובריאות הלב.",
      en: "Hormone support, fat-soluble vitamin absorption, heart health.",
    },
    daily: { child: "30-40 גרם", teen: "50-70 גרם", adult: "60-80 גרם", athlete: "80-100 גרם" },
    deficiency: {
      he: "עור יבש, חוסר ספיגה של ויטמינים, חוסר איזון הורמונלי.",
      en: "Dry skin, vitamin malabsorption, hormonal imbalance.",
    },
    excess: {
      he: "צריכה גבוהה של שומן רווי קשורה לעלייה בכולסטרול LDL.",
      en: "High saturated fat intake is linked to higher LDL cholesterol.",
    },
    sources: [
      { food: { he: "אבוקדו", en: "Avocado" }, amount: { he: "1 שלם — 22 גרם", en: "1 whole → 22 g" } },
      { food: { he: "שמן זית", en: "Olive oil" }, amount: { he: "1 כף — 14 גרם", en: "1 tbsp → 14 g" } },
      { food: { he: "אגוזי מלך", en: "Walnuts" }, amount: { he: "30 גרם — 19 גרם", en: "30 g → 19 g" } },
      { food: { he: "שקדים", en: "Almonds" }, amount: { he: "30 גרם — 15 גרם", en: "30 g → 15 g" } },
      { food: { he: "סלמון", en: "Salmon" }, amount: { he: "100 גרם — 13 גרם", en: "100 g → 13 g" } },
      { food: { he: "טחינה גולמית", en: "Raw tahini" }, amount: { he: "1 כף — 8 גרם", en: "1 tbsp → 8 g" } },
      { food: { he: "זיתים", en: "Olives" }, amount: { he: "30 גרם — 4 גרם", en: "30 g → 4 g" } },
      { food: { he: "חמאת בוטנים טבעית", en: "Natural peanut butter" }, amount: { he: "1 כף — 8 גרם", en: "1 tbsp → 8 g" } },
    ],
    color: "#fbbf24",
  },
];

export function nutrientById(id: string): Nutrient | undefined {
  return NUTRIENTS.find((n) => n.id === id);
}
