"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/client-api";
import { T } from "@/lib/constants";
import type { ActivityType, Intensity } from "@/types";
import type { ParsedActivity } from "@/lib/ai/parseActivity";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function AddActivityModal({ open, onClose, onSaved }: Props) {
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsed, setParsed] = useState<ParsedActivity | null>(null);
  const [type, setType] = useState<ActivityType>("walk");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<string>("");
  const [intensity, setIntensity] = useState<Intensity>("moderate");
  const [calories, setCalories] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setText("");
    setParsed(null);
    setType("walk");
    setDescription("");
    setDuration("");
    setIntensity("moderate");
    setCalories("");
    setError(null);
  }

  async function aiParse() {
    if (text.trim().length < 2) return;
    setParsing(true);
    setError(null);
    try {
      const r = await api.post<ParsedActivity>("/api/ai/parse-activity", { text });
      setParsed(r);
      setType(r.type);
      setDescription(r.description);
      setDuration(String(r.duration_min));
      setIntensity(r.intensity);
      setCalories(String(r.calories_burned));
    } catch (e: any) {
      setError(e?.message || T.ai.parseFailed);
    } finally {
      setParsing(false);
    }
  }

  async function save() {
    if (!duration || !calories) {
      setError(T.errors.missing);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.post("/api/activities", {
        type,
        description: description || null,
        duration_min: Number(duration),
        intensity,
        calories_burned: Number(calories),
        ai_generated: parsed != null,
      });
      reset();
      onSaved();
    } catch (e: any) {
      setError(e?.message || T.errors.generic);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={T.dash.addActivity}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="act-text">{T.ai.parseActivityHint}</Label>
          <Textarea
            id="act-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='לדוגמה: "אימון רגליים 50 דקות עצימות גבוהה"'
          />
          <Button
            onClick={aiParse}
            loading={parsing}
            disabled={text.trim().length < 2}
            className="mt-2 w-full"
            variant="secondary"
          >
            <Sparkles className="size-4" />
            {parsing ? T.ai.parsing : "ניתוח עם AI"}
          </Button>
        </div>

        <div className="border-t border-surface-200 dark:border-surface-800 pt-4 space-y-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium">
              {parsed ? T.ai.detected : T.ai.manual}
            </span>
            {parsed ? (
              <span className="text-xs text-surface-500">
                ביטחון {Math.round(parsed.confidence * 100)}%
              </span>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="a-type">סוג</Label>
              <Select id="a-type" value={type} onChange={(e) => setType(e.target.value as ActivityType)}>
                {(["walk", "run", "gym", "swim", "cycle", "yoga", "other"] as ActivityType[]).map((t) => (
                  <option key={t} value={t}>
                    {T.activityType[t]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="a-int">{T.dash.intensity}</Label>
              <Select id="a-int" value={intensity} onChange={(e) => setIntensity(e.target.value as Intensity)}>
                {(["low", "moderate", "high"] as Intensity[]).map((t) => (
                  <option key={t} value={t}>
                    {T.intensity[t]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="a-dur">{T.dash.minutes}</Label>
              <Input id="a-dur" type="number" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="a-cal">קלוריות נשרפו</Label>
              <Input id="a-cal" type="number" inputMode="numeric" value={calories} onChange={(e) => setCalories(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="a-desc">תיאור (אופציונלי)</Label>
              <Input id="a-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex gap-2">
          <Button onClick={save} loading={saving} className="flex-1" size="lg">
            {T.dash.save}
          </Button>
          <Button
            onClick={() => {
              reset();
              onClose();
            }}
            variant="ghost"
            size="lg"
          >
            {T.dash.cancel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
