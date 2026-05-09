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

/** Common quick-fixes for almost-valid JSON the model produces. */
function repairJsonShallow(s: string): string {
  return (
    s
      // Smart / fancy quotes → ASCII
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      // Remove trailing commas before } or ]
      .replace(/,(\s*[}\]])/g, "$1")
      // Strip JS-style comments  // ...  and  /* ... */
      .replace(/\/\/.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
  );
}

/**
 * Best-effort: turn ASCII double-quotes that appear *inside* a JSON string value
 * into Hebrew gershayim, so the JSON parser doesn't think the string ended early.
 *
 * Heuristic: walk char-by-char tracking whether we're inside a string literal.
 * The first `"` we see opens a string; the next `"` would normally close it,
 * BUT if the next non-whitespace character isn't one of `,]}:` (or end of input)
 * the `"` is almost certainly a quote inside the string, not a closer.
 */
function repairInnerQuotes(s: string): string {
  let inString = false;
  let escaped = false;
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];

    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      out += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      if (!inString) {
        inString = true;
        out += ch;
        continue;
      }
      // We're inside a string — peek ahead to see if this looks like a real close.
      let j = i + 1;
      while (j < s.length && (s[j] === " " || s[j] === "\t")) j++;
      const next = s[j];
      const looksLikeCloser =
        next === "," || next === "}" || next === "]" || next === ":" || next === undefined || next === "\n";
      if (looksLikeCloser) {
        inString = false;
        out += ch;
      } else {
        // Replace the stray quote with the Hebrew gershayim so the parse keeps going.
        out += "״";
      }
      continue;
    }

    out += ch;
  }
  return out;
}

/** Extract a JSON object from a Claude text response.  Tolerant of common slop. */
export function extractJson<T>(text: string): T {
  // Try fenced code block first
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fence ? fence[1] : text).trim();
  // Find first { ... last }
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in model output");
  const slice = candidate.slice(start, end + 1);

  const attempts: Array<() => string> = [
    () => slice,
    () => repairJsonShallow(slice),
    () => repairInnerQuotes(repairJsonShallow(slice)),
  ];

  let lastErr: unknown = null;
  for (const make of attempts) {
    try {
      return JSON.parse(make()) as T;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Invalid JSON from model");
}
