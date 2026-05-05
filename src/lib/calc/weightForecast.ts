import { KCAL_PER_KG_FAT } from "@/lib/constants";

/**
 * Convert a daily calorie balance (negative = deficit, positive = surplus)
 * into projected weight change in kg.
 *
 * 7700 kcal ≈ 1 kg of body fat. We use this as an approximation; in reality
 * water/glycogen swings dominate short-term changes, but for forecasting
 * trends this is the standard approach.
 */
export function dailyForecastKg(netCalories: number, tdee: number): number {
  const balance = netCalories - tdee; // surplus or deficit
  return balance / KCAL_PER_KG_FAT;
}

export function weeklyForecastKg(avgNet: number, tdee: number): number {
  return dailyForecastKg(avgNet, tdee) * 7;
}

/** Days to reach goal weight at the current daily delta (kcal vs TDEE). */
export function etaToGoalDays(
  currentWeight: number,
  targetWeight: number,
  dailyDeltaKcal: number,
): number | null {
  if (dailyDeltaKcal === 0) return null;
  const kgDelta = targetWeight - currentWeight; // negative for cutting
  const dailyKgDelta = dailyDeltaKcal / KCAL_PER_KG_FAT;
  // both must point the same direction
  if (Math.sign(kgDelta) !== Math.sign(dailyKgDelta)) return null;
  return Math.ceil(Math.abs(kgDelta / dailyKgDelta));
}
