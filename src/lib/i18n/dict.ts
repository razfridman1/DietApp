// Translations for the "Health" tab and the language toggle.
// The original app keeps using T from "@/lib/constants" (Hebrew).
// All NEW health-tab strings live here so they can be toggled HE / EN at runtime.

export type Lang = "he" | "en";

export interface HealthDict {
  // Tab + nav
  health: string;
  healthSubtitle: string;
  langToggleAriaHe: string;
  langToggleAriaEn: string;

  tabs: {
    foodRating: string;
    bodyNeeds: string;
    dailyIntake: string;
    weeklyLists: string;
    notes: string;
    aiAssistant: string;
    healthyVsUnhealthy: string;
    foods: string;
  };

  // Common
  common: {
    save: string;
    saving: string;
    saved: string;
    cancel: string;
    delete: string;
    edit: string;
    duplicate: string;
    add: string;
    close: string;
    search: string;
    loading: string;
    refresh: string;
    error: string;
    retry: string;
    yes: string;
    no: string;
    confirmDelete: string;
    none: string;
    optional: string;
    required: string;
    note: string;
    notes: string;
    color: string;
    category: string;
    tag: string;
    tags: string;
    grams: string;
    ml: string;
    kcal: string;
    minutes: string;
    today: string;
    week: string;
    months: string;
    you: string;
    ai: string;
    placeholderEmpty: string;
  };

  // Food rating tab
  foodRating: {
    title: string;
    subtitle: string;
    placeholder: string;
    examples: string;
    analyze: string;
    analyzing: string;
    grams: string;
    gramsHelper: string;
    ratingLabel: string;
    ratingHealthy: string;
    ratingMedium: string;
    ratingUnhealthy: string;
    overview: string;
    pros: string;
    cons: string;
    effects: string;
    nutrition: string;
    protein: string;
    carbs: string;
    fats: string;
    sugar: string;
    fiber: string;
    calories: string;
    frequency: string;
    freqDaily: string;
    freqWeekly: string;
    freqRare: string;
    freqAvoid: string;
    alternatives: string;
    quantityNote: string;
    quantityHint: string;
    impactOnLabel: {
      heart: string;
      muscles: string;
      energy: string;
      skin: string;
      brain: string;
      satiety: string;
      bloodSugar: string;
    };
    /** 5-level visual labels for impact intensity (per impact area, value 1-5) */
    impactLevels: {
      excellent: string;
      good: string;
      neutral: string;
      bad: string;
      veryBad: string;
    };
    /** 6-tier verdict derived from the 1-10 rating */
    severityLabels: {
      veryHealthy: string;
      healthy: string;
      moderate: string;
      harmful: string;
      veryHarmful: string;
      doNotConsume: string;
    };
    addToList: string;
    addedToList: string;
    addToHealthy: string;
    addToUnhealthy: string;
    examplesList: string[];
    history: string;
    historyEmpty: string;
    repeat: string;
  };

