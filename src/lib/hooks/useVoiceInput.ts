"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useVoiceInput
 * --------------
 * Lightweight wrapper around the Web Speech API (SpeechRecognition /
 * webkitSpeechRecognition) tuned for Hebrew (`he-IL`) voice dictation.
 *
 * The API exposes:
 *   - isSupported  → true if the browser exposes a SpeechRecognition impl.
 *   - isListening  → true while a session is active.
 *   - transcript   → finalized transcript (committed text).
 *   - interim      → live partial result while the user is speaking.
 *   - error        → human-readable error string (null when fine).
 *   - start(opts)  → begin a session. Optionally pass `onFinal(text)` to
 *                    receive the finalized text when recognition ends.
 *   - stop()       → manually end the session.
 *   - reset()      → clear transcript / interim / error.
 *
 * The hook is intentionally non-opinionated about how the consumer surfaces
 * results — the consumer can listen for changes to `transcript` or pass an
 * `onFinal` callback to start().
 */

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: any) => void) | null;
  onerror: ((ev: any) => void) | null;
  onend: ((ev: any) => void) | null;
  onstart: ((ev: any) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as
    | SpeechRecognitionCtor
    | null;
}

export interface UseVoiceInputOptions {
  /** BCP-47 language tag. Defaults to Hebrew. */
  lang?: string;
  /** Whether to keep the session open until the user stops it. */
  continuous?: boolean;
  /** Whether to expose interim (live) transcript. */
  interimResults?: boolean;
}

export interface StartOptions {
  /** Receives the finalized transcript text once recognition ends. */
  onFinal?: (text: string) => void;
}

export interface UseVoiceInputApi {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interim: string;
  error: string | null;
  start: (opts?: StartOptions) => void;
  stop: () => void;
  reset: () => void;
}

export function useVoiceInput(opts: UseVoiceInputOptions = {}): UseVoiceInputApi {
  const { lang = "he-IL", continuous = true, interimResults = true } = opts;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef<string>("");
  const onFinalRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    setIsSupported(Ctor != null);
    return () => {
      const r = recognitionRef.current;
      if (r) {
        try {
          r.onresult = null;
          r.onerror = null;
          r.onend = null;
          r.onstart = null;
          r.abort();
        } catch {
          /* ignore */
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const reset = useCallback(() => {
    finalRef.current = "";
    setTranscript("");
    setInterim("");
    setError(null);
  }, []);

  const stop = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    try {
      r.stop();
    } catch {
      /* ignore — already stopped */
    }
  }, []);

  const start = useCallback(
    ({ onFinal }: StartOptions = {}) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) {
        setError("unsupported");
        return;
      }
      // If a session is already running, stop it before starting a new one.
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
        recognitionRef.current = null;
      }

      finalRef.current = "";
      setTranscript("");
      setInterim("");
      setError(null);
      onFinalRef.current = onFinal ?? null;

      const r = new Ctor();
      r.lang = lang;
      r.continuous = continuous;
      r.interimResults = interimResults;
      r.maxAlternatives = 1;

      r.onstart = () => setIsListening(true);

      r.onresult = (ev: any) => {
        let interimChunk = "";
        const results = ev.results;
        for (let i = ev.resultIndex; i < results.length; i++) {
          const res = results[i];
          const text = res[0]?.transcript ?? "";
          if (res.isFinal) {
            finalRef.current = (finalRef.current + " " + text).trim();
          } else {
            interimChunk += text;
          }
        }
        setTranscript(finalRef.current);
        setInterim(interimChunk);
      };

      r.onerror = (ev: any) => {
        const code: string = ev?.error || "error";
        if (code === "no-speech" || code === "aborted") {
          // Benign — caller's onend handler will fire.
          return;
        }
        setError(code);
      };

      r.onend = () => {
        setIsListening(false);
        const finalText = finalRef.current.trim();
        if (finalText && onFinalRef.current) {
          try {
            onFinalRef.current(finalText);
          } catch {
            /* ignore */
          }
        }
        setInterim("");
        recognitionRef.current = null;
        onFinalRef.current = null;
      };

      try {
        r.start();
        recognitionRef.current = r;
      } catch (e: any) {
        setError(e?.message || "start-failed");
        setIsListening(false);
        recognitionRef.current = null;
      }
    },
    [lang, continuous, interimResults],
  );

  return { isSupported, isListening, transcript, interim, error, start, stop, reset };
}
