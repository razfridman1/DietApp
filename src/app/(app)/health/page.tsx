"use client";

import { useState } from "react";
import {
  Apple,
  Heart,
  Salad,
  ListChecks,
  StickyNote,
  Bot,
} from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { HealthTabs } from "@/components/health/HealthTabs";
import { FoodsPanel } from "@/components/health/FoodsPanel";
import { BodyNeedsPanel } from "@/components/health/BodyNeedsPanel";
import { DailyIntakePanel } from "@/components/health/DailyIntakePanel";
import { WeeklyListsPanel } from "@/components/health/WeeklyListsPanel";
import { NotesPanel } from "@/components/health/NotesPanel";
import { AssistantPanel } from "@/components/health/AssistantPanel";
import { useI18n } from "@/lib/i18n/provider";

type SubTab =
  | "dailyIntake"
  | "foods"
  | "bodyNeeds"
  | "weeklyLists"
  | "notes"
  | "aiAssistant";

export default function HealthPage() {
  const { t } = useI18n();
  // Always open Daily Intake first when entering /health.
  const [active, setActive] = useState<SubTab>("dailyIntake");

  function pick(k: SubTab) {
    setActive(k);
  }

  // Tab order: Daily intake first (rightmost in RTL).
  const tabs = [
    { key: "dailyIntake", label: t.tabs.dailyIntake, icon: Salad },
    { key: "foods", label: t.tabs.foods, icon: Apple },
    { key: "bodyNeeds", label: t.tabs.bodyNeeds, icon: Heart },
    { key: "weeklyLists", label: t.tabs.weeklyLists, icon: ListChecks },
    { key: "notes", label: t.tabs.notes, icon: StickyNote },
    { key: "aiAssistant", label: t.tabs.aiAssistant, icon: Bot },
  ];

  return (
    <>
      <TopBar title={t.health} />
      <div className="space-y-4 pt-4">
        <HealthTabs
          tabs={tabs}
          active={active}
          onChange={(k) => pick(k as SubTab)}
        />
        <div className="animate-[fadeIn_180ms_ease-out]">
          {active === "dailyIntake" ? <DailyIntakePanel /> : null}
          {active === "foods" ? <FoodsPanel /> : null}
          {active === "bodyNeeds" ? <BodyNeedsPanel /> : null}
          {active === "weeklyLists" ? <WeeklyListsPanel /> : null}
          {active === "notes" ? <NotesPanel /> : null}
          {active === "aiAssistant" ? <AssistantPanel /> : null}
        </div>
      </div>
    </>
  );
}
