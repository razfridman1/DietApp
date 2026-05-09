import { Heart, Dumbbell, Zap, Sparkles, Brain, Apple, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type ImpactKey = "heart" | "muscles" | "energy" | "skin" | "brain" | "satiety" | "bloodSugar";

const ICONS: Record<ImpactKey, React.ComponentType<{ className?: string }>> = {
  heart: Heart,
  muscles: Dumbbell,
  energy: Zap,
  skin: Sparkles,
  brain: Brain,
  satiety: Apple,
  bloodSugar: Activity,
};

// 5-tier vivid colour scale.
// 1 = excellent (deep green) ... 5 = very bad (red).
const TONE: Record<number, { bg: string; text: string; icon: string; ring: string }> = {
  1: { bg: "bg-emerald-500", text: "text-white",       icon: "text-emerald-600", ring: "ring-emerald-200 dark:ring-emerald-900" },
  2: { bg: "bg-lime-500",    text: "text-white",       icon: "text-lime-600",    ring: "ring-lime-200 dark:ring-lime-900"       },
  3: { bg: "bg-amber-500",   text: "text-white",       icon: "text-amber-600",   ring: "ring-amber-200 dark:ring-amber-900"     },
  4: { bg: "bg-orange-500",  text: "text-white",       icon: "text-orange-600",  ring: "ring-orange-200 dark:ring-orange-900"   },
  5: { bg: "bg-red-500",     text: "text-white",       icon: "text-red-600",     ring: "ring-red-200 dark:ring-red-900"         },
};

function levelLabel(
  v: number,
  labels: { excellent: string; good: string; neutral: string; bad: string; veryBad: string },
): string {
  const k = Math.max(1, Math.min(5, Math.round(v)));
  return k === 1 ? labels.excellent
    : k === 2 ? labels.good
    : k === 3 ? labels.neutral
    : k === 4 ? labels.bad
    : labels.veryBad;
}

function Cell({
  Icon,
  label,
  value,
  levelText,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  levelText: string;
}) {
  const v = Math.max(1, Math.min(5, Math.round(value)));
  const tone = TONE[v];
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-surface-200 bg-white px-2.5 py-2 dark:border-surface-800 dark:bg-surface-900",
      )}
    >
      <div className={cn("grid size-8 shrink-0 place-items-center rounded-lg ring-2", tone.ring)}>
        <Icon className={cn("size-4", tone.icon)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium leading-tight">{label}</div>
        <span
          className={cn(
            "mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-tight",
            tone.bg,
            tone.text,
          )}
        >
          {levelText}
        </span>
      </div>
    </div>
  );
}

export function ImpactBars({
  labels,
  effects,
  levelLabels,
}: {
  labels: { heart: string; muscles: string; energy: string; skin: string; brain: string; satiety: string; bloodSugar: string };
  effects: { heart: number; muscles: number; energy: number; skin: number; brain: number; satiety: number; bloodSugar: number };
  levelLabels: { excellent: string; good: string; neutral: string; bad: string; veryBad: string };
}) {
  const order: ImpactKey[] = ["heart", "muscles", "energy", "brain", "satiety", "skin", "bloodSugar"];
  return (
    <div className="grid grid-cols-2 gap-2">
      {order.map((k) => (
        <Cell
          key={k}
          Icon={ICONS[k]}
          label={labels[k]}
          value={effects[k]}
          levelText={levelLabel(effects[k], levelLabels)}
        />
      ))}
    </div>
  );
}
