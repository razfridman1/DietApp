"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TopBar } from "@/components/nav/TopBar";
import { HeroCards } from "@/components/dashboard/HeroCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MealsList } from "@/components/dashboard/MealsList";
import { ActivitiesList } from "@/components/dashboard/ActivitiesList";
import { AddMealModal } from "@/components/modals/AddMealModal";
import { AddActivityModal } from "@/components/modals/AddActivityModal";
import { EditMealModal } from "@/components/modals/EditMealModal";
import { EditActivityModal } from "@/components/modals/EditActivityModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/client-api";
import { fmtDate, todayISO } from "@/lib/format";
import { T } from "@/lib/constants";
import type { TodayPayload, Meal, Activity } from "@/types";

export default function DashboardPage() {
  const qc = useQueryClient();
  const [mealOpen, setMealOpen] = useState(false);
  const [actOpen, setActOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["today"],
    queryFn: () => api.get<TodayPayload>("/api/daily/today"),
  });

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["today"] });
  }

  async function deleteMeal(id: string) {
    await api.del(`/api/meals/${id}`);
    refresh();
  }
  async function deleteActivity(id: string) {
    await api.del(`/api/activities/${id}`);
    refresh();
  }
  async function clearDay() {
    await api.post("/api/daily/clear");
    setConfirmClear(false);
    refresh();
  }

  const today = todayISO();
  const greeting = data?.profile.display_name
    ? `${T.dash.helloUser}, ${data.profile.display_name}`
    : T.dash.title;

  return (
    <>
      <TopBar title={greeting} />
      <div className="space-y-4 pt-4">
        <p className="text-xs text-surface-500 dark:text-surface-300 tabular">
          {fmtDate(today)}
        </p>

        {isLoading ? (
          <Card className="h-40 animate-pulse" />
        ) : isError ? (
          <Card className="text-sm text-danger">
            {(error as Error)?.message || T.errors.generic}
          </Card>
        ) : data ? (
          <>
            <HeroCards data={data} />
            <QuickActions
              onAddMeal={() => setMealOpen(true)}
              onAddActivity={() => setActOpen(true)}
              onClearDay={() => setConfirmClear(true)}
            />
            <MealsList
              meals={data.meals}
              onDelete={deleteMeal}
              onEdit={(m) => setEditingMeal(m)}
            />
            <ActivitiesList
              activities={data.activities}
              onDelete={deleteActivity}
              onEdit={(a) => setEditingActivity(a)}
            />
          </>
        ) : null}
      </div>

      <AddMealModal
        open={mealOpen}
        onClose={() => setMealOpen(false)}
        onSaved={() => {
          setMealOpen(false);
          refresh();
        }}
      />
      <AddActivityModal
        open={actOpen}
        onClose={() => setActOpen(false)}
        onSaved={() => {
          setActOpen(false);
          refresh();
        }}
      />
      <EditMealModal
        open={editingMeal !== null}
        meal={editingMeal}
        onClose={() => setEditingMeal(null)}
        onSaved={() => {
          setEditingMeal(null);
          refresh();
        }}
      />
      <EditActivityModal
        open={editingActivity !== null}
        activity={editingActivity}
        onClose={() => setEditingActivity(null)}
        onSaved={() => {
          setEditingActivity(null);
          refresh();
        }}
      />
      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title={T.dash.clearDay}>
        <p className="mb-4 text-sm text-surface-600 dark:text-surface-300">
          האם אתה בטוח שברצונך למחוק את כל הארוחות והפעילויות של היום?
        </p>
        <div className="flex gap-2">
          <Button onClick={clearDay} variant="danger" className="flex-1" size="lg">
            {T.dash.confirm}
          </Button>
          <Button onClick={() => setConfirmClear(false)} variant="ghost" size="lg">
            {T.dash.cancel}
          </Button>
        </div>
      </Modal>
    </>
  );
}
