import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { generateMealIdeas } from "@/lib/ai/mealIdeas";

const Schema = z.object({
  maxCalories: z.number().positive().max(10000),
});

export async function POST(req: Request) {
  try {
    await requireUser();
  } catch (r) {
    return r as Response;
  }
  const body = await readBody(req, Schema);
  if (body instanceof Response) return body;

  try {
    const result = await generateMealIdeas(body.maxCalories);
    return json(result);
  } catch (e: any) {
    return err("ai_meal_ideas_failed: " + (e?.message || "unknown"), 502);
  }
}
