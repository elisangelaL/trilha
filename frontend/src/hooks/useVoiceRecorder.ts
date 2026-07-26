"use client";

import { useCallback, useRef, useState } from "react";

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
}

function extensionFor(mimeType: string): string {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

export type VoiceRecorderStatus = "idle" | "recording" | "denied";

export interface RecordedAudio {
  file: File;
  durationSeconds: number;
}

/** Grava áudio do microfone via MediaRecorder — usado pelo botão de segurar-para-gravar do chat. */
export function useVoiceRecorder() {
  const [status, setStatus] = useState<VoiceRecorderStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSupported = typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";

  const teardown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (recorderRef.current || !isSupported) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorderRef.current = recorder;
      recorder.start();

      startedAtRef.current = Date.now();
      setElapsedMs(0);
      intervalRef.current = setInterval(() => setElapsedMs(Date.now() - startedAtRef.current), 200);
      setStatus("recording");
    } catch {
      teardown();
      setStatus("denied");
    }
  }, [isSupported, teardown]);

  /** Para a gravação e devolve o áudio. Passe `discard: true` para descartar (cancelar) sem retornar nada. */
  const finish = useCallback((discard: boolean): Promise<RecordedAudio | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder) {
        resolve(null);
        return;
      }
      const mimeType = recorder.mimeType || "audio/webm";
      const durationSeconds = (Date.now() - startedAtRef.current) / 1000;

      recorder.onstop = () => {
        const chunks = chunksRef.current;
        chunksRef.current = [];
        teardown();
        setStatus("idle");

        if (discard || chunks.length === 0) {
          resolve(null);
          return;
        }
        const blob = new Blob(chunks, { type: mimeType });
        resolve({ file: new File([blob], `voice.${extensionFor(mimeType)}`, { type: mimeType }), durationSeconds });
      };
      recorder.stop();
    });
  }, [teardown]);

  const stop = useCallback(() => finish(false), [finish]);
  const cancel = useCallback(() => finish(true), [finish]);

  return { status, elapsedMs, isSupported, start, stop, cancel };
}