  // Body needs tab
  bodyNeeds: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    role: string;
    dailyAmount: string;
    deficiency: string;
    excess: string;
    sources: string;
    howMuch: string;
    audience: {
      child: string;
      teen: string;
      adult: string;
      athlete: string;
    };
    categories: {
      vitamins: string;
      minerals: string;
      antioxidants: string;
      protein: string;
      omega3: string;
      fiber: string;
      water: string;
      electrolytes: string;
      probiotics: string;
      goodFats: string;
    };
  };

  // Daily intake tab
  daily: {
    title: string;
    subtitle: string;
    addItem: string;
    name: string;
    namePlaceholder: string;
    type: string;
    typeFood: string;
    typeDrink: string;
    qty: string;
    qtyHint: string;
    time: string;
    note: string;
    save: string;
    items: string;
    noItems: string;
    score: string;
    scoreLabel: string;
    aiAnalysis: string;
    aiAnalyzing: string;
    suggestions: string;
    chartsTitle: string;
    sugar: string;
    protein: string;
    water: string;
    calories: string;
    fiber: string;
    omega3: string;
    statusExcellent: string;
    statusBalanced: string;
    statusNeedsWork: string;
    refreshAnalysis: string;
    duplicate: string;
  };

  // Weekly lists tab
  lists: {
    title: string;
    subtitle: string;
    create: string;
    newList: string;
    listName: string;
    listType: string;
    types: {
      shopping: string;
      weekly: string;
      mealPrep: string;
      recommended: string;
      avoid: string;
    };
    addItemPlaceholder: string;
    aiGenerate: string;
    aiGenerating: string;
    aiHint: string;
    presets: {
      cut: string;
      muscle: string;
      general: string;
      teens: string;
      family: string;
      energy: string;
      brain: string;
      sleep: string;
    };
    quantity: string;
    why: string;
    rating: string;
    empty: string;
    deleteList: string;
    duplicateList: string;
    renameList: string;
  };

  // Notes tab
  notes: {
    title: string;
    subtitle: string;
    add: string;
    placeholder: string;
    mood: string;
    moodOptions: {
      great: string;
      good: string;
      ok: string;
      tired: string;
      bad: string;
    };
    tagsPlaceholder: string;
    findPatterns: string;
    finding: string;
    patternsTitle: string;
    noPatterns: string;
    foodMention: string;
    rateFood: string;
    empty: string;
    examples: string;
    exampleNotes: string[];
  };

  // Healthy / Unhealthy guide
  guide: {
    title: string;
    subtitle: string;
    healthy: string;
    unhealthy: string;
    moderate: string;
    benefits: string;
    harms: string;
    notes: string;
    searchPlaceholder: string;
    categoryAll: string;
    categories: {
      grains: string;
      protein: string;
      dairy: string;
      produce: string;
      fats: string;
      drinks: string;
      sweets: string;
      fastFood: string;
      snacks: string;
      bakery: string;
      sandwiches: string;
      sauces: string;
    };
    addToList: string;
  };

  // AI Assistant
  assistant: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    thinking: string;
    examples: string;
    exampleQuestions: string[];
    welcome: string;
    clear: string;
    you: string;
    ai: string;
  };
}

