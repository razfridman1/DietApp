import { requireUser } from "@/lib/supabase/server";
import { json } from "@/lib/api-helpers";

export async function GET() {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;

  const { data } = await supabase
    .from("food_ratings")
    .select("id, query, lang, rating, grams, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  return json({ items: data ?? [] });
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
    await supabase.from("food_ratings").delete().eq("user_id", user.id);
    return json({ ok: true });
  }
  await supabase.from("food_ratings").delete().eq("user_id", user.id).eq("id", id);
  return json({ ok: true });
}
