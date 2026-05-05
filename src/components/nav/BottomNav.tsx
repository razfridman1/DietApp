"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, CalendarDays, Brain, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { T } from "@/lib/constants";

const items = [
  { href: "/dashboard", label: T.nav.today, icon: Home },
  { href: "/weekly", label: T.nav.weekly, icon: BarChart3 },
  { href: "/monthly", label: T.nav.monthly, icon: CalendarDays },
  { href: "/insights", label: T.nav.insights, icon: Brain },
  { href: "/goal", label: T.nav.goal, icon: Target },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      dir="rtl"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-surface-200 bg-white/90 backdrop-blur dark:bg-surface-900/90 dark:border-surface-800"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-5">
        {items.map((it) => {
          const active = pathname === it.href || pathname?.startsWith(it.href + "/");
          const Icon = it.icon;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-xs",
                  active
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-surface-500 dark:text-surface-300",
                )}
              >
                <Icon className={cn("size-5", active && "stroke-[2.4]")} />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