const he: HealthDict = {
  health: "בריאות",
  healthSubtitle: "מערכת תזונה חכמה עם AI",
  langToggleAriaHe: "מעבר לאנגלית",
  langToggleAriaEn: "Switch to Hebrew",

  tabs: {
    foodRating: "דירוג מאכלים",
    bodyNeeds: "מה הגוף צריך",
    dailyIntake: "צריכה יומית",
    weeklyLists: "רשימות שבועיות",
    notes: "הערות ומעקב",
    aiAssistant: "AI עוזר תזונה",
    healthyVsUnhealthy: "בריא / לא בריא",
    foods: "מאכלים",
  },

  common: {
    save: "שמירה",
    saving: "שומר...",
    saved: "נשמר",
    cancel: "ביטול",
    delete: "מחיקה",
    edit: "עריכה",
    duplicate: "שכפול",
    add: "הוספה",
    close: "סגירה",
    search: "חיפוש",
    loading: "טוען...",
    refresh: "רענון",
    error: "שגיאה. נסה/י שוב.",
    retry: "ניסיון חוזר",
    yes: "כן",
    no: "לא",
    confirmDelete: "למחוק את הפריט?",
    none: "—",
    optional: "אופציונלי",
    required: "חובה",
    note: "הערה",
    notes: "הערות",
    color: "צבע",
    category: "קטגוריה",
    tag: "תגית",
    tags: "תגיות",
    grams: "גרם",
    ml: 'מ"ל',
    kcal: 'קק"ל',
    minutes: "דקות",
    today: "היום",
    week: "שבוע",
    months: "חודשים",
    you: "אני",
    ai: "AI",
    placeholderEmpty: "אין נתונים עדיין.",
  },

  foodRating: {
    title: "דירוג מאכלים",
    subtitle: "בדוק/י כל מאכל וקבל/י ניתוח עומק עם AI",
    placeholder: "בדוק מאכל — למשל פיצה, ביצים, קולה...",
    examples: "דוגמאות",
    analyze: "בדוק/י",
    analyzing: "מנתח...",
    grams: "כמות (גרם)",
    gramsHelper: 'אופציונלי — יחושב ניתוח לפי הכמות שאכלת',
    ratingLabel: "דירוג בריאות",
    ratingHealthy: "בריא",
    ratingMedium: "בינוני",
    ratingUnhealthy: "פחות בריא",
    overview: "הסבר מפורט",
    pros: "יתרונות",
    cons: "חסרונות",
    effects: "השפעה על הגוף",
    nutrition: "פירוק תזונתי",
    protein: "חלבון",
    carbs: "פחמימות",
    fats: "שומן",
    sugar: "סוכר",
    fiber: "סיבים",
    calories: "קלוריות",
    frequency: "תדירות מומלצת",
    freqDaily: "מומלץ יומי",
    freqWeekly: "כמה פעמים בשבוע",
    freqRare: "לעיתים רחוקות",
    freqAvoid: "להימנע",
    alternatives: "חלופות בריאות יותר",
    quantityNote: "ניתוח כמות",
    quantityHint: 'לדוגמה: "כמה זה גרוע אם אכלתי 200 גרם?"',
    impactOnLabel: {
      heart: "לב",
      muscles: "שרירים",
      energy: "אנרגיה",
      skin: "עור",
      brain: "מוח",
      satiety: "שובע",
      bloodSugar: "סוכר בדם",
    },
    impactLevels: {
      excellent: "מצוין",
      good: "טוב",
      neutral: "נייטרלי",
      bad: "רע",
      veryBad: "רע מאוד",
    },
    severityLabels: {
      veryHealthy: "בריא מאד",
      healthy: "בריא",
      moderate: "בינוני",
      harmful: "פחות בריא",
      veryHarmful: "מזיק",
      doNotConsume: "לא לצרוך",
    },
    addToList: "הוסף/י לרשימה",
    addedToList: "נוסף לרשימה",
    addToHealthy: "הוסף לרשימת בריאים",
    addToUnhealthy: "הוסף לרשימת לא בריאים",
    examplesList: [
      "פיצה",
      "קולה",
      "ביצים",
      "ברוקולי",
      "במבה",
      "קורנפלקס",
      "סושי",
      "שווארמה",
      "סלמון",
      "שוקולד מריר",
    ],
    history: "היסטוריית בדיקות",
    historyEmpty: "אין בדיקות שמורות.",
    repeat: "בדיקה חוזרת",
  },

  bodyNeeds: {
    title: "מה הגוף צריך",
    subtitle: "מדריך מקיף לרכיבי תזונה חיוניים",
    searchPlaceholder: "חיפוש רכיב...",
    role: "תפקיד בגוף",
    dailyAmount: "כמות יומית מומלצת",
    deficiency: "מה קורה במחסור",
    excess: "מה קורה בעודף",
    sources: "מקורות תזונתיים",
    howMuch: "כמה צריך לאכול",
    audience: {
      child: "ילד",
      teen: "נער/ה",
      adult: "מבוגר",
      athlete: "מתאמן",
    },
    categories: {
      vitamins: "ויטמינים",
      minerals: "מינרלים",
      antioxidants: "נוגדי חמצון",
      protein: "חלבון",
      omega3: "אומגה 3",
      fiber: "סיבים תזונתיים",
      water: "מים",
      electrolytes: "אלקטרוליטים",
      probiotics: "פרוביוטיקה",
      goodFats: "שומנים בריאים",
    },
  },

  daily: {
    title: "צריכה יומית",
    subtitle: "מעקב חכם אחרי כל מה שאוכלים ושותים היום",
    addItem: "הוספה",
    name: "שם",
    namePlaceholder: 'למשל: סלט עם טונה',
    type: "סוג",
    typeFood: "מאכל",
    typeDrink: "שתייה",
    qty: "כמות",
    qtyHint: "גרם או מ״ל",
    time: "שעה",
    note: "הערה",
    save: "שמירה",
    items: "פריטים",
    noItems: "עוד לא הוספת היום פריטים. התחל/י עכשיו!",
    score: "ציון היום",
    scoreLabel: "1 = מצוין | 10 = צריך שיפור",
    aiAnalysis: "ניתוח AI",
    aiAnalyzing: "מנתח את היום שלך...",
    suggestions: "הצעות לשיפור",
    chartsTitle: "מאזן יומי",
    sugar: "סוכר",
    protein: "חלבון",
    water: "מים",
    calories: "קלוריות",
    fiber: "סיבים",
    omega3: "אומגה 3",
    statusExcellent: "יום מצוין",
    statusBalanced: "מאוזן",
    statusNeedsWork: "צריך שיפור",
    refreshAnalysis: "רענון ניתוח",
    duplicate: "שכפול",
  },

  lists: {
    title: "רשימות שבועיות",
    subtitle: "רשימות קניות, Meal Prep ועוד — ידני או עם AI",
    create: "רשימה חדשה",
    newList: "רשימה חדשה",
    listName: "שם הרשימה",
    listType: "סוג",
    types: {
      shopping: "רשימת קניות",
      weekly: "תפריט שבועי",
      mealPrep: "Meal Prep",
      recommended: "מומלץ לאכול",
      avoid: "להפחית",
    },
    addItemPlaceholder: "הוספת פריט...",
    aiGenerate: "צור עם AI",
    aiGenerating: "יוצר...",
    aiHint: "בחר/י מטרה — וה־AI יבנה רשימה מלאה",
    presets: {
      cut: "חיטוב",
      muscle: "בניית שריר",
      general: "בריאות כללית",
      teens: "נוער",
      family: "משפחה",
      energy: "אנרגיה",
      brain: "בריאות המוח",
      sleep: "שיפור שינה",
    },
    quantity: "כמות",
    why: "למה כדאי / לא כדאי",
    rating: "דירוג",
    empty: "אין רשימות עדיין. צור/י את הראשונה!",
    deleteList: "מחיקת רשימה",
    duplicateList: "שכפול רשימה",
    renameList: "שינוי שם",
  },

  notes: {
    title: "הערות ומעקב",
    subtitle: "תיעוד חופשי + זיהוי דפוסים עם AI",
    add: "הוספת הערה",
    placeholder: "כתוב/י כאן... למשל הרגשתי עייף אחרי...",
    mood: "מצב רוח",
    moodOptions: {
      great: "מעולה",
      good: "טוב",
      ok: "סביר",
      tired: "עייף/ה",
      bad: "רע",
    },
    tagsPlaceholder: "תגיות, מופרדות בפסיק",
    findPatterns: "ניתוח דפוסים",
    finding: "מנתח דפוסים...",
    patternsTitle: "דפוסים שזוהו",
    noPatterns: "אין מספיק נתונים — הוסף/י עוד הערות.",
    foodMention: "מאכל מוזכר",
    rateFood: "דרג/י את המאכל",
    empty: "אין הערות עדיין.",
    examples: "דוגמאות",
    exampleNotes: [
      "הרגשתי עייף אחרי XL",
      "יותר אנרגיה כשאכלתי חלבון בבוקר",
      "ישנתי טוב יותר אחרי יום בלי קפאין",
      "כאב ראש אחרי ארוחה כבדה",
    ],
  },

  guide: {
    title: "בריא / לא בריא",
    subtitle: "מאכלים נפוצים מסודרים לפי דירוג בריאותי, עם מה שהם נותנים או מזיקים",
    healthy: "בריא מאוד",
    unhealthy: "פחות בריא",
    moderate: "בינוני",
    benefits: "מה זה נותן",
    harms: "במה זה מזיק",
    notes: "הערות",
    searchPlaceholder: "חפש מאכל...",
    categoryAll: "הכל",
    categories: {
      grains: "דגנים ופחמימות",
      protein: "חלבון",
      dairy: "מוצרי חלב",
      produce: "ירקות ופירות",
      fats: "שומנים ואגוזים",
      drinks: "משקאות",
      sweets: "ממתקים וקינוחים",
      fastFood: "אוכל מהיר",
      snacks: "חטיפים",
      bakery: "מאפים",
      sandwiches: "סנדוויצ׳ים וכריכים",
      sauces: "רטבים וממרחים",
    },
    addToList: "הוסף לרשימה",
  },

  assistant: {
    title: "AI עוזר תזונה",
    subtitle: "שאל/י כל שאלה על תזונה, ויטמינים, כמויות וחלופות",
    placeholder: "שאל/י משהו...",
    send: "שלח",
    thinking: "חושב...",
    examples: "שאלות לדוגמה",
    exampleQuestions: [
      "כמה גרוע XL?",
      "כמה חלבון אני צריך?",
      "מה יותר בריא — פיצה או המבורגר?",
      "מה חסר לי אם אני עייף?",
      "האם אכלתי מספיק היום?",
      "מה המאכלים הכי בריאים בעולם?",
      "כמה סוכר זה יותר מדי ביום?",
      "מה עדיף לאכול אחרי אימון?",
    ],
    welcome:
      "שלום! אני העוזר התזונתי שלך. אפשר לשאול אותי על כל מאכל, ויטמין, כמות, חלופה בריאה או תפריט. במה אעזור?",
    clear: "ניקוי שיחה",
    you: "אני",
    ai: "AI",
  },
};

