"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DICT, type HealthDict, type Lang } from "./dict";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: HealthDict;
  isRTL: boolean;
}

const I18nContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "app-lang";

function readInitial(): Lang {
  if (typeof window === "undefined") return "he";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "he" || v === "en") return v;
  } catch {
    /* ignore */
  }
  return "he";
}

function applyHtmlAttrs(lang: Lang) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("lang", lang);
  root.setAttribute("dir", lang === "he" ? "rtl" : "ltr");
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // SSR / pre-mount default = Hebrew (matches the existing app).
  const [lang, setLangState] = useState<Lang>("he");

  useEffect(() => {
    const initial = readInitial();
    setLangState(initial);
    applyHtmlAttrs(initial);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    applyHtmlAttrs(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: DICT[lang],
      isRTL: lang === "he",
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Soft fallback so non-wrapped trees don't crash
    return { lang: "he", setLang: () => {}, t: DICT.he, isRTL: true };
  }
  return ctx;
}

export function useT(): HealthDict {
  return useI18n().t;
}
