// Shared types for the Reports feature.
import type { Activity, ActivityType, DailyLog, Meal, Profile } from "@/types";

export type ReportRange = "weekly" | "monthly" | "yearly" | "custom";

export interface ReportRangeInput {
  range: ReportRange;
  /** YYYY-MM-DD inclusive (only used for custom). */
  from?: string;
  /** YYYY-MM-DD inclusive (only used for custom). */
  to?: string;
}

export interface ReportDayDetail {
  date: string;
  log: DailyLog;
  meals: Meal[];
  activities: Activity[];
  workoutCount: number;
  workoutMinutes: number;
}

export interface ReportSummary {
  /** Number of days with any activity logged (meal/workout). */
  trackedDays: number;
  /** Days in the selected range (inclusive). */
  totalDays: number;
  avgCalories: number;
  avgProtein: number;
  totalCalories: number;
  totalProtein: number;
  totalWorkouts: number;
  totalWorkoutMinutes: number;
}

export interface ReportChartPoint {
  date: string;
  value: number;
}

export interface ReportCharts {
  calories: ReportChartPoint[];
  protein: ReportChartPoint[];
  workouts: ReportChartPoint[];
  /** Net calorie trend (calories_in - calories_out) for "progress trends". */
  net: ReportChartPoint[];
}

export interface ReportPayload {
  range: ReportRange;
  from: string;
  to: string;
  generatedAt: string; // ISO timestamp
  profile: Pick<Profile, "id" | "email" | "display_name">;
  summary: ReportSummary;
  charts: ReportCharts;
  days: ReportDayDetail[];
  aiSummary: string | null;
}

export const ACTIVITY_LABELS_HE: Record<ActivityType, string> = {
  walk: "הליכה",
  run: "ריצה",
  gym: "אימון כוח",
  swim: "שחייה",
  cycle: "אופניים",
  yoga: "יוגה",
  other: "פעילות",
};
