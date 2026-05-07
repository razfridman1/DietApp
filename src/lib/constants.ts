// Hebrew strings — central location so the entire app stays in Hebrew.
export const T = {
  app: "תזונה וכושר AI",
  // Nav
  nav: {
    today: "היום",
    weekly: "שבועי",
    monthly: "חודשי",
    insights: "אנליטיקה",
    goal: "יעד",
    mealIdeas: "רעיונות",
    profile: "פרופיל",
    logout: "התנתקות",
  },
  // Auth
  auth: {
    signIn: "כניסה",
    signUp: "הרשמה",
    email: "אימייל",
    password: "סיסמה",
    name: "שם",
    haveAccount: "כבר יש לך חשבון?",
    noAccount: "אין לך חשבון?",
    signInCta: "התחבר",
    signUpCta: "הירשם",
    welcome: "ברוכים הבאים",
    welcomeBack: "ברוכים השבים",
  },
  // Dashboard
  dash: {
    title: "המסך הראשי",
    helloUser: "שלום",
    calorieBalance: "מאזן קלורי יומי",
    caloriesIn: "קלוריות נכנסו",
    caloriesOut: "קלוריות נשרפו",
    netCalories: "מאזן נטו",
    caloriesToGoal: "קלוריות ליעד",
    caloriesToTdee: "קלוריות TDEE",
    remaining: "נותר",
    over: "חריגה",
    proteinIntake: "צריכת חלבון",
    proteinTarget: "יעד חלבון",
    weightForecast: "תחזית שינוי משקל",
    todayTarget: "יעד יומי",
    quickActions: "פעולות מהירות",
    addMeal: "הוספת מזון / שתייה",
    addActivity: "הוספת פעילות",
    editMeal: "עריכת מזון",
    editActivity: "עריכת פעילות",
    editDay: "עריכת יום",
    clearDay: "מחיקת נתוני היום",
    mealsLog: "יומן תזונה",
    activitiesLog: "פעילות גופנית",
    noMeals: "לא נרשמו ארוחות היום",
    noActivities: "לא נרשמו פעילויות היום",
    of: "מתוך",
    grams: "גרם",
    kcal: "קק״ל",
    protein: "חלבון",
    carbs: "פחמימות",
    fats: "שומנים",
    minutes: "דקות",
    intensity: "עצימות",
    delete: "מחיקה",
    edit: "עריכה",
    save: "שמירה",
    cancel: "ביטול",
    confirm: "אישור",
  },
  // AI parsing
  ai: {
    parseMealHint: 'תאר/י מה אכלת בשפה חופשית. למשל: "לחמנייה עם חביתה משתי ביצים וקפה עם חלב"',
    parseActivityHint: 'תאר/י את הפעילות. למשל: "ריצה 30 דקות בקצב בינוני"',
    parsing: "מנתח עם AI...",
    parseFailed: "ניתוח נכשל. נסה/י לתאר אחרת או הזין/י ידנית",
    detected: "זוהה",
    manual: "הזנה ידנית",
  },
  // Intensities & types
  intensity: {
    low: "נמוכה",
    moderate: "בינונית",
    high: "גבוהה",
  },
  activityType: {
    walk: "הליכה",
    run: "ריצה",
    gym: "אימון כוח",
    swim: "שחייה",
    cycle: "אופניים",
    yoga: "יוגה",
    other: "אחר",
  },
  // Weekly/Monthly
  analytics: {
    weeklyTitle: "סקירה שבועית",
    monthlyTitle: "סקירה חודשית",
    avgCalories: "ממוצע קלוריות",
    avgProtein: "ממוצע חלבון",
    avgNet: "ממוצע מאזן",
    consistency: "עקביות",
    weightTrend: "מגמת משקל",
    anomalies: "ימים חריגים",
    noAnomalies: "אין ימים חריגים. עבודה מצוינת!",
    days7: "7 ימים אחרונים",
    days30: "30 ימים אחרונים",
  },
  insights: {
    title: "אנליטיקה חכמה",
    subtitle: "המלצות מותאמות אישית לפי ההתנהגות שלך",
    refreshing: "מנתח מחדש...",
    refresh: "רענון תובנות",
    noInsights: "אין מספיק נתונים לתובנות. הזין/י עוד ארוחות ופעילויות.",
    cat: {
      diet: "תזונה",
      training: "אימונים",
      behavior: "התנהגות",
      goal: "יעד",
    },
  },
  // Goal
  goal: {
    title: "יעד אישי",
    subtitle: "בחר/י את היעד הנוכחי שלך",
    cut: "ירידה במשקל",
    bulk: "עלייה במסה",
    maintain: "שמירה",
    cutDesc: "גירעון קלורי יומי לירידה הדרגתית",
    bulkDesc: "עודף קלורי מבוקר לבניית מסת שריר",
    maintainDesc: "איזון קלורי לשמירה על המשקל",
    targetWeight: "משקל יעד (ק״ג)",
    weeklyGoalKg: "שינוי שבועי צפוי",
    deficit: "גירעון יומי",
    surplus: "עודף יומי",
    eta: "הערכת זמן ליעד",
    proteinPerKg: "חלבון לק״ג משקל גוף",
    save: "שמירת יעד",
    saved: "היעד עודכן",
    weeks: "שבועות",
    months: "חודשים",
    days: "ימים",
    projection: "תחזית התקדמות",
    over: "חריגה היום",
    under: "מתחת ליעד",
    onTrack: "במסלול",
    pace: "קצב",
    paceSlow: "איטי",
    paceMedium: "ממוצע",
    paceFast: "מהיר",
    paceSlowDesc: "שינוי מתון, קל לשמירה לאורך זמן",
    paceMediumDesc: "האיזון המומלץ — תוצאות יציבות",
    paceFastDesc: "קצב מהיר, דורש משמעת גבוהה",
  },
  // Profile
  profile: {
    title: "פרופיל",
    height: "גובה (ס״מ)",
    weight: "משקל (ק״ג)",
    gender: "מין",
    male: "זכר",
    female: "נקבה",
    other: "אחר",
    activityLevel: "רמת פעילות בסיסית",
    sedentary: "יושבני",
    light: "קלה",
    moderate: "בינונית",
    active: "פעילה",
    very_active: "פעילה מאוד",
    save: "שמירה",
    saved: "נשמר",
    birthYear: "שנת לידה",
    weightToday: "משקל נוכחי היום",
    addWeight: "הוספת מדידה",
  },
  // Day detail (drill-down from weekly/monthly chart)
  dayDetail: {
    title: "פירוט יום",
    back: "חזרה",
    noData: "לא נרשמו נתונים ביום זה",
    summary: "סיכום היום",
    hadActivity: "כללה פעילות גופנית",
    noActivity: "ללא פעילות גופנית",
  },
  // AI Meal Ideas tab
  mealIdeas: {
    title: "רעיונות לארוחות",
    subtitle: "קבל/י 10 רעיונות מותאמים מ-AI שכולם מתחת למגבלת הקלוריות שלך",
    limitLabel: "מגבלת קלוריות מקסימלית למנה",
    limitPlaceholder: "למשל 500",
    generate: "הצע/י רעיונות",
    generating: "מחולל רעיונות...",
    error: "שגיאה ביצירת רעיונות. נסה/י שוב",
    empty: "הזן/י מגבלת קלוריות כדי לקבל 10 רעיונות לארוחות",
    underLimit: "מתחת למגבלה",
    ingredients: "מרכיבים עיקריים",
    regenerate: "רענון",
    invalidLimit: "אנא הזן/י מגבלת קלוריות תקינה",
  },
  errors: {
    generic: "שגיאה. נסה/י שוב",
    auth: "אימייל או סיסמה לא נכונים",
    missing: "יש למלא את כל השדות",
  },
} as const;

export const ACTIVITY_LEVELS = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
] as const;

export const ACTIVITY_LEVEL_MULT: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Daily kcal delta for each (goal, pace) combination.
export const GOAL_PACE_DELTA: Record<string, Record<string, number>> = {
  cut:      { slow: -250, medium: -500, fast: -750 },
  bulk:     { slow:  200, medium:  350, fast:  500 },
  maintain: { slow:    0, medium:    0, fast:    0 },
};

/** Look up the daily kcal delta for a goal+pace, with safe fallbacks. */
export function calorieDelta(goal: string, pace: string = "medium"): number {
  return GOAL_PACE_DELTA[goal]?.[pace] ?? 0;
}

// Kept as a fallback for any caller that hasn't been updated yet.
export const GOAL_CALORIE_DELTA: Record<string, number> = {
  cut: -500,
  bulk: 350,
  maintain: 0,
};

export const KCAL_PER_KG_FAT = 7700;
