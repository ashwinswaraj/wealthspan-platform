import { useCallback, useEffect, useRef, useState } from "react";

interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type Ctor = new () => Recognition;

const ctor = (): Ctor | null => {
  const w = window as unknown as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

/** Voice to text with the browser's own recognizer (no audio leaves our code). `error` is a plain sentence for the person. */
export function useSpeechInput() {
  const rec = useRef<Recognition | null>(null);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const supported = typeof window !== "undefined" && ctor() !== null;

  const start = useCallback(() => {
    const C = ctor();
    if (!C) {
      setError("Voice typing isn't supported in this browser. Try Chrome.");
      return false;
    }
    setError("");
    setText("");
    const r = new C();
    r.lang = "en-IN";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) =>
      setText(
        Array.from(e.results)
          .map((x) => x[0].transcript)
          .join(" ")
          .trim(),
      );
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed")
        setError("Microphone permission is blocked. Allow it in your browser settings.");
      else if (e.error && e.error !== "no-speech" && e.error !== "aborted")
        setError("Couldn't hear you. Please try again.");
    };
    r.onend = () => setListening(false);
    rec.current = r;
    try {
      r.start();
      setListening(true);
      return true;
    } catch {
      setError("Couldn't start the microphone.");
      return false;
    }
  }, []);

  const stop = useCallback(() => rec.current?.stop(), []);
  const cancel = useCallback(() => {
    rec.current?.abort();
    setListening(false);
    setText("");
  }, []);
  useEffect(() => () => rec.current?.abort(), []);
  return { supported, listening, text, error, start, stop, cancel };
}
