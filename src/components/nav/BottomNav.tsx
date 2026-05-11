"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  Target,
  ChefHat,
  FileText,
  HeartPulse,
  BookOpen,
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
    analytics: "Analytics",
    goal: "Goal",
    mealIdeas: "Meals",
    reports: "Reports",
    guide: "Guide",
  };

  const items: NavItem[] = [
    { href: "/dashboard", label: lang === "he" ? T.nav.today : enLabels.today, icon: Home },
    { href: "/health", label: t.health, icon: HeartPulse },
    { href: "/analytics", label: lang === "he" ? T.nav.analytics : enLabels.analytics, icon: TrendingUp },
    { href: "/goal", label: lang === "he" ? T.nav.goal : enLabels.goal, icon: Target },
    { href: "/meal-ideas", label: lang === "he" ? T.nav.mealIdeas : enLabels.mealIdeas, icon: ChefHat },
    { href: "/reports", label: lang === "he" ? T.nav.reports : enLabels.reports, icon: FileText },
    { href: "/guide", label: lang === "he" ? T.nav.guide : enLabels.guide, icon: BookOpen },
  ];

  return (
    <nav
      dir={isRTL ? "rtl" : "ltr"}
      className="fixed bottom-0 inset-x-0 z-40 border-t border-surface-200 bg-white/90 backdrop-blur dark:bg-surface-900/90 dark:border-surface-800"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-7">
        {items.map((it) => {
          const active = pathname === it.href || pathname?.startsWith(it.href + "/");
          // Treat the legacy /weekly /monthly /insights routes as part of /analytics so the nav highlights correctly.
          const legacyActive =
            it.href === "/analytics" &&
            (pathname === "/weekly" ||
              pathname === "/monthly" ||
              pathname === "/insights" ||
              pathname?.startsWith("/weekly/") ||
              pathname?.startsWith("/monthly/") ||
              pathname?.startsWith("/insights/"));
          const isActive = active || legacyActive;
          const Icon = it.icon;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] leading-tight",
                  isActive
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-surface-500 dark:text-surface-300",
                )}
              >
                <Icon className={cn("size-5", isActive && "stroke-[2.4]")} />
                <span className="truncate">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
