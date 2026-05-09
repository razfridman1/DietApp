import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { generateMealIdeas } from "@/lib/ai/mealIdeas";

const Schema = z.object({
  maxCalories: z.number().positive().max(10000),
});

export async function POST(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const body = await readBody(req, Schema);
  if (body instanceof Response) return body;

  const { user, supabase } = session;

  try {
    const result = await generateMealIdeas(body.maxCalories);
    // Save to history (fire-and-forget — don't block on storage errors)
    if (result.ideas.length > 0) {
      await supabase
        .from("meal_idea_history")
        .insert({
          user_id: user.id,
          max_calories: Math.round(body.maxCalories),
          ideas: result.ideas,
        });
    }
    return json(result);
  } catch (e: any) {
    return err("ai_meal_ideas_failed: " + (e?.message || "unknown"), 502);
  }
}
