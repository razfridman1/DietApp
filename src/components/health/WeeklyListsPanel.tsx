"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Copy,
  Edit3,
  Sparkles,
  ListChecks,
  ShoppingCart,
  ChefHat,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Check,
} from "lucide-react";
import { Card, CardSubtle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/client-api";
import { useI18n } from "@/lib/i18n/provider";
import { RatingBadge } from "./RatingBadge";
import type { WeeklyList, ListItem } from "@/lib/health/types";
import type { ListPreset } from "@/lib/ai/listGenerator";
import { cn } from "@/lib/utils";

type FullList = WeeklyList & { items: ListItem[] };

const TYPE_ICON: Record<WeeklyList["list_type"], any> = {
  shopping: ShoppingCart,
  weekly: Calendar,
  meal_prep: ChefHat,
  recommended: ThumbsUp,
  avoid: ThumbsDown,
};

const TYPE_LABEL_KEY: Record<
  WeeklyList["list_type"],
  "shopping" | "weekly" | "mealPrep" | "recommended" | "avoid"
> = {
  shopping: "shopping",
  weekly: "weekly",
  meal_prep: "mealPrep",
  recommended: "recommended",
  avoid: "avoid",
};

function typeLabel(
  t: ReturnType<typeof useI18n>["t"],
  type: WeeklyList["list_type"],
) {
  return t.lists.types[TYPE_LABEL_KEY[type]];
}

export function WeeklyListsPanel() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [openListId, setOpenListId] = useState<string | null>(null);

  const listsQ = useQuery({
    queryKey: ["health", "lists"],
    queryFn: () => api.get<{ lists: FullList[] }>("/api/health/lists"),
  });

  const lists = listsQ.data?.lists ?? [];
  const openList = lists.find((l) => l.id === openListId) ?? null;

  function refresh() {
    qc.invalidateQueries({ queryKey: ["health", "lists"] });
  }

  return (
    <div className="space-y-4">
      <Card className="border-brand-200 bg-brand-50/40 dark:bg-brand-900/20 dark:border-brand-900">
        <div className="flex items-start gap-3">
          <ListChecks className="size-5 text-brand-600 mt-0.5 shrink-0" />
          <div>
            <CardTitle>{t.lists.title}</CardTitle>
            <CardSubtle>{t.lists.subtitle}</CardSubtle>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => setCreateOpen(true)} className="flex-1">
          <Plus className="size-4" />
          {t.lists.create}
        </Button>
        <Button onClick={() => setAiOpen(true)} variant="secondary">
          <Sparkles className="size-4" />
          {t.lists.aiGenerate}
        </Button>
      </div>

      {listsQ.isLoading ? (
        <Card className="h-32 animate-pulse" />
      ) : lists.length === 0 ? (
        <Card className="text-sm text-surface-500">{t.lists.empty}</Card>
      ) : (
        <ul className="space-y-3">
          {lists.map((l) => {
            const Icon = TYPE_ICON[l.list_type] ?? ListChecks;
            return (
              <li key={l.id}>
                <Card>
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-brand-50 p-2 dark:bg-brand-900/30">
                      <Icon className="size-5 text-brand-600 dark:text-brand-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold leading-snug">{l.name}</h3>
                      <p className="text-xs text-surface-500">
                        {typeLabel(t, l.list_type)} · {l.items.length} {t.daily.items}
                      </p>
                    </div>
                    <button
                      onClick={() => setOpenListId(l.id)}
                      className="rounded-lg p-1.5 text-surface-400 hover:text-brand-600"
                      aria-label={t.common.edit}
                    >
                      <Edit3 className="size-4" />
                    </button>
                    <button
                      onClick={async () => {
                        await api.post(`/api/health/lists/${l.id}`);
                        refresh();
                      }}
                      className="rounded-lg p-1.5 text-surface-400 hover:text-brand-600"
                      aria-label={t.common.duplicate}
                    >
                      <Copy className="size-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(t.common.confirmDelete)) return;
                        await api.del(`/api/health/lists/${l.id}`);
                        refresh();
                      }}
                      className="rounded-lg p-1.5 text-surface-400 hover:text-danger"
                      aria-label={t.common.delete}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {l.items.length > 0 ? (
                    <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                      {l.items.slice(0, 6).map((it) => (
                        <li
                          key={it.id}
                          className="flex items-center gap-2 rounded-lg bg-surface-100 px-2 py-1 dark:bg-surface-800"
                        >
                          {it.rating ? <RatingBadge rating={it.rating} size="sm" /> : null}
                          <span className="truncate">{it.name}</span>
                        </li>
                      ))}
                      {l.items.length > 6 ? (
                        <li className="text-xs text-surface-500">+ {l.items.length - 6}</li>
                      ) : null}
                    </ul>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <CreateListModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => {
          setCreateOpen(false);
          refresh();
        }}
      />
      <AiGenerateModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onSaved={() => {
          setAiOpen(false);
          refresh();
        }}
      />
      <ListDetailModal list={openList} onClose={() => setOpenListId(null)} onChanged={refresh} />
    </div>
  );
}

function CreateListModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [type, setType] = useState<WeeklyList["list_type"]>("shopping");

  const save = useMutation({
    mutationFn: () => api.post("/api/health/lists", { name, list_type: type }),
    onSuccess: () => {
      setName("");
      setType("shopping");
      onSaved();
    },
  });

  const types: { key: WeeklyList["list_type"]; labelKey: keyof typeof t.lists.types }[] = [
    { key: "shopping", labelKey: "shopping" },
    { key: "weekly", labelKey: "weekly" },
    { key: "meal_prep", labelKey: "mealPrep" },
    { key: "recommended", labelKey: "recommended" },
    { key: "avoid", labelKey: "avoid" },
  ];

  return (
    <Modal open={open} onClose={onClose} title={t.lists.newList}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          save.mutate();
        }}
        className="space-y-3"
      >
        <div>
          <Label>{t.lists.listName}</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <Label>{t.lists.listType}</Label>
          <div className="grid grid-cols-2 gap-2">
            {types.map((tp) => (
              <button
                type="button"
                key={tp.key}
                onClick={() => setType(tp.key)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium",
                  type === tp.key
                    ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                    : "border-surface-200 dark:border-surface-800",
                )}
              >
                {t.lists.types[tp.labelKey]}
              </button>
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

function AiGenerateModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, lang } = useI18n();
  const [preset, setPreset] = useState<ListPreset>("general");
  const [type, setType] = useState<WeeklyList["list_type"]>("shopping");

  const gen = useMutation({
    mutationFn: () =>
      api.post("/api/health/generate-list", {
        preset,
        list_type: type,
        lang,
      }),
    onSuccess: onSaved,
  });

  const presets: ListPreset[] = [
    "cut",
    "muscle",
    "general",
    "teens",
    "family",
    "energy",
    "brain",
    "sleep",
  ];

  return (
    <Modal open={open} onClose={onClose} title={t.lists.aiGenerate}>
      <div className="space-y-3">
        <p className="text-sm text-surface-500">{t.lists.aiHint}</p>
        <div>
          <Label>{t.lists.listType}</Label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["shopping", "shopping"],
                ["weekly", "weekly"],
                ["meal_prep", "mealPrep"],
                ["recommended", "recommended"],
                ["avoid", "avoid"],
              ] as const
            ).map(([k, lk]) => (
              <button
                type="button"
                key={k}
                onClick={() => setType(k)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium",
                  type === k
                    ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                    : "border-surface-200 dark:border-surface-800",
                )}
              >
                {t.lists.types[lk]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>{t.lists.aiHint}</Label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setPreset(p)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium",
                  preset === p
                    ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                    : "border-surface-200 dark:border-surface-800",
                )}
              >
                {t.lists.presets[p]}
              </button>
            ))}
          </div>
        </div>
        {gen.isError ? (
          <p className="text-sm text-danger">{(gen.error as Error)?.message}</p>
        ) : null}
        <div className="flex gap-2 pt-2">
          <Button onClick={() => gen.mutate()} loading={gen.isPending} className="flex-1">
            <Sparkles className="size-4" />
            {gen.isPending ? t.lists.aiGenerating : t.lists.aiGenerate}
          </Button>
          <Button onClick={onClose} variant="ghost">
            {t.common.cancel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ListDetailModal({
  list,
  onClose,
  onChanged,
}: {
  list: FullList | null;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { t } = useI18n();
  const [newItemName, setNewItemName] = useState("");

  const addItem = useMutation({
    mutationFn: (name: string) => api.post(`/api/health/lists/${list!.id}/items`, { name }),
    onSuccess: () => {
      setNewItemName("");
      onChanged();
    },
  });

  const toggle = useMutation({
    mutationFn: (vars: { itemId: string; checked: boolean }) =>
      api.patch(`/api/health/lists/items/${vars.itemId}`, { checked: vars.checked }),
    onSuccess: onChanged,
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => api.del(`/api/health/lists/items/${itemId}`),
    onSuccess: onChanged,
  });

  const dupItem = useMutation({
    mutationFn: (itemId: string) => api.post(`/api/health/lists/items/${itemId}`),
    onSuccess: onChanged,
  });

  if (!list) return null;

  return (
    <Modal open={list !== null} onClose={onClose} title={list.name} className="max-w-lg">
      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newItemName.trim()) addItem.mutate(newItemName.trim());
          }}
          className="flex gap-2"
        >
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={t.lists.addItemPlaceholder}
          />
          <Button type="submit" loading={addItem.isPending}>
            <Plus className="size-4" />
          </Button>
        </form>

        {list.items.length === 0 ? (
          <p className="text-sm text-surface-500">{t.common.placeholderEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {list.items.map((it) => (
              <li
                key={it.id}
                className={cn(
                  "rounded-xl border p-3 dark:border-surface-800",
                  it.checked && "opacity-60",
                )}
                style={
                  it.color
                    ? { borderInlineStartColor: it.color, borderInlineStartWidth: 4 }
                    : undefined
                }
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggle.mutate({ itemId: it.id, checked: !it.checked })}
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border",
                      it.checked
                        ? "border-success bg-success text-white"
                        : "border-surface-300 dark:border-surface-700",
                    )}
                    aria-label={t.common.yes}
                  >
                    {it.checked ? <Check className="size-3.5" /> : null}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn("font-medium", it.checked && "line-through")}
                      >
                        {it.name}
                      </span>
                      {it.qty ? (
                        <span className="text-xs text-surface-500 tabular">{it.qty}</span>
                      ) : null}
                      {it.rating ? <RatingBadge rating={it.rating} size="sm" /> : null}
                    </div>
                    {it.reason ? (
                      <p className="mt-1 text-xs text-surface-500 leading-snug">{it.reason}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => dupItem.mutate(it.id)}
                      className="rounded-lg p-1 text-surface-400 hover:text-brand-600"
                      aria-label={t.common.duplicate}
                    >
                      <Copy className="size-4" />
                    </button>
                    <button
                      onClick={() => removeItem.mutate(it.id)}
                      className="rounded-lg p-1 text-surface-400 hover:text-danger"
                      aria-label={t.common.delete}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
