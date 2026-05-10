import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { err, json, readBody } from "@/lib/api-helpers";
import { parseMealImage, type SupportedImageMediaType } from "@/lib/ai/parseMealImage";

// Roughly cap the base64 payload at ~6 MB to stay well under Vercel/Next route
// body limits and Anthropic's image size limits. The client should compress
// before uploading; this is just a defensive ceiling.
const MAX_BASE64_LEN = 6 * 1024 * 1024;

const Schema = z.object({
  /** Raw base64 (no `data:` prefix). */
  imageBase64: z.string().min(100).max(MAX_BASE64_LEN),
  mediaType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  grams: z.number().positive().max(5000).nullable().optional(),
  text: z.string().max(500).optional().nullable(),
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
    const result = await parseMealImage(
      body.imageBase64,
      body.mediaType as SupportedImageMediaType,
      body.grams ?? null,
      body.text ?? null,
    );
    return json(result);
  } catch (e: any) {
    return err("ai_image_parse_failed: " + (e?.message || "unknown"), 502);
  }
}

// Image payloads are larger than the default 1 MB limit. Tell Next to allow
// up to 8 MB of body on this route.
export const runtime = "nodejs";
export const maxDuration = 60;
