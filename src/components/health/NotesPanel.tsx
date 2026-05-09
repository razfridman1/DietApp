"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Copy,
  Edit3,
  Sparkles,
  StickyNote,
  Smile,
  Meh,
  Frown,
  Coffee,
  TrendingUp,
} from "lucide-react";
import { Card, CardSubtle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/client-api";
import { useI18n } from "@/lib/i18n/provider";
import type { HealthNote, PatternFinding } from "@/lib/health/types";
import { cn } from "@/lib/utils";

const COLORS = ["#22c55e", "#0ea5e9", "#f59e0b", "#ef4444", "#a855f7", "#ec4899", "#64748b"];

const MOOD_ICON = {
  great: Smile,
  good: Smile,
  ok: Meh,
  tired: Coffee,
  bad: Frown,
} as const;

const MOOD_TONE = {
  great: "text-success",
  good: "text-success",
  ok: "text-warn",
  tired: "text-warn",
  bad: "text-danger",
} as const;

export function NotesPanel() {
  const { t, lang } = useI18n();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<HealthNote | null>(null);

  const notesQ = useQuery({
    queryKey: ["health", "notes"],
    queryFn: () => api.get<{ notes: HealthNote[] }>("/api/health/notes"),
  });
  const notes = notesQ.data?.notes ?? [];

  const patterns = useMutation({
    mutationFn: () =>
      api.post<{ patterns: PatternFinding[] }>("/api/health/find-patterns", { lang }),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.del(`/api/health/notes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health", "notes"] }),
  });
  const dup = useMutation({
    mutationFn: (id: string) => api.post(`/api/health/notes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["health", "notes"] }),
  });

  return (
    <div className="space-y-4">
      <Card className="border-brand-200 bg-brand-50/40 dark:bg-brand-900/20 dark:border-brand-900">
        <div className="flex items-start gap-3">
          <StickyNote className="size-5 text-brand-600 mt-0.5 shrink-0" />
          <div>
            <CardTitle>{t.notes.title}</CardTitle>
            <CardSubtle>{t.notes.subtitle}</CardSubtle>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => setAddOpen(true)} className="flex-1">
          <Plus className="size-4" />
          {t.notes.add}
        </Button>
        <Button
          variant="secondary"
          onClick={() => patterns.mutate()}
          loading={patterns.isPending}
        >
          <Sparkles className="size-4" />
          {patterns.isPending ? t.notes.finding : t.notes.findPatterns}
        </Button>
      </div>

      {/* Examples */}
      <Card>
        <p className="mb-2 text-xs font-medium text-surface-500">{t.notes.examples}</p>
        <ul className="space-y-1.5">
          {t.notes.exampleNotes.map((ex, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="size-1.5 shrink-0 rounded-full bg-brand-500" />
              <span className="text-surface-600 dark:text-surface-300">{ex}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Patterns */}
      {patterns.data?.patterns?.length ? (
        <Card className="border-brand-300 bg-brand-50/30 dark:bg-brand-900/20 dark:border-brand-900">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="size-4 text-brand-600" />
            <h3 className="font-semibold">{t.notes.patternsTitle}</h3>
          </div>
          <ul className="space-y-2">
            {patterns.data.patterns.map((p, i) => (
              <li
                key={i}
                className={cn(
                  "rounded-xl border p-3",
                  p.severity === "critical"
                    ? "border-danger/40 bg-danger/5"
                    : p.severity === "warn"
                    ? "border-warn/40 bg-warn/5"
                    : "border-brand-200 bg-white dark:bg-surface-900 dark:border-surface-800",
                )}
              >
                <div className="font-medium">{p.pattern}</div>
                {p.evidence ? (
                  <div className="mt-1 text-xs text-surface-500">{p.evidence}</div>
                ) : null}
                {p.recommendation ? (
                  <div className="mt-1 text-sm">
                    <span className="font-semibold">{lang === "he" ? "המלצה: " : "Recommendation: "}</span>
                    {p.recommendation}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {/* Notes list */}
      {notesQ.isLoading ? (
        <Card className="h-24 animate-pulse" />
      ) : notes.length === 0 ? (
        <Card className="text-sm text-surface-500">{t.notes.empty}</Card>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => {
            const MoodIcon = n.mood ? MOOD_ICON[n.mood] : null;
            return (
              <li key={n.id}>
                <Card
                  style={
                    n.color
                      ? { borderInlineStartColor: n.color, borderInlineStartWidth: 4 }
                      : undefined
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-surface-500">
                        {MoodIcon ? (
                          <span className={cn("inline-flex items-center gap-1", MOOD_TONE[n.mood!])}>
                            <MoodIcon className="size-4" />
                            {t.notes.moodOptions[n.mood!]}
                          </span>
                        ) : null}
                        <span className="tabular">{n.log_date}</span>
                        {n.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-surface-100 px-2 py-0.5 dark:bg-surface-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{n.body}</p>
                      {n.food_mentioned ? (
                        <div className="mt-2 text-xs text-surface-500">
                          <span className="font-semibold">{t.notes.foodMention}: </span>
                          {n.food_mentioned}
                          {n.food_rating ? (
                            <span className="ms-1 tabular">({n.food_rating}/10)</span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setEditing(n)}
                        className="rounded-lg p-1.5 text-surface-400 hover:text-brand-600"
                        aria-label={t.common.edit}
                      >
                        <Edit3 className="size-4" />
                      </button>
                      <button
                        onClick={() => dup.mutate(n.id)}
                        className="rounded-lg p-1.5 text-surface-400 hover:text-brand-600"
                        aria-label={t.common.duplicate}
                      >
                        <Copy className="size-4" />
                      </button>
                      <button
                        onClick={() => del.mutate(n.id)}
                        className="rounded-lg p-1.5 text-surface-400 hover:text-danger"
                        aria-label={t.common.delete}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <NoteFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => {
          setAddOpen(false);
          qc.invalidateQueries({ queryKey: ["health", "notes"] });
        }}
      />
      <NoteFormModal
        open={editing !== null}
        existing={editing ?? undefined}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          qc.invalidateQueries({ queryKey: ["health", "notes"] });
        }}
      />
    </div>
  );
}

function NoteFormModal({
  open,
  onClose,
  onSaved,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  existing?: HealthNote;
}) {
  const { t } = useI18n();
  const [body, setBody] = useState(existing?.body ?? "");
  const [mood, setMood] = useState<HealthNote["mood"]>(existing?.mood ?? null);
  const [tags, setTags] = useState((existing?.tags ?? []).join(", "));
  const [color, setColor] = useState<string | null>(existing?.color ?? null);
  const [food, setFood] = useState(existing?.food_mentioned ?? "");

  // Sync when existing changes (modal re-opens with another note)
  if (existing && existing.id !== (existing as any)._lastId) {
    if (existing.body !== body && body === "") setBody(existing.body);
  }

  const save = useMutation({
    mutationFn: () => {
      const tagList = tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 15);
      const payload = {
        body,
        mood,
        tags: tagList,
        color,
        food_mentioned: food || null,
      };
      return existing
        ? api.patch(`/api/health/notes/${existing.id}`, payload)
        : api.post("/api/health/notes", payload);
    },
    onSuccess: () => {
      setBody("");
      setMood(null);
      setTags("");
      setColor(null);
      setFood("");
      onSaved();
    },
  });

  const moods: HealthNote["mood"][] = ["great", "good", "ok", "tired", "bad"];

  return (
    <Modal open={open} onClose={onClose} title={existing ? t.common.edit : t.notes.add}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim()) return;
          save.mutate();
        }}
        className="space-y-3"
      >
        <div>
          <Label>{t.notes.placeholder}</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t.notes.placeholder}
            rows={4}
            autoFocus
          />
        </div>

        <div>
          <Label>{t.notes.mood}</Label>
          <div className="flex flex-wrap gap-2">
            {moods.map((m) => {
              if (!m) return null;
              const Icon = MOOD_ICON[m];
              return (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMood(mood === m ? null : m)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                    mood === m
                      ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      : "border-surface-200 dark:border-surface-800",
                  )}
                >
                  <Icon className="size-3.5" />
                  {t.notes.moodOptions[m]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label>{t.common.tags}</Label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t.notes.tagsPlaceholder}
          />
        </div>

        <div>
          <Label>{t.notes.foodMention}</Label>
          <Input value={food} onChange={(e) => setFood(e.target.value)} />
        </div>

        <div>
          <Label>{t.common.color}</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(color === c ? null : c)}
                className={cn(
                  "size-7 rounded-full border-2 transition-transform",
                  color === c ? "border-surface-900 dark:border-white scale-110" : "border-transparent",
                )}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" loading={save.isPending} className="flex-1">
            {t.common.save}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
