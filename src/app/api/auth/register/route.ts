import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  display_name: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await readBody(req, Schema);
  if (body instanceof Response) return body;

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: { data: { display_name: body.display_name } },
  });
  if (error) return err(error.message, 400);

  if (data.user && body.display_name) {
    await supabase
      .from("profiles")
      .update({ display_name: body.display_name })
      .eq("id", data.user.id);
  }

  return json({ user: data.user });
}
