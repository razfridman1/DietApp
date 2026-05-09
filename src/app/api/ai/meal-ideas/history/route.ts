import { requireUser } from "@/lib/supabase/server";
import { json } from "@/lib/api-helpers";
import type { MealIdea } from "@/lib/ai/mealIdeas";

export interface HistoryEntry {
  id: string;
  max_calories: number;
  ideas: MealIdea[];
  created_at: string;
}

export async function GET() {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;
  const { data } = await supabase
    .from("meal_idea_history")
    .select("id, max_calories, ideas, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);
  return json({ items: (data ?? []) as HistoryEntry[] });
}

export async function DELETE(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    await supabase.from("meal_idea_history").delete().eq("user_id", user.id);
    return json({ ok: true });
  }
  await supabase
    .from("meal_idea_history")
    .delete()
    .eq("user_id", user.id)
    .eq("id", id);
  return json({ ok: true });
}
