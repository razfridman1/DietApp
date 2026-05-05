import { requireUser } from "@/lib/supabase/server";
import { err, json } from "@/lib/api-helpers";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { id } = await ctx.params;
  const { supabase, user } = session;
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return err(error.message, 400);
  return json({ ok: true });
}
