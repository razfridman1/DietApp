"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  CalendarDays,
  Brain,
  Target,
  ChefHat,
  FileText,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { T } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/provider";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function BottomNav() {
  const pathname = usePathname();
  const { t, isRTL, lang } = useI18n();

  const enLabels = {
    today: "Today",
    weekly: "Weekly",
    monthly: "Monthly",
    insights: "Insights",
    goal: "Goal",
    mealIdeas: "Meals",
    reports: "Reports",
  };

  const items: NavItem[] = [
    { href: "/dashboard", label: lang === "he" ? T.nav.today : enLabels.today, icon: Home },
    { href: "/health", label: t.health, icon: HeartPulse },
    { href: "/weekly", label: lang === "he" ? T.nav.weekly : enLabels.weekly, icon: BarChart3 },
    { href: "/monthly", label: lang === "he" ? T.nav.monthly : enLabels.monthly, icon: CalendarDays },
    { href: "/insights", label: lang === "he" ? T.nav.insights : enLabels.insights, icon: Brain },
    { href: "/goal", label: lang === "he" ? T.nav.goal : enLabels.goal, icon: Target },
    { href: "/meal-ideas", label: lang === "he" ? T.nav.mealIdeas : enLabels.mealIdeas, icon: ChefHat },
    { href: "/reports", label: lang === "he" ? T.nav.reports : enLabels.reports, icon: FileText },
  ];

  return (
    <nav
      dir={isRTL ? "rtl" : "ltr"}
      className="fixed bottom-0 inset-x-0 z-40 border-t border-surface-200 bg-white/90 backdrop-blur dark:bg-surface-900/90 dark:border-surface-800"
    >
      <ul className="mx-auto flex max-w-2xl overflow-x-auto sm:grid sm:grid-cols-8 sm:overflow-visible">
        {items.map((it) => {
          const active = pathname === it.href || pathname?.startsWith(it.href + "/");
          const Icon = it.icon;
          return (
            <li key={it.href} className="min-w-[64px] shrink-0 sm:min-w-0">
              <Link
                href={it.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] leading-tight",
                  active
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-surface-500 dark:text-surface-300",
                )}
              >
                <Icon className={cn("size-5", active && "stroke-[2.4]")} />
                <span className="truncate">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
