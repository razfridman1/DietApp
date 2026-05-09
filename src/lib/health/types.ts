// Shared types for the Health tab.

export type Lang = "he" | "en";

export type Frequency = "daily" | "weekly" | "rare" | "avoid";

export interface FoodImpact {
  heart: number;       // 1 (great) – 5 (terrible)
  muscles: number;
  energy: number;
  skin: number;
  brain: number;
  satiety: number;
  bloodSugar: number;
}

export interface NutritionPer100 {
  kcal: number;
  protein: number;
  carbs: number;
  sugar: number;
  fats: number;
  fiber: number;
}

export interface FoodRatingPayload {
  query: string;
  rating: number;                 // 1 best – 10 worst
  frequency: Frequency;
  overview: string;
  pros: string[];
  cons: string[];
  effects: FoodImpact;
  nutrition: NutritionPer100;
  alternatives: string[];
  /** Optional analysis when user provides a quantity */
  quantityNote?: string;
  grams?: number;
}

export interface DailyIntakeItem {
  id: string;
  user_id: string;
  log_date: string;
  name: string;
  kind: "food" | "drink";
  qty_value: number | null;
  qty_unit: "g" | "ml" | "unit";
  rating: number | null;
  notes: string | null;
  color: string | null;
  category: string | null;
  consumed_at: string;
  created_at: string;
  /** "intake" = added in /health Daily Intake tab. "meal" = pulled from /dashboard meals (read-only here). */
  source?: "intake" | "meal";
  /** When source = "meal", these are pre-computed by the original log */
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
}

export interface DayAnalysisPayload {
  score: number;                  // 1 (excellent) – 10 (needs work)
  status: "excellent" | "balanced" | "needs_work";
  summary: string;
  warnings: string[];
  suggestions: string[];
  totals: {
    sugar: number;
    protein: number;
    water: number;
    calories: number;
    fiber: number;
    omega3: number;
  };
  /** % of recommended daily intake */
  targets: {
    sugar: number;
    protein: number;
    water: number;
    calories: number;
    fiber: number;
    omega3: number;
  };
}

export interface WeeklyList {
  id: string;
  user_id: string;
  name: string;
  list_type: "shopping" | "weekly" | "meal_prep" | "recommended" | "avoid";
  preset: string | null;
  notes: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  user_id: string;
  name: string;
  qty: string | null;
  rating: number | null;
  reason: string | null;
  notes: string | null;
  color: string | null;
  category: string | null;
  checked: boolean;
  position: number;
  created_at: string;
}

export interface HealthNote {
  id: string;
  user_id: string;
  body: string;
  mood: "great" | "good" | "ok" | "tired" | "bad" | null;
  tags: string[];
  color: string | null;
  category: string | null;
  food_mentioned: string | null;
  food_rating: number | null;
  log_date: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  lang: Lang;
  created_at: string;
}

export interface PatternFinding {
  pattern: string;
  evidence: string;
  recommendation: string;
  severity: "info" | "warn" | "critical";
}
