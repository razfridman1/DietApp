import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { todayISO } from "@/lib/format";

const PostSchema = z.object({
  body: z.string().min(1).max(2000),
  mood: z.enum(["great", "good", "ok", "tired", "bad"]).nullable().optional(),
  tags: z.array(z.string().min(1).max(30)).max(15).default([]),
  color: z.string().max(20).nullable().optional(),
  category: z.string().max(40).nullable().optional(),
  food_mentioned: z.string().max(120).nullable().optional(),
  food_rating: z.number().int().min(1).max(10).nullable().optional(),
  log_date: z.string().optional(),
});

export async function GET() {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;
  const { data } = await supabase
    .from("health_notes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);
  return json({ notes: data ?? [] });
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const body = await readBody(req, PostSchema);
  if (body instanceof Response) return body;
  const { user, supabase } = session;

  const { data, error } = await supabase
    .from("health_notes")
    .insert({
      user_id: user.id,
      body: body.body,
      mood: body.mood ?? null,
      tags: body.tags,
      color: body.color ?? null,
      category: body.category ?? null,
      food_mentioned: body.food_mentioned ?? null,
      food_rating: body.food_rating ?? null,
      log_date: body.log_date ?? todayISO(),
    })
    .select("*")
    .single();
  if (error) return err(error.message, 400);
  return json({ note: data });
}
