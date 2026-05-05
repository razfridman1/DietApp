import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

let _client: Anthropic | null = null;
export function claude() {
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  if (!_client) _client = new Anthropic({ apiKey });
  return _client;
}

export const CLAUDE_MODEL = model;

/** Extract a JSON object from a Claude text response. */
export function extractJson<T>(text: string): T {
  // Try fenced code block first
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fence ? fence[1] : text).trim();
  // Find first { ... last }
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in model output");
  const slice = candidate.slice(start, end + 1);
  return JSON.parse(slice) as T;
}
