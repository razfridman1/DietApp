import type { Profile } from "@/types";
import { ACTIVITY_LEVEL_MULT } from "@/lib/constants";

/**
 * Mifflin–St Jeor BMR.
 * For 'other' or missing gender, average male+female formulas.
 */
export function bmr(p: Pick<Profile, "weight_kg" | "height_cm" | "birth_year" | "gender">) {
  const w = p.weight_kg ?? 70;
  const h = p.height_cm ?? 170;
  const age = p.birth_year ? new Date().getFullYear() - p.birth_year : 30;
  const base = 10 * w + 6.25 * h - 5 * age;
  if (p.gender === "male") return base + 5;
  if (p.gender === "female") return base - 161;
  return base - 78; // average
}

export function tdee(p: Pick<Profile, "weight_kg" | "height_cm" | "birth_year" | "gender" | "activity_level">) {
  const mult = ACTIVITY_LEVEL_MULT[p.activity_level] ?? 1.2;
  return Math.round(bmr(p) * mult);
}
