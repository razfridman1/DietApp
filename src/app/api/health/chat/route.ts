import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { chatReply } from "@/lib/ai/nutritionChat";

const PostSchema = z.object({
  message: z.string().min(1).max(2000),
  lang: z.enum(["he", "en"]).default("he"),
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
    .from("chat_messages")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(80);
  return json({ messages: data ?? [] });
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

  // Save user message
  const { data: userMsg, error: e1 } = await supabase
    .from("chat_messages")
    .insert({
      user_id: user.id,
      role: "user",
      content: body.message,
      lang: body.lang,
    })
    .select("*")
    .single();
  if (e1) return err(e1.message, 400);

  // Build history for the model
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(40);

  let reply = "";
  try {
    reply = await chatReply((history ?? []) as any, body.lang);
  } catch (e: any) {
    return err("ai_chat_failed: " + (e?.message || "unknown"), 502);
  }

  const { data: assistantMsg, error: e2 } = await supabase
    .from("chat_messages")
    .insert({
      user_id: user.id,
      role: "assistant",
      content: reply,
      lang: body.lang,
    })
    .select("*")
    .single();
  if (e2) return err(e2.message, 400);

  return json({ user: userMsg, assistant: assistantMsg });
}

export async function DELETE() {
  let session;
  try {
    session = await requireUser();
  } catch (r) {
    return r as Response;
  }
  const { user, supabase } = session;
  await supabase.from("chat_messages").delete().eq("user_id", user.id);
  return json({ ok: true });
}
