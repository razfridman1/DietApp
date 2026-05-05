import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { parseActivity } from "@/lib/ai/parseActivity";

const Schema = z.object({ text: z.string().min(2) });

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
  const { data: profile } = await supabase
    .from("profiles")
    .select("weight_kg")
    .eq("id", user.id)
    .maybeSingle();

  try {
    const result = await parseActivity(body.text, profile?.weight_kg);
    return json(result);
  } catch (e: any) {
    return err("ai_parse_failed: " + (e?.message || "unknown"), 502);
  }
}
