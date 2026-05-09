import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { generateList } from "@/lib/ai/listGenerator";

const Schema = z.object({
  preset: z.enum([
    "cut",
    "muscle",
    "general",
    "teens",
    "family",
    "energy",
    "brain",
    "sleep",
  ]),
  list_type: z
    .enum(["shopping", "weekly", "meal_prep", "recommended", "avoid"])
    .default("shopping"),
  lang: z.enum(["he", "en"]).default("he"),
  /** When true, persist the generated list and items to the DB and return them. */
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

  try {
    const generated = await generateList(body.preset, body.list_type, body.lang);

    if (!body.save) return json({ generated });

    const { data: list, error } = await supabase
      .from("weekly_lists")
      .insert({
        user_id: user.id,
        name: generated.name,
        list_type: generated.list_type,
        preset: body.preset,
      })
      .select("*")
      .single();
    if (error || !list) return err(error?.message ?? "list_create_failed", 400);

    const rows = generated.items.map((it, i) => ({
      list_id: list.id,
      user_id: user.id,
      name: it.name,
      qty: it.qty ?? null,
      rating: it.rating ?? null,
      reason: it.reason ?? null,
      category: it.category ?? null,
      position: i,
    }));
    if (rows.length) {
      const { error: e2 } = await supabase.from("list_items").insert(rows);
      if (e2) return err(e2.message, 400);
    }
    const { data: items } = await supabase
      .from("list_items")
      .select("*")
      .eq("list_id", list.id)
      .order("position", { ascending: true });

    return json({ list: { ...list, items: items ?? [] } });
  } catch (e: any) {
    return err("ai_list_generate_failed: " + (e?.message || "unknown"), 502);
  }
}
