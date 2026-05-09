import type Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL, claude } from "./claude";
import type { ChatMessage, Lang } from "@/lib/health/types";

const SYSTEM_HE = `אתה עוזר תזונה אישי בשם "Nutri AI".
- ענה בעברית טבעית, נעימה, אבל ענייני וקצר.
- תמיד תזונה מבוססת מחקר. אם אין הוכחה — אמור.
- אל תיתן ייעוץ רפואי. בנושא רפואי מובהק — הפנה לרופא.
- אם המשתמש מבקש כמויות, הסבר תוך התייחסות לגיל / משקל / יעד.
- שמור על תשובות 4-10 משפטים אלא אם נשאלת שאלה רחבה.
- אל תשתמש ב-JSON. שיחה רגילה.`;

const SYSTEM_EN = `You are "Nutri AI" — a personal nutrition assistant.
- Reply in clear, friendly English, but stay concise and on-topic.
- Stick to evidence-based nutrition. Say so when uncertain.
- Do not give medical advice. For medical issues, refer to a doctor.
- When asked about quantities, factor in age / weight / goal.
- Keep replies 4-10 sentences unless the question is broad.
- Plain prose — no JSON.`;

export async function chatReply(
  history: Pick<ChatMessage, "role" | "content">[],
  lang: Lang = "he",
): Promise<string> {
  const c = claude();
  // Anthropic requires alternating user/assistant. Drop any leading assistant turn.
  const cleaned = history.filter((m) => m.content?.trim());
  const trimmed: Pick<ChatMessage, "role" | "content">[] = [];
  let lastRole: ChatMessage["role"] | null = null;
  for (const m of cleaned) {
    if (m.role === lastRole) {
      // merge consecutive same-role into one message
      trimmed[trimmed.length - 1] = {
        role: m.role,
        content: trimmed[trimmed.length - 1].content + "\n" + m.content,
      };
    } else {
      trimmed.push({ role: m.role, content: m.content });
      lastRole = m.role;
    }
  }
  // Conversation must start with user
  while (trimmed.length && trimmed[0].role !== "user") trimmed.shift();
  if (trimmed.length === 0) return lang === "he" ? "במה אעזור?" : "How can I help?";

  const res = await c.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 800,
    system: lang === "he" ? SYSTEM_HE : SYSTEM_EN,
    messages: trimmed.map((m) => ({ role: m.role, content: m.content })),
  });

  const text = res.content
    .filter((b: any): b is Anthropic.TextBlock => b.type === "text")
    .map((b: any) => b.text)
    .join("\n")
    .trim();

  return text || (lang === "he" ? "סליחה, נסה/י לנסח אחרת." : "Sorry, please rephrase.");
}
