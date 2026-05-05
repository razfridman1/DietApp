import type { Profile } from "@/types";

export function proteinTarget(p: Pick<Profile, "weight_kg" | "protein_per_kg" | "goal">) {
  const w = p.weight_kg ?? 70;
  let perKg = p.protein_per_kg ?? 1.8;
  // sensible defaults if user hasn't customized
  if (!p.protein_per_kg) {
    if (p.goal === "cut") perKg = 2.0;
    else if (p.goal === "bulk") perKg = 1.8;
    else perKg = 1.6;
  }
  return Math.round(w * perKg);
}
