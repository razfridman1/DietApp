"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  RefreshCw,
  Apple,
  Dumbbell,
  Activity,
  Target as TargetIcon,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/client-api";
import { T } from "@/lib/constants";
import type { AIInsight, InsightCategory, InsightSeverity } from "@/types";
import { cn } from "@/lib/utils";

const CAT_ICONS: Record<InsightCategory, any> = {
  diet: Apple,
  training: Dumbbell,
  behavior: Activity,
  goal: TargetIcon,
};

const SEV_TONE: Record<InsightSeverity, string> = {
  info: "border-brand-200 bg-brand-50/50 dark:bg-brand-900/20 dark:border-brand-900",
  warn: "border-warn/30 bg-warn/5",
  critical: "border-danger/40 bg-danger/5",
};

const SEV_ICON: Record<InsightSeverity, any> = {
  info: Info,
  warn: AlertTriangle,
  critical: AlertCircle,
};

const SEV_COLOR: Record<InsightSeverity, string> = {
  info: "text-brand-600",
  warn: "text-warn",
  critical: "text-danger",
};

export function InsightsPanel() {
  const qc = useQueryClient();
  const insightsQ = useQuery({
    queryKey: ["insights"],
    queryFn: () => api.get<{ insights: AIInsight[] }>("/api/analytics/insights"),
  });

  const refresh = useMutation({
    mutationFn: () => api.post<{ insights: AIInsight[] }>("/api/analytics/insights"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insights"] }),
  });

  const insights = insightsQ.data?.insights ?? [];

  return (
    <div className="space-y-4">
      <Card className="border-brand-200 bg-brand-50/40 dark:bg-brand-900/20 dark:border-brand-900">
        <div className="flex items-start gap-3">
          <Brain className="size-5 text-brand-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold">{T.insights.title}</h3>
            <p className="text-sm text-surface-600 dark:text-surface-300">
              {T.insights.subtitle}
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => refresh.mutate()}
            loading={refresh.isPending}
          >
            <RefreshCw className="size-4" />
            {refresh.isPending ? T.insights.refreshing : T.insights.refresh}
          </Button>
        </div>
      </Card>

      {refresh.error ? (
        <Card className="text-sm text-danger">{(refresh.error as Error).message}</Card>
      ) : null}

      {insightsQ.isLoading ? (
        <Card className="h-40 animate-pulse" />
      ) : insights.length === 0 ? (
        <Card className="text-sm text-surface-500 dark:text-surface-300">
          {T.insights.noInsights}
          <Button
            onClick={() => refresh.mutate()}
            loading={refresh.isPending}
            size="sm"
            className="mt-3 w-full"
          >
            <Brain className="size-4" />
            ניתוח עכשיו
          </Button>
        </Card>
      ) : (
        <ul className="space-y-3">
          {insights.map((ins) => {
            const Icon = CAT_ICONS[ins.category] ?? Activity;
            const SevIcon = SEV_ICON[ins.severity] ?? Info;
            return (
              <li
                key={ins.id}
                className={cn("rounded-2xl border p-4 shadow-card", SEV_TONE[ins.severity])}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-white p-2 dark:bg-surface-900 shadow-sm">
                    <Icon className="size-5 text-surface-700 dark:text-surface-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-surface-500">
                        {T.insights.cat[ins.category]}
                      </span>
                      <SevIcon className={cn("size-3.5", SEV_COLOR[ins.severity])} />
                    </div>
                    <p className="font-medium leading-relaxed">{ins.insight_text}</p>
                    {ins.recommendation ? (
                      <p className="mt-2 text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                        <span className="font-semibold">המלצה: </span>
                        {ins.recommendation}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
