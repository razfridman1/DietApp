// Curated guide of common day-to-day foods, sorted into healthy / moderate / unhealthy.
// Hebrew + English bilingual; each item carries:
//   - rating (1-10)
//   - category (matches the i18n keys in dict.guide.categories)
//   - benefits/harms in HE + EN
//   - a short note in HE + EN

export type GuideCategory =
  | "grains"
  | "protein"
  | "dairy"
  | "produce"
  | "fats"
  | "drinks"
  | "sweets"
  | "fastFood"
  | "snacks"
  | "bakery"
  | "sandwiches"
  | "sauces";

export interface GuideFood {
  id: string;
  name: { he: string; en: string };
  rating: number; // 1 (best) – 10 (worst)
  category: GuideCategory;
  /** Short list of what the food gives (good) — only relevant for healthy/moderate items */
  benefits?: { he: string[]; en: string[] };
  /** Short list of how it harms — only relevant for moderate/unhealthy items */
  harms?: { he: string[]; en: string[] };
  /** Single-line balancing note, optional */
  note?: { he: string; en: string };
}

export const GUIDE_FOODS: GuideFood[] = [
  // ========================= 1-3 :: VERY HEALTHY ============================
  {
    id: "broccoli",
    name: { he: "ברוקולי", en: "Broccoli" },
    rating: 1,
    category: "produce",
    benefits: {
      he: ["סיבים", "ויטמין C", "ויטמין K", "נוגדי חמצון"],
      en: ["Fiber", "Vitamin C", "Vitamin K", "Antioxidants"],
    },
    note: { he: "מצוין מאודה או אפוי בשמן זית.", en: "Best steamed or oven-baked with olive oil." },
  },
  {
    id: "spinach",
    name: { he: "תרד", en: "Spinach" },
    rating: 1,
    category: "produce",
    benefits: {
      he: ["ברזל", "מגנזיום", "פולאט", "נוגדי חמצון"],
      en: ["Iron", "Magnesium", "Folate", "Antioxidants"],
    },
  },
  {
    id: "salmon",
    name: { he: "סלמון", en: "Salmon" },
    rating: 2,
    category: "protein",
    benefits: {
      he: ["אומגה 3", "חלבון איכותי", "ויטמין D", "B12"],
      en: ["Omega-3", "Quality protein", "Vitamin D", "B12"],
    },
    note: { he: "1-2 פעמים בשבוע אידיאלי.", en: "1-2 times a week is ideal." },
  },
  {
    id: "eggs",
    name: { he: "ביצים", en: "Eggs" },
    rating: 2,
    category: "protein",
    benefits: {
      he: ["חלבון מלא", "כולין למוח", "B12", "ויטמין D"],
      en: ["Complete protein", "Choline for brain", "B12", "Vitamin D"],
    },
  },
  {
    id: "olive-oil",
    name: { he: "שמן זית", en: "Olive oil" },
    rating: 2,
    category: "fats",
    benefits: {
      he: ["שומן חד בלתי רווי", "פוליפנולים", "תומך בלב"],
      en: ["Monounsaturated fat", "Polyphenols", "Heart-supportive"],
    },
    note: { he: "מצוין על סלט, פחות מתאים לטיגון בחום גבוה.", en: "Great on salads; not ideal for high-heat frying." },
  },
  {
    id: "avocado",
    name: { he: "אבוקדו", en: "Avocado" },
    rating: 2,
    category: "fats",
    benefits: {
      he: ["שומן בריא", "סיבים", "אשלגן", "ויטמין E"],
      en: ["Healthy fat", "Fiber", "Potassium", "Vitamin E"],
    },
  },
  {
    id: "greek-yogurt",
    name: { he: "יוגורט יווני 0%-2%", en: "Greek yogurt 0-2%" },
    rating: 2,
    category: "dairy",
    benefits: {
      he: ["חלבון גבוה", "סידן", "פרוביוטיקה", "B12"],
      en: ["High protein", "Calcium", "Probiotics", "B12"],
    },
  },
  {
    id: "cottage-cheese",
    name: { he: "קוטג׳ 5%", en: "Cottage cheese 5%" },
    rating: 3,
    category: "dairy",
    benefits: {
      he: ["חלבון מלא", "סידן", "קל לעיכול"],
      en: ["Complete protein", "Calcium", "Easy to digest"],
    },
  },
  {
    id: "white-cheese-5",
    name: { he: "גבינה לבנה 5%", en: "White cheese 5%" },
    rating: 3,
    category: "dairy",
    benefits: {
      he: ["חלבון", "סידן", "מעט נתרן"],
      en: ["Protein", "Calcium", "Low sodium"],
    },
  },
  {
    id: "chicken-breast",
    name: { he: "חזה עוף", en: "Chicken breast" },
    rating: 2,
    category: "protein",
    benefits: {
      he: ["חלבון רזה", "ויטמיני B", "סלניום"],
      en: ["Lean protein", "B vitamins", "Selenium"],
    },
    note: { he: "עדיף בגריל / בתנור, לא מטוגן בפנקייק.", en: "Best grilled / baked, not deep-fried." },
  },
  {
    id: "turkey-breast",
    name: { he: "חזה הודו", en: "Turkey breast" },
    rating: 2,
    category: "protein",
    benefits: {
      he: ["חלבון רזה", "מעט שומן רווי", "B6"],
      en: ["Lean protein", "Low saturated fat", "B6"],
    },
  },
  {
    id: "tuna",
    name: { he: "טונה במים", en: "Tuna in water" },
    rating: 3,
    category: "protein",
    benefits: {
      he: ["חלבון גבוה", "אומגה 3", "סלניום"],
      en: ["High protein", "Omega-3", "Selenium"],
    },
    note: { he: "להגביל ל-2-3 קופסאות בשבוע (כספית).", en: "Limit to 2-3 cans/week (mercury)." },
  },
  {
    id: "tofu",
    name: { he: "טופו", en: "Tofu" },
    rating: 2,
    category: "protein",
    benefits: {
      he: ["חלבון צמחי", "סידן", "ברזל", "ללא כולסטרול"],
      en: ["Plant protein", "Calcium", "Iron", "No cholesterol"],
    },
  },
  {
    id: "lentils",
    name: { he: "עדשים", en: "Lentils" },
    rating: 2,
    category: "protein",
    benefits: {
      he: ["סיבים", "חלבון צמחי", "ברזל", "פולאט"],
      en: ["Fiber", "Plant protein", "Iron", "Folate"],
    },
  },
  {
    id: "chickpeas",
    name: { he: "גרגרי חומוס", en: "Chickpeas" },
    rating: 2,
    category: "protein",
    benefits: {
      he: ["חלבון", "סיבים", "ברזל"],
      en: ["Protein", "Fiber", "Iron"],
    },
  },
  {
    id: "homemade-hummus",
    name: { he: "חומוס ביתי", en: "Homemade hummus" },
    rating: 3,
    category: "protein",
    benefits: {
      he: ["חלבון צמחי", "שומן בריא מטחינה", "סיבים"],
      en: ["Plant protein", "Healthy fat from tahini", "Fiber"],
    },
    note: { he: "עדיף ביתי — תעשייתי לעיתים עתיר נתרן.", en: "Homemade is best — store-bought can be high in sodium." },
  },
  {
    id: "tahini-raw",
    name: { he: "טחינה גולמית", en: "Raw tahini" },
    rating: 3,
    category: "fats",
    benefits: {
      he: ["סידן", "מגנזיום", "שומן בלתי רווי"],
      en: ["Calcium", "Magnesium", "Unsaturated fat"],
    },
  },
  {
    id: "quinoa",
    name: { he: "קינואה", en: "Quinoa" },
    rating: 2,
    category: "grains",
    benefits: {
      he: ["חלבון מלא", "סיבים", "מגנזיום", "ברזל"],
      en: ["Complete protein", "Fiber", "Magnesium", "Iron"],
    },
  },
  {
    id: "brown-rice",
    name: { he: "אורז מלא", en: "Brown rice" },
    rating: 3,
    category: "grains",
    benefits: {
      he: ["סיבים", "מגנזיום", "אנרגיה איטית"],
      en: ["Fiber", "Magnesium", "Slow energy"],
    },
  },
  {
    id: "oats",
    name: { he: "שיבולת שועל", en: "Oats" },
    rating: 2,
    category: "grains",
    benefits: {
      he: ["סיבים מסיסים", "מוריד כולסטרול", "אנרגיה יציבה"],
      en: ["Soluble fiber", "Lowers cholesterol", "Steady energy"],
    },
  },
  {
    id: "sweet-potato",
    name: { he: "בטטה", en: "Sweet potato" },
    rating: 2,
    category: "produce",
    benefits: {
      he: ["ויטמין A", "סיבים", "אשלגן"],
      en: ["Vitamin A", "Fiber", "Potassium"],
    },
  },
  {
    id: "blueberries",
    name: { he: "אוכמניות", en: "Blueberries" },
    rating: 1,
    category: "produce",
    benefits: {
      he: ["נוגדי חמצון", "ויטמין C", "סיבים"],
      en: ["Antioxidants", "Vitamin C", "Fiber"],
    },
  },
  {
    id: "apple",
    name: { he: "תפוח עץ", en: "Apple" },
    rating: 2,
    category: "produce",
    benefits: {
      he: ["סיבים מסיסים", "ויטמין C", "פוליפנולים"],
      en: ["Soluble fiber", "Vitamin C", "Polyphenols"],
    },
  },
  {
    id: "banana",
    name: { he: "בננה", en: "Banana" },
    rating: 3,
    category: "produce",
    benefits: {
      he: ["אשלגן", "ויטמין B6", "אנרגיה מהירה"],
      en: ["Potassium", "Vitamin B6", "Quick energy"],
    },
    note: { he: "מתאימה במיוחד לפני/אחרי אימון.", en: "Great pre/post workout." },
  },
  {
    id: "almonds",
    name: { he: "שקדים", en: "Almonds" },
    rating: 2,
    category: "fats",
    benefits: {
      he: ["ויטמין E", "מגנזיום", "שומן בריא"],
      en: ["Vitamin E", "Magnesium", "Healthy fat"],
    },
  },
  {
    id: "walnuts",
    name: { he: "אגוזי מלך", en: "Walnuts" },
    rating: 2,
    category: "fats",
    benefits: {
      he: ["אומגה 3 צמחי", "נוגדי חמצון", "תומך במוח"],
      en: ["Plant omega-3", "Antioxidants", "Brain-supportive"],
    },
  },
  {
    id: "dark-chocolate-70",
    name: { he: "שוקולד מריר 70%+", en: "Dark chocolate 70%+" },
    rating: 4,
    category: "sweets",
    benefits: {
      he: ["פוליפנולים", "מגנזיום", "מצב רוח"],
      en: ["Polyphenols", "Magnesium", "Mood"],
    },
    note: { he: "מנה: 20-30 גרם ביום.", en: "Serving: 20-30 g per day." },
  },

  // ========================= 4-6 :: MODERATE =================================
  {
    id: "white-rice",
    name: { he: "אורז לבן", en: "White rice" },
    rating: 5,
    category: "grains",
    benefits: { he: ["אנרגיה זמינה", "קל לעיכול"], en: ["Available energy", "Easy to digest"] },
    harms: { he: ["אינדקס גליקמי גבוה", "פחות סיבים מאורז מלא"], en: ["High glycemic index", "Less fiber than brown rice"] },
  },
  {
    id: "pasta-white",
    name: { he: "פסטה רגילה", en: "White pasta" },
    rating: 5,
    category: "grains",
    benefits: { he: ["מקור אנרגיה", "מילוי נוח"], en: ["Energy source", "Convenient filler"] },
    harms: { he: ["מעלה סוכר במהירות", "דל בסיבים"], en: ["Spikes blood sugar", "Low fiber"] },
    note: { he: "בריא יותר במנה קטנה עם חלבון וירקות.", en: "Healthier in a small portion with protein + veg." },
  },
  {
    id: "white-bread",
    name: { he: "לחם לבן", en: "White bread" },
    rating: 6,
    category: "grains",
    harms: {
      he: ["דל בסיבים", "מעלה סוכר במהירות", "תחושת רעב חוזרת"],
      en: ["Low fiber", "Quick blood-sugar spike", "Hunger returns fast"],
    },
  },
  {
    id: "whole-bread",
    name: { he: "לחם מחיטה מלאה", en: "Whole-wheat bread" },
    rating: 4,
    category: "grains",
    benefits: { he: ["סיבים", "B ויטמינים", "מגנזיום"], en: ["Fiber", "B vitamins", "Magnesium"] },
  },
  {
    id: "couscous",
    name: { he: "קוסקוס מבושל", en: "Couscous" },
    rating: 5,
    category: "grains",
    benefits: { he: ["מקור אנרגיה", "מהיר להכנה"], en: ["Energy source", "Quick to prepare"] },
    harms: { he: ["אינדקס גליקמי גבוה", "פחות סיבים"], en: ["High GI", "Less fiber"] },
  },
  {
    id: "lean-beef",
    name: { he: "בשר בקר רזה", en: "Lean beef" },
    rating: 5,
    category: "protein",
    benefits: { he: ["חלבון איכותי", "ברזל זמין", "B12", "אבץ"], en: ["Quality protein", "Heme iron", "B12", "Zinc"] },
    harms: { he: ["שומן רווי גבוה יחסית"], en: ["Relatively high saturated fat"] },
    note: { he: "1-2 פעמים בשבוע מאוזן.", en: "1-2 times a week is balanced." },
  },
  {
    id: "yellow-cheese",
    name: { he: "גבינה צהובה", en: "Yellow cheese" },
    rating: 6,
    category: "dairy",
    benefits: { he: ["סידן", "חלבון"], en: ["Calcium", "Protein"] },
    harms: { he: ["שומן רווי", "נתרן גבוה", "צפופה קלורית"], en: ["Saturated fat", "High sodium", "Calorie-dense"] },
  },
  {
    id: "feta-cheese",
    name: { he: "גבינת פטה", en: "Feta cheese" },
    rating: 5,
    category: "dairy",
    benefits: { he: ["חלבון", "סידן"], en: ["Protein", "Calcium"] },
    harms: { he: ["נתרן גבוה"], en: ["High sodium"] },
  },
  {
    id: "cream-cheese",
    name: { he: "גבינת שמנת", en: "Cream cheese" },
    rating: 6,
    category: "dairy",
    harms: { he: ["שומן רווי גבוה", "מעט חלבון"], en: ["High saturated fat", "Low protein"] },
  },
  {
    id: "homemade-pizza",
    name: { he: "פיצה ביתית", en: "Homemade pizza" },
    rating: 5,
    category: "fastFood",
    benefits: { he: ["שליטה במרכיבים", "אפשר להוסיף ירקות"], en: ["Control of ingredients", "Veg-friendly"] },
    harms: { he: ["עתירה בפחמימה", "קלוריות גבוהות"], en: ["Carb-heavy", "High calories"] },
  },
  {
    id: "quality-burger",
    name: { he: "המבורגר איכותי בבית", en: "Quality home burger" },
    rating: 6,
    category: "fastFood",
    benefits: { he: ["חלבון", "ברזל"], en: ["Protein", "Iron"] },
    harms: { he: ["שומן רווי", "קלוריות גבוהות"], en: ["Saturated fat", "High calories"] },
  },
  {
    id: "sushi",
    name: { he: "סושי (אבוקדו/סלמון)", en: "Sushi (avocado/salmon)" },
    rating: 4,
    category: "fastFood",
    benefits: { he: ["אומגה 3", "חלבון", "אצות עתירות יוד"], en: ["Omega-3", "Protein", "Iodine from nori"] },
    harms: { he: ["אורז לבן", "רטבים מתוקים"], en: ["White rice", "Sweet sauces"] },
  },
  {
    id: "popcorn-plain",
    name: { he: "פופקורן ללא מלח/חמאה", en: "Plain popcorn" },
    rating: 4,
    category: "snacks",
    benefits: { he: ["דגן מלא", "סיבים", "פחות קלורי"], en: ["Whole grain", "Fiber", "Lower calorie"] },
  },
  {
    id: "pita-with-falafel",
    name: { he: "פיתה עם פלאפל", en: "Pita with falafel" },
    rating: 6,
    category: "sandwiches",
    benefits: { he: ["חלבון צמחי", "סיבים מטחינה"], en: ["Plant protein", "Fiber from tahini"] },
    harms: { he: ["מטוגן עמוק", "פחמימה גבוהה"], en: ["Deep-fried", "High carbs"] },
  },
  {
    id: "cheese-sandwich",
    name: { he: "כריך גבינה צהובה ולחם לבן", en: "Yellow cheese sandwich on white bread" },
    rating: 6,
    category: "sandwiches",
    harms: { he: ["שומן רווי", "נתרן", "מעט חלבון יחסית"], en: ["Saturated fat", "High sodium", "Relatively low protein"] },
  },
  {
    id: "tuna-sandwich",
    name: { he: "כריך טונה ולחם מלא", en: "Tuna sandwich on whole-wheat" },
    rating: 4,
    category: "sandwiches",
    benefits: { he: ["חלבון", "אומגה 3", "סיבים מהלחם"], en: ["Protein", "Omega-3", "Fiber from bread"] },
    harms: { he: ["מיונז מוסיף שומן/קלוריות"], en: ["Mayo adds fat/calories"] },
  },
  {
    id: "salt-pretzels",
    name: { he: "בייגלה מלוח", en: "Salted pretzels" },
    rating: 6,
    category: "snacks",
    harms: { he: ["נתרן גבוה", "פחמימה ריקה"], en: ["High sodium", "Empty carbs"] },
  },
  {
    id: "natural-peanut-butter",
    name: { he: "חמאת בוטנים טבעית", en: "Natural peanut butter" },
    rating: 4,
    category: "fats",
    benefits: { he: ["חלבון", "שומן בריא", "מגנזיום"], en: ["Protein", "Healthy fat", "Magnesium"] },
    note: { he: "ללא סוכר ושמן מוסף.", en: "No added sugar or oil." },
  },
  {
    id: "ketchup",
    name: { he: "קטשופ", en: "Ketchup" },
    rating: 6,
    category: "sauces",
    harms: { he: ["סוכר מוסף", "נתרן"], en: ["Added sugar", "Sodium"] },
  },
  {
    id: "mayonnaise",
    name: { he: "מיונז רגיל", en: "Regular mayo" },
    rating: 7,
    category: "sauces",
    harms: { he: ["שומן גבוה", "קלוריות צפופות", "שמני זרעים מעובדים"], en: ["High fat", "Calorie-dense", "Refined seed oils"] },
  },
  {
    id: "natural-fruit-juice",
    name: { he: "מיץ פירות סחוט", en: "Fresh fruit juice" },
    rating: 5,
    category: "drinks",
    benefits: { he: ["ויטמינים", "אשלגן"], en: ["Vitamins", "Potassium"] },
    harms: { he: ["סוכר טבעי גבוה", "ללא סיבים"], en: ["High natural sugar", "No fiber"] },
  },

  // ========================= 7-10 :: LESS HEALTHY ===========================
  {
    id: "shawarma-pita",
    name: { he: "פיתה שווארמה", en: "Shawarma in pita" },
    rating: 7,
    category: "sandwiches",
    harms: { he: ["שומן רווי גבוה", "נתרן", "קלוריות גבוהות"], en: ["High saturated fat", "Sodium", "High calories"] },
    note: { he: "אם אוכלים — לבחור פיתה מלאה והרבה ירקות.", en: "If eating — pick whole-wheat pita and lots of veggies." },
  },
  {
    id: "fries",
    name: { he: "צ׳יפס מטוגן", en: "French fries" },
    rating: 8,
    category: "fastFood",
    harms: { he: ["שמן עמוק", "אקרילאמיד", "מעט ערך תזונתי"], en: ["Deep-fried oil", "Acrylamide", "Low nutrient value"] },
  },
  {
    id: "fast-food-burger",
    name: { he: "המבורגר רשת מהירה", en: "Fast-food burger" },
    rating: 8,
    category: "fastFood",
    harms: { he: ["שומן רווי", "נתרן גבוה", "תוספים מעובדים"], en: ["Saturated fat", "High sodium", "Processed additives"] },
  },
  {
    id: "frozen-pizza",
    name: { he: "פיצה קפואה / רשת", en: "Frozen / chain pizza" },
    rating: 8,
    category: "fastFood",
    harms: { he: ["נתרן גבוה", "שומן רווי", "תוספים"], en: ["High sodium", "Saturated fat", "Additives"] },
  },
  {
    id: "hot-dogs",
    name: { he: "נקניקיות", en: "Hot dogs" },
    rating: 9,
    category: "protein",
    harms: { he: ["בשר מעובד", "נתרן גבוה", "ניטריטים", "מסווג מקבוצה 1 לסרטן"], en: ["Processed meat", "High sodium", "Nitrites", "WHO group 1 carcinogen"] },
  },
  {
    id: "salami",
    name: { he: "סלמי / פסטרמה", en: "Salami / pastrami" },
    rating: 8,
    category: "protein",
    harms: { he: ["בשר מעובד", "נתרן גבוה", "שומן רווי"], en: ["Processed meat", "High sodium", "Saturated fat"] },
  },
  {
    id: "bourekas",
    name: { he: "בורקס", en: "Bourekas" },
    rating: 8,
    category: "bakery",
    harms: { he: ["מאפה עשיר בשומן", "מרגרינה", "קלוריות גבוהות"], en: ["Fat-rich pastry", "Margarine", "High calories"] },
  },
  {
    id: "croissant",
    name: { he: "קרואסון חמאה", en: "Butter croissant" },
    rating: 7,
    category: "bakery",
    harms: { he: ["חמאה רבה", "פחמימה לבנה", "מעט חלבון"], en: ["Lots of butter", "Refined carbs", "Low protein"] },
  },
  {
    id: "donuts",
    name: { he: "סופגניות / דונאטס", en: "Donuts" },
    rating: 9,
    category: "bakery",
    harms: { he: ["סוכר גבוה", "מטוגן עמוק", "שומן טראנס"], en: ["High sugar", "Deep-fried", "Trans fat"] },
  },
  {
    id: "muffins",
    name: { he: "מאפינס תעשייתי", en: "Store-bought muffins" },
    rating: 8,
    category: "bakery",
    harms: { he: ["סוכר מוסף", "קמח לבן", "מעט סיבים"], en: ["Added sugar", "White flour", "Low fiber"] },
  },
  {
    id: "waffers",
    name: { he: "ופלים", en: "Wafers" },
    rating: 9,
    category: "sweets",
    harms: { he: ["סוכר גבוה", "שומן רווי", "כמעט ללא ערך תזונתי"], en: ["High sugar", "Saturated fat", "Almost no nutrient value"] },
  },
  {
    id: "milk-chocolate",
    name: { he: "שוקולד חלב", en: "Milk chocolate" },
    rating: 7,
    category: "sweets",
    harms: { he: ["סוכר מוסף", "שומן רווי"], en: ["Added sugar", "Saturated fat"] },
  },
  {
    id: "ice-cream",
    name: { he: "גלידה ממותקת", en: "Sweetened ice cream" },
    rating: 7,
    category: "sweets",
    harms: { he: ["סוכר מוסף", "שומן רווי", "קלוריות צפופות"], en: ["Added sugar", "Saturated fat", "Calorie-dense"] },
  },
  {
    id: "gummy",
    name: { he: "סוכריות גומי", en: "Gummy candy" },
    rating: 9,
    category: "sweets",
    harms: { he: ["סוכר זוהר", "צבעי מאכל", "ללא ערך תזונתי"], en: ["Pure sugar", "Food dyes", "No nutrient value"] },
  },
  {
    id: "doritos",
    name: { he: "דוריטוס / צ׳יטוס", en: "Doritos / Cheetos" },
    rating: 8,
    category: "snacks",
    harms: { he: ["נתרן גבוה", "שמן זרעים מעובד", "תוספים"], en: ["High sodium", "Refined seed oil", "Additives"] },
  },
  {
    id: "potato-chips",
    name: { he: "חטיף תפוצ׳יפס", en: "Potato chips" },
    rating: 8,
    category: "snacks",
    harms: { he: ["שמן עמוק", "נתרן", "אקרילאמיד"], en: ["Deep-fried oil", "Sodium", "Acrylamide"] },
  },
  {
    id: "sweet-cornflakes",
    name: { he: "קורנפלקס ממותק", en: "Sweetened cornflakes" },
    rating: 7,
    category: "grains",
    harms: { he: ["סוכר מוסף", "אינדקס גליקמי גבוה"], en: ["Added sugar", "High GI"] },
  },
  {
    id: "fruit-yogurt",
    name: { he: "יוגורט עם פרי וסוכר", en: "Sweet fruit yogurt" },
    rating: 6,
    category: "dairy",
    harms: { he: ["סוכר מוסף גבוה", "מעט פרי אמיתי"], en: ["High added sugar", "Little real fruit"] },
    note: { he: "עדיף יוגורט טבעי + פרי טרי בעצמך.", en: "Better: plain yogurt + real fruit yourself." },
  },
  {
    id: "cola",
    name: { he: "קולה / משקה מוגז ממותק", en: "Cola / sugary soda" },
    rating: 9,
    category: "drinks",
    harms: { he: ["10 כפיות סוכר בפחית", "קלוריות ריקות", "פגיעה בשיניים"], en: ["10 tsp sugar per can", "Empty calories", "Tooth damage"] },
  },
  {
    id: "energy-xl",
    name: { he: "XL / משקה אנרגיה", en: "XL / energy drink" },
    rating: 10,
    category: "drinks",
    harms: { he: ["קפאין מאוד גבוה", "סוכר רב", "מעמיס על הלב והשינה"], en: ["Very high caffeine", "High sugar", "Stresses heart & sleep"] },
  },
  {
    id: "alcohol",
    name: { he: "אלכוהול", en: "Alcohol" },
    rating: 8,
    category: "drinks",
    harms: { he: ["קלוריות ריקות", "פוגע בכבד", "מפר שינה ושיקום"], en: ["Empty calories", "Liver damage", "Disrupts sleep & recovery"] },
  },
  {
    id: "diet-soda",
    name: { he: "משקה דיאט", en: "Diet soda" },
    rating: 6,
    category: "drinks",
    harms: { he: ["ממתיקים מלאכותיים", "ייתכנו השפעות על המעי"], en: ["Artificial sweeteners", "Possible gut effects"] },
    note: { he: "אפס קלוריות, אבל לא תחליף למים.", en: "Zero calories, but no replacement for water." },
  },
  {
    id: "instant-noodles",
    name: { he: "נודלס אינסטנט", en: "Instant noodles" },
    rating: 8,
    category: "fastFood",
    harms: { he: ["נתרן מאוד גבוה", "תוספים", "פחמימה ריקה"], en: ["Very high sodium", "Additives", "Empty carbs"] },
  },
  {
    id: "margarine",
    name: { he: "מרגרינה", en: "Margarine" },
    rating: 8,
    category: "fats",
    harms: { he: ["שמני זרעים מעובדים", "ייתכנו שומני טראנס"], en: ["Refined seed oils", "May contain trans fats"] },
  },
  {
    id: "sweet-bbq-sauce",
    name: { he: "רוטב BBQ מתוק", en: "Sweet BBQ sauce" },
    rating: 7,
    category: "sauces",
    harms: { he: ["סוכר גבוה", "נתרן"], en: ["High sugar", "Sodium"] },
  },
  {
    id: "sweet-soy-sauce",
    name: { he: "רוטב סויה מתוק", en: "Sweet soy sauce" },
    rating: 7,
    category: "sauces",
    harms: { he: ["נתרן מאוד גבוה", "סוכר"], en: ["Very high sodium", "Sugar"] },
  },
  {
    id: "bamba",
    name: { he: "במבה", en: "Bamba" },
    rating: 6,
    category: "snacks",
    benefits: { he: ["חמאת בוטנים — חלבון מסוים"], en: ["Some peanut protein"] },
    harms: { he: ["שמן צמחי", "נתרן"], en: ["Vegetable oil", "Sodium"] },
  },
];

export const GUIDE_CATEGORIES: GuideCategory[] = [
  "grains",
  "protein",
  "dairy",
  "produce",
  "fats",
  "drinks",
  "sweets",
  "fastFood",
  "snacks",
  "bakery",
  "sandwiches",
  "sauces",
];
