"use client";
import { Plus, Dumbbell, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { T } from "@/lib/constants";

interface Props {
  onAddMeal: () => void;
  onAddActivity: () => void;
  onClearDay: () => void;
}

export function QuickActions({ onAddMeal, onAddActivity, onClearDay }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button onClick={onAddMeal} size="lg" className="justify-start">
        <Plus className="size-5" />
        {T.dash.addMeal}
      </Button>
      <Button onClick={onAddActivity} size="lg" variant="secondary" className="justify-start">
        <Dumbbell className="size-5" />
        {T.dash.addActivity}
      </Button>
      <Button
        onClick={onClearDay}
        size="md"
        variant="outline"
        className="justify-start col-span-2 text-danger border-danger/30"
      >
        <Trash2 className="size-4" />
        {T.dash.clearDay}
      </Button>
    </div>
  );
}
