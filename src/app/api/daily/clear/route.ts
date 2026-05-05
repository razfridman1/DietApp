import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { todayISO } from "@/lib/format";

const Schema = z.object({ log_date: z.string().optional() });

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
  const date = body.log_date ?? todayISO();

  const [m, a] = await Promise.all([
    supabase.from("meals").delete().eq("user_id", user.id).eq("log_date", date),
    supabase.from("activities").delete().eq("user_id", user.id).eq("log_date", date),
  ]);
  if (m.error) return err(m.error.message, 400);
  if (a.error) return err(a.error.message, 400);
  return json({ ok: true });
}
