import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await readBody(req, Schema);
  if (body instanceof Response) return body;

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });
  if (error) return err(error.message, 401);

  return json({ user: data.user });
}
