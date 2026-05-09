"use client";

import { cn } from "@/lib/utils";

export interface TabSpec {
  key: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function HealthTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabSpec[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-1">
      <div className="flex w-max gap-1.5 rounded-2xl border border-surface-200 bg-white p-1
                      dark:border-surface-800 dark:bg-surface-900">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3 h-9 text-xs font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800",
              )}
              aria-pressed={isActive}
            >
              {Icon ? <Icon className="size-4" /> : null}
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
