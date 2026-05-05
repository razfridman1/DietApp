import { createSupabaseServer } from "@/lib/supabase/server";
import { json } from "@/lib/api-helpers";

export async function POST() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  return json({ ok: true });
}
