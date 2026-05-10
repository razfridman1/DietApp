"use client";
import { useRef, useState } from "react";
import { Camera, Mic, Sparkles, Square, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { api } from "@/lib/client-api";
import { T } from "@/lib/constants";
import { useVoiceInput } from "@/lib/hooks/useVoiceInput";
import { compressImageFile, type CompressedImage } from "@/lib/image";
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

  // Voice dictation — Hebrew (he-IL). Falls back gracefully if the browser
  // doesn't support the Web Speech API (button is hidden in that case).
  const voice = useVoiceInput({ lang: "he-IL", continuous: true, interimResults: true });

  // Photo analysis — user picks (or shoots) an image, we compress it client-side
  // and send to the vision endpoint which fills in name + macros.
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState<CompressedImage | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);

  function openPhotoPicker() {
    fileInputRef.current?.click();
  }

  function clearImage() {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onPhotoChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    setError(null);
    if (voice.isListening) voice.stop();

    let compressed: CompressedImage;
    try {
      compressed = await compressImageFile(file, { maxEdge: 1280, quality: 0.85 });
    } catch {
      setError(T.ai.photoError);
      return;
    }
    setImage(compressed);

    // Auto-analyze right away so the user doesn't have to press another button.
    setAnalyzingImage(true);
    try {
      const gramsHint = grams ? Number(grams) : undefined;
      const r = await api.post<ParsedMeal>("/api/ai/parse-meal-image", {
        imageBase64: compressed.base64,
        mediaType: compressed.mediaType,
        grams: gramsHint && gramsHint > 0 ? gramsHint : undefined,
        text: text.trim() || undefined,
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
      setError(e?.message || T.ai.photoError);
    } finally {
      setAnalyzingImage(false);
    }
  }

  /** Toggle voice recording. When stopping, the finalized transcript is
   *  appended to whatever the user has already typed in the textarea. */
  function toggleVoice() {
    setError(null);
    if (voice.isListening) {
      voice.stop();
      return;
    }
    voice.start({
      onFinal: (finalText) => {
        if (!finalText) return;
        setText((prev) => (prev ? prev.trimEnd() + " " + finalText : finalText));
      },
    });
  }

  function reset() {
    if (voice.isListening) voice.stop();
    voice.reset();
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
    setImage(null);
    setAnalyzingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /** Map Web Speech API error codes to a friendly Hebrew message. */
  function voiceErrorMessage(code: string | null): string | null {
    if (!code) return null;
    if (code === "not-allowed" || code === "service-not-allowed") {
      return T.ai.voicePermissionDenied;
    }
    if (code === "unsupported") return T.ai.voiceUnsupported;
    return T.ai.voiceError;
  }

  async function aiParse() {
    if (voice.isListening) voice.stop();
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
            <div className="relative">
              <Textarea
                id="meal-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder='לדוגמה: "סלט יווני גדול עם פיתה ושני שיפודי עוף"'
                className={voice.isSupported ? "pe-24" : "pe-14"}
              />
              <div className="absolute bottom-2 end-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={openPhotoPicker}
                  disabled={analyzingImage}
                  aria-label={T.ai.photoCapture}
                  title={T.ai.photoCapture}
                  className={
                    "inline-flex size-9 items-center justify-center rounded-full " +
                    "transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40 " +
                    "disabled:opacity-50 disabled:cursor-not-allowed " +
                    "bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-100 dark:hover:bg-surface-900"
                  }
                >
                  <Camera className="size-4" />
                </button>
                {voice.isSupported ? (
                  <button
                    type="button"
                    onClick={toggleVoice}
                    aria-label={voice.isListening ? T.ai.voiceStop : T.ai.voiceStart}
                    title={voice.isListening ? T.ai.voiceStop : T.ai.voiceStart}
                    className={
                      "inline-flex size-9 items-center justify-center rounded-full " +
                      "transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40 " +
                      (voice.isListening
                        ? "bg-danger text-white animate-pulse"
                        : "bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-100 dark:hover:bg-surface-900")
                    }
                  >
                    {voice.isListening ? <Square className="size-4" /> : <Mic className="size-4" />}
                  </button>
                ) : null}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onPhotoChange}
            />
            {image ? (
              <div className="mt-2 relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.dataUrl}
                  alt="meal preview"
                  className="max-h-40 rounded-xl border border-surface-200 dark:border-surface-800"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  aria-label={T.ai.photoRemove}
                  title={T.ai.photoRemove}
                  className="absolute -top-2 -end-2 inline-flex size-7 items-center justify-center rounded-full bg-surface-900 text-white shadow hover:bg-surface-800"
                >
                  <X className="size-4" />
                </button>
                {analyzingImage ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-white text-xs">
                    <span className="inline-block me-2 size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    {T.ai.photoAnalyzing}
                  </div>
                ) : null}
              </div>
            ) : null}
            {voice.isListening ? (
              <p className="mt-1 flex items-center gap-2 text-xs text-danger">
                <span className="inline-block size-2 rounded-full bg-danger animate-pulse" />
                {voice.interim ? `"${voice.interim}"` : T.ai.voiceListening}
              </p>
            ) : voice.error ? (
              <p className="mt-1 text-xs text-danger">{voiceErrorMessage(voice.error)}</p>
            ) : null}
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
