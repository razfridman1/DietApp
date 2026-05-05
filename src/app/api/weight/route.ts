import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { todayISO } from "@/lib/format";

const Schema = z.object({
  weight_kg: z.number().positive().max(400),
  log_date: z.string().optional(),
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
  const log_date = body.log_date ?? todayISO();

  const { data, error } = await supabase
    .from("weight_history")
    .upsert(
      { user_id: user.id, log_date, weight_kg: body.weight_kg },
      { onConflict: "user_id,log_date" },
    )
    .select()
    .maybeSingle();
  if (error) return err(error.message, 400);

  // also sync the user's "current weight" on profile
  await supabase
    .from("profiles")
    .update({ weight_kg: body.weight_kg, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  return json(data);
}

export async function GET(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const url = new URL(req.url);
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days") || 90)));
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceIso = since.toISOString().slice(0, 10);

  const { user, supabase } = session;
  const { data, error } = await supabase
    .from("weight_history")
    .select("*")
    .eq("user_id", user.id)
    .gte("log_date", sinceIso)
    .order("log_date", { ascending: true });
  if (error) return err(error.message, 400);
  return json({ weights: data });
}
