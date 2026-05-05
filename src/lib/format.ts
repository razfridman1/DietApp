// Hebrew/Israel-localized formatting helpers.
import { format as fnsFormat, parseISO } from "date-fns";
import { he } from "date-fns/locale";

export const fmtNum = (n: number | null | undefined, digits = 0) =>
  n == null || isNaN(n)
    ? "—"
    : new Intl.NumberFormat("he-IL", {
        maximumFractionDigits: digits,
        minimumFractionDigits: 0,
      }).format(n);

export const fmtKcal = (n: number | null | undefined) => `${fmtNum(n)} קק״ל`;
export const fmtGrams = (n: number | null | undefined, digits = 0) =>
  `${fmtNum(n, digits)} ג׳`;
export const fmtKg = (n: number | null | undefined, digits = 1) =>
  `${fmtNum(n, digits)} ק״ג`;
export const fmtMin = (n: number | null | undefined) => `${fmtNum(n)} דקות`;

export const fmtSignedKcal = (n: number) =>
  `${n >= 0 ? "+" : ""}${fmtNum(n)} קק״ל`;

export function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function isoDate(d: Date): string {
  const tz = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function fmtDate(iso: string, fmt = "EEEE, d בMMMM"): string {
  try {
    return fnsFormat(parseISO(iso), fmt, { locale: he });
  } catch {
    return iso;
  }
}

export function fmtTime(iso: string): string {
  try {
    return fnsFormat(parseISO(iso), "HH:mm", { locale: he });
  } catch {
    return "";
  }
}

export function fmtShortDay(iso: string): string {
  try {
    return fnsFormat(parseISO(iso), "EEE d/M", { locale: he });
  } catch {
    return iso;
  }
}

export function lastNDates(n: number, endIso?: string): string[] {
  const end = endIso ? parseISO(endIso) : new Date();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    out.push(isoDate(d));
  }
  return out;
}
