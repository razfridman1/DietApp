"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Trash2, Bot, MessageCircle } from "lucide-react";
import { Card, CardSubtle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { api } from "@/lib/client-api";
import { useI18n } from "@/lib/i18n/provider";
import type { ChatMessage } from "@/lib/health/types";
import { cn } from "@/lib/utils";

export function AssistantPanel() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const historyQ = useQuery({
    queryKey: ["health", "chat"],
    queryFn: () => api.get<{ messages: ChatMessage[] }>("/api/health/chat"),
  });

  const messages = historyQ.data?.messages ?? [];

  const send = useMutation({
    mutationFn: (m: string) =>
      api.post<{ user: ChatMessage; assistant: ChatMessage }>("/api/health/chat", {
        message: m,
        lang,
      }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["health", "chat"] });
    },
  });

  const clear = useMutation({
    mutationFn: () => api.del("/api/health/chat"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health", "chat"] }),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, send.isPending]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    send.mutate(v);
  }

  return (
    <div className="space-y-4">
      <Card className="border-brand-200 bg-brand-50/40 dark:bg-brand-900/20 dark:border-brand-900">
        <div className="flex items-start gap-3">
          <Bot className="size-5 text-brand-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <CardTitle>{t.assistant.title}</CardTitle>
            <CardSubtle>{t.assistant.subtitle}</CardSubtle>
          </div>
          {messages.length > 0 ? (
            <button
              onClick={() => clear.mutate()}
              className="rounded-lg p-1.5 text-surface-400 hover:text-danger"
              aria-label={t.assistant.clear}
              title={t.assistant.clear}
            >
              <Trash2 className="size-4" />
            </button>
          ) : null}
        </div>
      </Card>

      {/* Examples */}
      {messages.length === 0 ? (
        <Card>
          <div className="mb-2 flex items-center gap-2">
            <MessageCircle className="size-4 text-brand-600" />
            <h3 className="font-semibold text-sm">{t.assistant.examples}</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {t.assistant.exampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => send.mutate(q)}
                className="rounded-full bg-surface-100 px-3 py-1 text-xs hover:bg-surface-200
                           dark:bg-surface-800 dark:hover:bg-surface-700"
              >
                {q}
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Conversation */}
      <Card className="p-0 overflow-hidden">
        <div
          ref={scrollRef}
          className="max-h-[60vh] min-h-[40vh] space-y-3 overflow-y-auto p-4"
        >
          {historyQ.isLoading ? (
            <div className="h-12 animate-pulse rounded-xl bg-surface-100 dark:bg-surface-800" />
          ) : messages.length === 0 ? (
            <Bubble role="assistant" content={t.assistant.welcome} />
          ) : (
            messages.map((m) => <Bubble key={m.id} role={m.role} content={m.content} />)
          )}
          {send.isPending ? (
            <Bubble role="assistant" content={t.assistant.thinking} typing />
          ) : null}
        </div>

        {send.error ? (
          <div className="border-t border-surface-200 px-4 py-2 text-xs text-danger dark:border-surface-800">
            {(send.error as Error).message}
          </div>
        ) : null}

        <form
          onSubmit={submit}
          className="flex items-end gap-2 border-t border-surface-200 p-3 dark:border-surface-800"
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.assistant.placeholder}
            rows={1}
            className="flex-1 min-h-[44px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(e as any);
              }
            }}
          />
          <Button type="submit" loading={send.isPending} disabled={!text.trim()}>
            <Send className="size-4" />
            <span className="sr-only">{t.assistant.send}</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}

function Bubble({
  role,
  content,
  typing,
}: {
  role: "user" | "assistant";
  content: string;
  typing?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        "flex w-full",
        role === "user" ? "justify-start" : "justify-end",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
          role === "user"
            ? "bg-brand-600 text-white rounded-tr-md"
            : "bg-surface-100 text-surface-900 rounded-tl-md dark:bg-surface-800 dark:text-surface-100",
          typing && "opacity-70",
        )}
      >
        <div className="mb-0.5 text-[10px] uppercase tracking-wide opacity-70">
          {role === "user" ? t.assistant.you : t.assistant.ai}
        </div>
        <div className="whitespace-pre-wrap break-words">{content}</div>
      </div>
    </div>
  );
}
