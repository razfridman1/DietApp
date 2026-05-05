"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { api } from "@/lib/client-api";
import { T } from "@/lib/constants";
import type { ParsedMeal } from "@/lib/ai/parseMeal";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function AddMealModal({ open, onClose, onSaved }: Props) {
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsed, setParsed] = useState<ParsedMeal | null>(null);
  // Snapshot of the AI's response that we use as the "1×" baseline when
  // the user later edits the grams field — macros scale proportionally.
  const [baseline, setBaseline] = useState<ParsedMeal | null>(null);
  const [name, setName] = useState("");
  const [grams, setGrams] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [protein, setProtein] = useState<string>("");
  const [carbs, setCarbs] = useState<string>("");
  const [fats, setFats] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setText("");
    setParsed(null);
    setBaseline(null);
    setName("");
    setGrams("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFats("");
    setError(null);
  }

  async function aiParse() {
    if (text.trim().length < 2) return;
    setParsing(true);
    setError(null);
    try {
      const gramsHint = grams ? Number(grams) : undefined;
      const r = await api.post<ParsedMeal>("/api/ai/parse-meal", {
        text,
        grams: gramsHint && gramsHint > 0 ? gramsHint : undefined,
      });
      setParsed(r);
      setBaseline(r);
      setName(r.name);
      setGrams(r.grams != null ? String(r.grams) : gramsHint ? String(gramsHint) : "");
      setCalories(String(r.calories));
      setProtein(String(r.protein));
      setCarbs(String(r.carbs));
      setFats(String(r.fats));
    } catch (e: any) {
      setError(e?.message || T.ai.parseFailed);
    } finally {
      setParsing(false);
    }
  }

  /**
   * Editing grams after the AI parse rescales calories + macros proportionally
   * to the AI baseline. If there's no baseline (manual entry), it just updates
   * the grams field with no side-effects.
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
    if (!name || !calories) {
      setError(T.errors.missing);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.post("/api/meals", {
        name,
        grams: grams ? Number(grams) : null,
        calories: Number(calories),
        protein: Number(protein || 0),
        carbs: Number(carbs || 0),
        fats: Number(fats || 0),
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

  const canScale = baseline?.grams != null && baseline.grams > 0;

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={T.dash.addMeal}
    >
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="meal-text">{T.ai.parseMealHint}</Label>
            <Textarea
              id="meal-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='לדוגמה: "סלט יווני גדול עם פיתה ושני שיפודי עוף"'
            />
          </div>
          <div>
            <Label htmlFor="m-grams-hint">כמות בגרמים (אופציונלי)</Label>
            <Input
              id="m-grams-hint"
              type="number"
              inputMode="numeric"
              value={grams}
              onChange={(e) => onGramsChange(e.target.value)}
              placeholder="לדוגמה: 250"
            />
            <p className="mt-1 text-xs text-surface-500 dark:text-surface-300">
              {canScale
                ? "עריכה תעדכן אוטומטית את הקלוריות והמקרו פרופורציונלית"
                : "אם תזין/י לפני הניתוח — ה־AI יחשב לפי הכמות המדויקת"}
            </p>
          </div>
          <Button
            onClick={aiParse}
            loading={parsing}
            disabled={text.trim().length < 2}
            className="w-full"
            variant="secondary"
          >
            <Sparkles className="size-4" />
            {parsing ? T.ai.parsing : "ניתוח עם AI"}
          </Button>
        </div>

        <div className="border-t border-surface-200 dark:border-surface-800 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">
              {parsed ? T.ai.detected : T.ai.manual}
            </span>
            {parsed ? (
              <span className="text-xs text-surface-500">
                ביטחון {Math.round(parsed.confidence * 100)}%
              </span>
            ) : null}
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="m-name">שם</Label>
              <Input id="m-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="m-cal">קלוריות</Label>
                <Input id="m-cal" type="number" inputMode="numeric" value={calories} onChange={(e) => setCalories(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="m-p">חלבון (ג׳)</Label>
                <Input id="m-p" type="number" inputMode="numeric" value={protein} onChange={(e) => setProtein(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="m-c">פחמימות (ג׳)</Label>
                <Input id="m-c" type="number" inputMode="numeric" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="m-f">שומנים (ג׳)</Label>
                <Input id="m-f" type="number" inputMode="numeric" value={fats} onChange={(e) => setFats(e.target.value)} />
              </div>
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
