"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  const next = lang === "he" ? "en" : "he";
  const label = lang === "he" ? "EN" : "HE";
  const aria = lang === "he" ? t.langToggleAriaHe : t.langToggleAriaEn;

  return (
    <button
      onClick={() => setLang(next)}
      aria-label={aria}
      title={aria}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 h-9 text-xs font-semibold tracking-wide
                 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
    >
      <Languages className="size-4" />
      <span className="tabular">{label}</span>
    </button>
  );
}
