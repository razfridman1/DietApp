export type Goal = "cut" | "bulk" | "maintain";
export type GoalPace = "slow" | "medium" | "fast";
export type Gender = "male" | "female" | "other";
export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";
export type ActivityType =
  | "walk"
  | "run"
  | "gym"
  | "swim"
  | "cycle"
  | "yoga"
  | "other";
export type Intensity = "low" | "moderate" | "high";
export type InsightCategory = "diet" | "training" | "behavior" | "goal";
export type InsightSeverity = "info" | "warn" | "critical";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  gender: Gender | null;
  birth_year: number | null;
  activity_level: ActivityLevel;
  goal: Goal;
  goal_pace: GoalPace;
  target_weight_kg: number | null;
  protein_per_kg: number;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  calories_in: number;
  calories_out: number;
  protein_total: number;
  carbs_total: number;
  fats_total: number;
  net_calories: number;
}

export interface Meal {
  id: string;
  user_id: string;
  log_date: string;
  name: string;
  grams: number | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal_time: string;
  ai_generated: boolean;
}

export interface Activity {
  id: string;
  user_id: string;
  log_date: string;
  type: ActivityType;
  description: string | null;
  duration_min: number;
  intensity: Intensity;
  calories_burned: number;
  ai_generated: boolean;
  performed_at: string;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  weight_kg: number;
  log_date: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  insight_text: string;
  recommendation: string | null;
  metric: number | null;
  generated_for_date: string;
  created_at: string;
}

export interface TodayPayload {
  profile: Profile;
  log: DailyLog;
  meals: Meal[];
  activities: Activity[];
  tdee: number;
  proteinTarget: number;
  weightForecastKg: number;
  goalCalorieTarget: number;
}
