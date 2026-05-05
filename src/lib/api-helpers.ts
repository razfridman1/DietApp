import { NextResponse } from "next/server";
import { z } from "zod";

export const json = (data: unknown, init?: ResponseInit) =>
  NextResponse.json(data, init);

export const err = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export async function readBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
): Promise<z.infer<T> | NextResponse> {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return err(
        "invalid input: " +
          parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
        422,
      );
    }
    return parsed.data;
  } catch {
    return err("invalid JSON", 400);
  }
}
