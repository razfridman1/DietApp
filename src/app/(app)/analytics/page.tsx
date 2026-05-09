"use client";

import { useState } from "react";
import { BarChart3, CalendarDays, Brain } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { HealthTabs } from "@/components/health/HealthTabs";
import { WeeklyPanel } from "@/components/analytics/WeeklyPanel";
import { MonthlyPanel } from "@/components/analytics/MonthlyPanel";
import { InsightsPanel } from "@/components/analytics/InsightsPanel";
import { T } from "@/lib/constants";

type SubTab = "weekly" | "monthly" | "insights";

export default function AnalyticsPage() {
  // Default to weekly view when entering /analytics.
  const [active, setActive] = useState<SubTab>("weekly");

  const tabs = [
    { key: "weekly", label: T.nav.weekly, icon: BarChart3 },
    { key: "monthly", label: T.nav.monthly, icon: CalendarDays },
    { key: "insights", label: T.nav.insights, icon: Brain },
  ];

  // Title reflects the active sub-tab so the header isn't generic.
  const title =
    active === "weekly"
      ? T.analytics.weeklyTitle
      : active === "monthly"
      ? T.analytics.monthlyTitle
      : T.insights.title;

  return (
    <>
      <TopBar title={title} />
      <div className="space-y-4 pt-4">
        <HealthTabs
          tabs={tabs}
          active={active}
          onChange={(k) => setActive(k as SubTab)}
        />
        <div className="animate-[fadeIn_180ms_ease-out]">
          {active === "weekly" ? <WeeklyPanel /> : null}
          {active === "monthly" ? <MonthlyPanel /> : null}
          {active === "insights" ? <InsightsPanel /> : null}
        </div>
      </div>
    </>
  );
}