const en: HealthDict = {
  health: "Health",
  healthSubtitle: "AI-powered nutrition system",
  langToggleAriaHe: "Switch to English",
  langToggleAriaEn: "Switch to Hebrew",

  tabs: {
    foodRating: "Food Rating",
    bodyNeeds: "Body Needs",
    dailyIntake: "Daily Intake",
    weeklyLists: "Weekly Lists",
    notes: "Notes & Tracking",
    aiAssistant: "AI Nutrition Assistant",
    healthyVsUnhealthy: "Healthy / Unhealthy",
    foods: "Foods",
  },

  common: {
    save: "Save",
    saving: "Saving...",
    saved: "Saved",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    duplicate: "Duplicate",
    add: "Add",
    close: "Close",
    search: "Search",
    loading: "Loading...",
    refresh: "Refresh",
    error: "Something went wrong. Try again.",
    retry: "Retry",
    yes: "Yes",
    no: "No",
    confirmDelete: "Delete this item?",
    none: "—",
    optional: "optional",
    required: "required",
    note: "Note",
    notes: "Notes",
    color: "Color",
    category: "Category",
    tag: "Tag",
    tags: "Tags",
    grams: "g",
    ml: "ml",
    kcal: "kcal",
    minutes: "min",
    today: "Today",
    week: "Week",
    months: "Months",
    you: "You",
    ai: "AI",
    placeholderEmpty: "Nothing here yet.",
  },

  foodRating: {
    title: "Food Rating",
    subtitle: "Check any food and get AI-powered analysis",
    placeholder: "Check a food — e.g. pizza, eggs, cola...",
    examples: "Examples",
    analyze: "Analyze",
    analyzing: "Analyzing...",
    grams: "Amount (grams)",
    gramsHelper: "Optional — analysis will be tailored to the amount you ate",
    ratingLabel: "Health rating",
    ratingHealthy: "Healthy",
    ratingMedium: "Moderate",
    ratingUnhealthy: "Less healthy",
    overview: "Detailed explanation",
    pros: "Pros",
    cons: "Cons",
    effects: "Impact on your body",
    nutrition: "Nutritional breakdown",
    protein: "Protein",
    carbs: "Carbs",
    fats: "Fats",
    sugar: "Sugar",
    fiber: "Fiber",
    calories: "Calories",
    frequency: "Recommended frequency",
    freqDaily: "Daily",
    freqWeekly: "A few times per week",
    freqRare: "Occasional",
    freqAvoid: "Avoid",
    alternatives: "Healthier alternatives",
    quantityNote: "Quantity analysis",
    quantityHint: 'For example: "How bad is it if I ate 200g?"',
    impactOnLabel: {
      heart: "Heart",
      muscles: "Muscles",
      energy: "Energy",
      skin: "Skin",
      brain: "Brain",
      satiety: "Satiety",
      bloodSugar: "Blood sugar",
    },
    impactLevels: {
      excellent: "Excellent",
      good: "Good",
      neutral: "Neutral",
      bad: "Bad",
      veryBad: "Very bad",
    },
    severityLabels: {
      veryHealthy: "Very healthy",
      healthy: "Healthy",
      moderate: "Moderate",
      harmful: "Less healthy",
      veryHarmful: "Harmful",
      doNotConsume: "Do not consume",
    },
    addToList: "Add to list",
    addedToList: "Added",
    addToHealthy: "Add to healthy list",
    addToUnhealthy: "Add to unhealthy list",
    examplesList: [
      "Pizza",
      "Cola",
      "Eggs",
      "Broccoli",
      "Bamba",
      "Cornflakes",
      "Sushi",
      "Shawarma",
      "Salmon",
      "Dark chocolate",
    ],
    history: "Search history",
    historyEmpty: "No saved checks.",
    repeat: "Re-check",
  },

  bodyNeeds: {
    title: "What Your Body Needs",
    subtitle: "Comprehensive guide to essential nutrients",
    searchPlaceholder: "Search nutrient...",
    role: "Role in the body",
    dailyAmount: "Recommended daily amount",
    deficiency: "What happens in deficiency",
    excess: "What happens in excess",
    sources: "Food sources",
    howMuch: "How much to eat",
    audience: {
      child: "Child",
      teen: "Teen",
      adult: "Adult",
      athlete: "Athlete",
    },
    categories: {
      vitamins: "Vitamins",
      minerals: "Minerals",
      antioxidants: "Antioxidants",
      protein: "Protein",
      omega3: "Omega-3",
      fiber: "Fiber",
      water: "Water",
      electrolytes: "Electrolytes",
      probiotics: "Probiotics",
      goodFats: "Healthy fats",
    },
  },

  daily: {
    title: "Daily Intake",
    subtitle: "Smart tracking of everything you eat and drink",
    addItem: "Add",
    name: "Name",
    namePlaceholder: "e.g. tuna salad",
    type: "Type",
    typeFood: "Food",
    typeDrink: "Drink",
    qty: "Amount",
    qtyHint: "grams or ml",
    time: "Time",
    note: "Note",
    save: "Save",
    items: "Items",
    noItems: "No items today yet. Start now!",
    score: "Today's score",
    scoreLabel: "1 = excellent | 10 = needs work",
    aiAnalysis: "AI analysis",
    aiAnalyzing: "Analyzing your day...",
    suggestions: "Improvement suggestions",
    chartsTitle: "Daily balance",
    sugar: "Sugar",
    protein: "Protein",
    water: "Water",
    calories: "Calories",
    fiber: "Fiber",
    omega3: "Omega-3",
    statusExcellent: "Excellent day",
    statusBalanced: "Balanced",
    statusNeedsWork: "Needs work",
    refreshAnalysis: "Refresh analysis",
    duplicate: "Duplicate",
  },

  lists: {
    title: "Weekly Lists",
    subtitle: "Shopping lists, meal prep and more — manual or AI",
    create: "New list",
    newList: "New list",
    listName: "List name",
    listType: "Type",
    types: {
      shopping: "Shopping list",
      weekly: "Weekly meals",
      mealPrep: "Meal prep",
      recommended: "Eat more of",
      avoid: "Reduce",
    },
    addItemPlaceholder: "Add an item...",
    aiGenerate: "Generate with AI",
    aiGenerating: "Generating...",
    aiHint: "Pick a goal — AI will build a full list",
    presets: {
      cut: "Cutting",
      muscle: "Muscle building",
      general: "General health",
      teens: "Teens",
      family: "Family",
      energy: "Energy",
      brain: "Brain health",
      sleep: "Better sleep",
    },
    quantity: "Quantity",
    why: "Why / why not",
    rating: "Rating",
    empty: "No lists yet. Create your first!",
    deleteList: "Delete list",
    duplicateList: "Duplicate list",
    renameList: "Rename",
  },

  notes: {
    title: "Notes & Tracking",
    subtitle: "Free-form notes + AI pattern detection",
    add: "Add note",
    placeholder: "Write here... e.g. felt tired after...",
    mood: "Mood",
    moodOptions: {
      great: "Great",
      good: "Good",
      ok: "OK",
      tired: "Tired",
      bad: "Bad",
    },
    tagsPlaceholder: "Tags, comma separated",
    findPatterns: "Find patterns",
    finding: "Finding patterns...",
    patternsTitle: "Patterns detected",
    noPatterns: "Not enough data yet — add more notes.",
    foodMention: "Food mentioned",
    rateFood: "Rate this food",
    empty: "No notes yet.",
    examples: "Examples",
    exampleNotes: [
      "Felt tired after XL",
      "More energy when I ate protein in the morning",
      "Slept better after a day without caffeine",
      "Headache after a heavy meal",
    ],
  },

  guide: {
    title: "Healthy / Unhealthy",
    subtitle: "Common foods sorted by health rating, with what they give or harm",
    healthy: "Very healthy",
    unhealthy: "Less healthy",
    moderate: "Moderate",
    benefits: "What it gives",
    harms: "What it harms",
    notes: "Notes",
    searchPlaceholder: "Search a food...",
    categoryAll: "All",
    categories: {
      grains: "Grains & Carbs",
      protein: "Protein",
      dairy: "Dairy",
      produce: "Produce",
      fats: "Fats & Nuts",
      drinks: "Drinks",
      sweets: "Sweets & Desserts",
      fastFood: "Fast Food",
      snacks: "Snacks",
      bakery: "Bakery",
      sandwiches: "Sandwiches & Wraps",
      sauces: "Sauces & Spreads",
    },
    addToList: "Add to list",
  },

  assistant: {
    title: "AI Nutrition Assistant",
    subtitle: "Ask anything about nutrition, vitamins, quantities, alternatives",
    placeholder: "Ask something...",
    send: "Send",
    thinking: "Thinking...",
    examples: "Example questions",
    exampleQuestions: [
      "How bad is XL?",
      "How much protein do I need?",
      "Pizza or burger — which is healthier?",
      "What might I be missing if I'm tired?",
      "Did I eat enough today?",
      "What are the healthiest foods in the world?",
      "How much sugar per day is too much?",
      "What's best to eat after a workout?",
    ],
    welcome:
      "Hi! I'm your nutrition assistant. Ask me about any food, vitamin, portion, healthier alternative or meal plan. How can I help?",
    clear: "Clear chat",
    you: "You",
    ai: "AI",
  },
};

export const DICT: Record<Lang, HealthDict> = { he, en };
