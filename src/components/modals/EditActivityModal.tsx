"use client";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/client-api";
import { T } from "@/lib/constants";
import type { Activity, ActivityType, Intensity } from "@/types";

interface Props {
  open: boolean;
  activity: Activity | null;
  onClose: () => void;
  onSaved: () => void;
}

export function EditActivityModal({ open, activity, onClose, onSaved }: Props) {
  const [type, setType] = useState<ActivityType>("walk");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<string>("");
  const [intensity, setIntensity] = useState<Intensity>("moderate");
  const [calories, setCalories] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !activity) return;
    setType(activity.type);
    setDescription(activity.description ?? "");
    setDuration(String(activity.duration_min));
    setIntensity(activity.intensity);
    setCalories(String(activity.calories_burned));
    setError(null);
  }, [open, activity]);

  async function save() {
    if (!activity) return;
    if (!duration || !calories) {
      setError(T.errors.missing);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/api/activities/${activity.id}`, {
        type,
        description: description || null,
        duration_min: Number(duration),
        intensity,
        calories_burned: Number(calories),
      });
      onSaved();
    } catch (e: any) {
      setError(e?.message || T.errors.generic);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={T.dash.editActivity}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="ea-type">סוג</Label>
            <Select id="ea-type" value={type} onChange={(e) => setType(e.target.value as ActivityType)}>
              {(["walk", "run", "gym", "swim", "cycle", "yoga", "other"] as ActivityType[]).map((t) => (
                <option key={t} value={t}>
                  {T.activityType[t]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="ea-int">{T.dash.intensity}</Label>
            <Select id="ea-int" value={intensity} onChange={(e) => setIntensity(e.target.value as Intensity)}>
              {(["low", "moderate", "high"] as Intensity[]).map((t) => (
                <option key={t} value={t}>
                  {T.intensity[t]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="ea-dur">{T.dash.minutes}</Label>
            <Input id="ea-dur" type="number" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="ea-cal">קלוריות נשרפו</Label>
            <Input id="ea-cal" type="number" inputMode="numeric" value={calories} onChange={(e) => setCalories(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="ea-desc">תיאור (אופציונלי)</Label>
            <Input id="ea-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
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
