import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { rateFood } from "@/lib/ai/foodRating";
import { normalize } from "@/lib/health/seed";

const Schema = z.object({
  query: z.string().min(1).max(120),
  lang: z.enum(["he", "en"]).default("he"),
  grams: z.number().positive().max(5000).optional(),
  /** When true, the result is cached / saved to history */
  save: z.boolean().default(true),
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
  const queryNorm = normalize(body.query);

  // Try a cache hit first (only when no grams override is given — quantityNote is unique).
  if (!body.grams) {
    const { data: cached } = await supabase
      .from("food_ratings")
      .select("payload")
      .eq("user_id", user.id)
      .eq("query_normalized", queryNorm)
      .eq("lang", body.lang)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (cached?.payload) {
      return json({ payload: cached.payload, cached: true });
    }
  }

  try {
    const payload = await rateFood(body.query, { lang: body.lang, grams: body.grams });
    if (body.save) {
      await supabase.from("food_ratings").insert({
        user_id: user.id,
        query: body.query,
        query_normalized: queryNorm,
        lang: body.lang,
        rating: payload.rating,
        payload,
        grams: body.grams ?? null,
      });
    }
    return json({ payload, cached: false });
  } catch (e: any) {
    return err("ai_food_rating_failed: " + (e?.message || "unknown"), 502);
  }
}
