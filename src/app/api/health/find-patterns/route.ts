import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { findPatterns } from "@/lib/ai/notesPatterns";

const Schema = z.object({
  lang: z.enum(["he", "en"]).default("he"),
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

  const { data: notes } = await supabase
    .from("health_notes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(80);

  try {
    const patterns = await findPatterns((notes ?? []) as any, body.lang);
    return json({ patterns });
  } catch (e: any) {
    return err("ai_patterns_failed: " + (e?.message || "unknown"), 502);
  }
}
