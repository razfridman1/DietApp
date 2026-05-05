"use client";
import { Trash2, Sparkles, Footprints, Dumbbell as Dumb, Bike, Waves, PersonStanding, Activity as ActivityIcon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { fmtNum, fmtTime } from "@/lib/format";
import { T } from "@/lib/constants";
import type { Activity, ActivityType } from "@/types";

const ICONS: Record<ActivityType, any> = {
  walk: Footprints,
  run: ActivityIcon,
  gym: Dumb,
  swim: Waves,
  cycle: Bike,
  yoga: PersonStanding,
  other: ActivityIcon,
};

export function ActivitiesList({
  activities,
  onDelete,
}: {
  activities: Activity[];
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{T.dash.activitiesLog}</CardTitle>
        <span className="text-xs text-surface-500">{activities.length}</span>
      </CardHeader>
      {activities.length === 0 ? (
        <p className="text-sm text-surface-500 dark:text-surface-300">{T.dash.noActivities}</p>
      ) : (
        <ul className="divide-y divide-surface-200 dark:divide-surface-800">
          {activities.map((a) => {
            const Icon = ICONS[a.type] ?? ActivityIcon;
            return (
              <li key={a.id} className="flex items-start justify-between gap-3 py-3">
                <div className="flex flex-1 min-w-0 items-start gap-3">
                  <div className="mt-0.5 rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-medium">
                        {a.description || T.activityType[a.type]}
                      </span>
                      {a.ai_generated ? <Sparkles className="size-3.5 text-brand-500" /> : null}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-surface-500 dark:text-surface-300 tabular">
                      <span>{fmtTime(a.performed_at)}</span>
                      <span>· {fmtNum(a.duration_min)} דק׳</span>
                      <span>· עצימות {T.intensity[a.intensity]}</span>
                      <span>· {fmtNum(a.calories_burned)} קק״ל</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(a.id)}
                  className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 hover:text-danger dark:hover:bg-surface-800"
                  aria-label={T.dash.delete}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
