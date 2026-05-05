import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { parseMeal } from "@/lib/ai/parseMeal";

const Schema = z.object({
  text: z.string().min(2),
  grams: z.number().positive().max(5000).nullable().optional(),
});

export async function POST(req: Request) {
  try {
    await requireUser();
  } catch (r) {
    return r as Response;
  }
  const body = await readBody(req, Schema);
  if (body instanceof Response) return body;

  try {
    const result = await parseMeal(body.text, body.grams ?? null);
    return json(result);
  } catch (e: any) {
    return err("ai_parse_failed: " + (e?.message || "unknown"), 502);
  }
}
