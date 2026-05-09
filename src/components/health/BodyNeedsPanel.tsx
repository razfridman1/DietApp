"use client";

import { useMemo, useState } from "react";
import { Search, Heart, ChevronDown } from "lucide-react";
import { Card, CardSubtle, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useI18n } from "@/lib/i18n/provider";
import { NUTRIENTS, type Nutrient, type NutrientCategory } from "@/lib/health/bodyNeeds";
import { cn } from "@/lib/utils";

const CATS: NutrientCategory[] = [
  "vitamins",
  "minerals",
  "antioxidants",
  "protein",
  "omega3",
  "fiber",
  "water",
  "electrolytes",
  "probiotics",
  "goodFats",
];

export function BodyNeedsPanel() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<NutrientCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const norm = q.trim().toLowerCase();
    return NUTRIENTS.filter((n) => {
      if (activeCat !== "all" && n.category !== activeCat) return false;
      if (!norm) return true;
      return (
        n.name.he.toLowerCase().includes(norm) ||
        n.name.en.toLowerCase().includes(norm) ||
        n.role.he.toLowerCase().includes(norm) ||
        n.role.en.toLowerCase().includes(norm)
      );
    });
  }, [q, activeCat]);

  return (
    <div className="space-y-4">
      <Card className="border-brand-200 bg-brand-50/40 dark:bg-brand-900/20 dark:border-brand-900">
        <div className="flex items-start gap-3">
          <Heart className="size-5 text-brand-600 mt-0.5 shrink-0" />
          <div>
            <CardTitle>{t.bodyNeeds.title}</CardTitle>
            <CardSubtle>{t.bodyNeeds.subtitle}</CardSubtle>
          </div>
        </div>
      </Card>

      <Card>
        <div className="relative">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.bodyNeeds.searchPlaceholder}
          />
          <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 size-4 text-surface-400 ltr:right-3 rtl:left-3" />
        </div>

        <div className="mt-3 -mx-4 overflow-x-auto px-4">
          <div className="flex w-max gap-1.5">
            <CategoryChip
              active={activeCat === "all"}
              onClick={() => setActiveCat("all")}
              label={lang === "he" ? "הכל" : "All"}
            />
            {CATS.map((c) => (
              <CategoryChip
                key={c}
                active={activeCat === c}
                onClick={() => setActiveCat(c)}
                label={t.bodyNeeds.categories[c]}
              />
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="text-sm text-surface-500">{t.common.placeholderEmpty}</Card>
      ) : (
        <ul className="space-y-3">
          {filtered.map((n) => (
            <NutrientCard
              key={n.id}
              nutrient={n}
              isOpen={openId === n.id}
              onToggle={() => setOpenId(openId === n.id ? null : n.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 h-8 text-xs font-medium whitespace-nowrap transition-colors",
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-surface-200 bg-white text-surface-700 hover:bg-surface-100 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-200 dark:hover:bg-surface-800",
      )}
    >
      {label}
    </button>
  );
}

function NutrientCard({
  nutrient,
  isOpen,
  onToggle,
}: {
  nutrient: Nutrient;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { t, lang } = useI18n();
  const name = nutrient.name[lang];
  const role = nutrient.role[lang];
  const deficiency = nutrient.deficiency[lang];
  const excess = nutrient.excess[lang];

  return (
    <li>
      <Card className="overflow-hidden transition-shadow" style={{ borderInlineStartColor: nutrient.color, borderInlineStartWidth: 4 }}>
        <button
          onClick={onToggle}
          className="-m-4 flex w-[calc(100%+2rem)] flex-col gap-3 p-4 text-start"
        >
          <div className="flex items-center gap-3">
            <div
              className="grid size-12 shrink-0 place-items-center rounded-2xl text-white text-base font-bold"
              style={{ backgroundColor: nutrient.color }}
              aria-hidden
            >
              {name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold leading-snug">{name}</h3>
              <p className="text-xs text-surface-500 line-clamp-2">{role}</p>
            </div>
            <div className="shrink-0 text-end">
              <div className="text-[10px] text-surface-500">
                {t.bodyNeeds.audience.adult}
              </div>
              <div
                className="rounded-full px-2 py-0.5 text-xs font-bold tabular text-white"
                style={{ backgroundColor: nutrient.color }}
              >
                {nutrient.daily.adult}
              </div>
            </div>
            <ChevronDown
              className={cn(
                "size-5 shrink-0 text-surface-400 transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </div>

          {/* Always-visible food chip preview (top 4) */}
          <div className="-mx-4 overflow-x-auto px-4">
            <ul className="flex w-max gap-1.5">
              {nutrient.sources.slice(0, 4).map((s, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1.5 rounded-full border border-surface-200 bg-surface-50 px-2.5 py-1 text-xs dark:border-surface-800 dark:bg-surface-800"
                >
                  <span className="font-medium">{s.food[lang]}</span>
                  <span className="text-[10px] text-surface-500 tabular">
                    {s.amount[lang]}
                  </span>
                </li>
              ))}
              {nutrient.sources.length > 4 ? (
                <li className="self-center text-xs text-surface-500">
                  + {nutrient.sources.length - 4}
                </li>
              ) : null}
            </ul>
          </div>
        </button>

        {isOpen ? (
          <div className="mt-4 space-y-4 border-t border-surface-200 pt-4 dark:border-surface-800">
            <Row label={t.bodyNeeds.role}>{role}</Row>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-500">
                {t.bodyNeeds.dailyAmount}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Cell title={t.bodyNeeds.audience.child} value={nutrient.daily.child} />
                <Cell title={t.bodyNeeds.audience.teen} value={nutrient.daily.teen} />
                <Cell title={t.bodyNeeds.audience.adult} value={nutrient.daily.adult} />
                <Cell title={t.bodyNeeds.audience.athlete} value={nutrient.daily.athlete} />
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-500">
                {t.bodyNeeds.sources}{" "}
                <span className="text-surface-400 normal-case">
                  ({t.bodyNeeds.howMuch})
                </span>
              </div>
              <ul className="space-y-2">
                {nutrient.sources.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-xl border border-surface-200 px-3 py-2 text-sm dark:border-surface-800"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: nutrient.color }}
                      />
                      <span className="font-medium truncate">{s.food[lang]}</span>
                    </div>
                    <span
                      className="rounded-full bg-surface-100 px-2 py-0.5 text-xs tabular text-surface-700 dark:bg-surface-800 dark:text-surface-200"
                    >
                      {s.amount[lang]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Row label={t.bodyNeeds.deficiency} tone="danger">
              {deficiency}
            </Row>
            <Row label={t.bodyNeeds.excess} tone="warn">
              {excess}
            </Row>
          </div>
        ) : null}
      </Card>
    </li>
  );
}

function Row({
  label,
  children,
  tone,
}: {
  label: string;
  children: React.ReactNode;
  tone?: "danger" | "warn";
}) {
  return (
    <div>
      <div
        className={cn(
          "mb-1 text-xs font-semibold uppercase tracking-wide",
          tone === "danger" ? "text-danger" : tone === "warn" ? "text-warn" : "text-surface-500",
        )}
      >
        {label}
      </div>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function Cell({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-100 p-2 dark:bg-surface-800">
      <div className="text-[10px] text-surface-500">{title}</div>
      <div className="text-sm font-bold tabular">{value}</div>
    </div>
  );
}
