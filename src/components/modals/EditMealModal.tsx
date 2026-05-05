"use client";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { api } from "@/lib/client-api";
import { T } from "@/lib/constants";
import type { Meal } from "@/types";

interface Props {
  open: boolean;
  meal: Meal | null;
  onClose: () => void;
  onSaved: () => void;
}

export function EditMealModal({ open, meal, onClose, onSaved }: Props) {
  const [name, setName] = useState("");
  const [grams, setGrams] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [protein, setProtein] = useState<string>("");
  const [carbs, setCarbs] = useState<string>("");
  const [fats, setFats] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Snapshot of the original values (used as the proportional baseline when
  // the user edits grams) — refreshed every time the modal opens with a meal.
  const [baseline, setBaseline] = useState<{
    grams: number | null;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  } | null>(null);

  useEffect(() => {
    if (!open || !meal) return;
    setName(meal.name);
    setGrams(meal.grams != null ? String(meal.grams) : "");
    setCalories(String(meal.calories));
    setProtein(String(meal.protein));
    setCarbs(String(meal.carbs));
    setFats(String(meal.fats));
    setBaseline({
      grams: meal.grams,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
    });
    setError(null);
  }, [open, meal]);

  /**
   * Editing grams rescales calories + macros proportionally to the original
   * stored values. If the meal had no grams, this is a no-op (manual edits only).
   */
  function onGramsChange(v: string) {
    setGrams(v);
    if (!baseline || !baseline.grams || baseline.grams <= 0) return;
    if (v === "" || v == null) return;
    const newG = Number(v);
    if (!isFinite(newG) || newG <= 0) return;
    const ratio = newG / baseline.grams;
    setCalories(String(Math.round(baseline.calories * ratio)));
    setProtein(String(Math.round(baseline.protein * ratio)));
    setCarbs(String(Math.round(baseline.carbs * ratio)));
    setFats(String(Math.round(baseline.fats * ratio)));
  }

  async function save() {
    if (!meal) return;
    if (!name || !calories) {
      setError(T.errors.missing);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/api/meals/${meal.id}`, {
        name,
        grams: grams ? Number(grams) : null,
        calories: Number(calories),
        protein: Number(protein || 0),
        carbs: Number(carbs || 0),
        fats: Number(fats || 0),
      });
      onSaved();
    } catch (e: any) {
      setError(e?.message || T.errors.generic);
    } finally {
      setSaving(false);
    }
  }

  const canScale = baseline?.grams != null && baseline.grams > 0;

  return (
    <Modal open={open} onClose={onClose} title={T.dash.editMeal}>
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="em-name">שם</Label>
            <Input id="em-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="em-grams">כמות בגרמים (אופציונלי)</Label>
            <Input
              id="em-grams"
              type="number"
              inputMode="numeric"
              value={grams}
              onChange={(e) => onGramsChange(e.target.value)}
            />
            {canScale ? (
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-300">
                עריכה תעדכן אוטומטית את הקלוריות והמקרו פרופורציונלית
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="em-cal">קלוריות</Label>
              <Input id="em-cal" type="number" inputMode="numeric" value={calories} onChange={(e) => setCalories(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="em-p">חלבון (ג׳)</Label>
              <Input id="em-p" type="number" inputMode="numeric" value={protein} onChange={(e) => setProtein(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="em-c">פחמימות (ג׳)</Label>
              <Input id="em-c" type="number" inputMode="numeric" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="em-f">שומנים (ג׳)</Label>
              <Input id="em-f" type="number" inputMode="numeric" value={fats} onChange={(e) => setFats(e.target.value)} />
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex gap-2">
          <Button onClick={save} loading={saving} className="flex-1" size="lg">
            {T.dash.save}
          </Button>
          <Button onClick={onClose} variant="ghost" size="lg">
            {T.dash.cancel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
