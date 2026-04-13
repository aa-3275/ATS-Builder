"use client";

import { useEffect, useEffectEvent, useState } from "react";

type UseAutoSaveOptions<T> = {
  delay?: number;
  enabled?: boolean;
  onSave: (value: T) => Promise<void>;
  value: T;
};

export function useAutoSave<T>({
  delay = 2000,
  enabled = true,
  onSave,
  value,
}: UseAutoSaveOptions<T>) {
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(() =>
    JSON.stringify(value),
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const serializedValue = JSON.stringify(value);
  const handleSave = useEffectEvent(async (nextValue: T, snapshot: string) => {
    setStatus("saving");

    try {
      await onSave(nextValue);
      setLastSavedSnapshot(snapshot);
      setLastSavedAt(new Date().toISOString());
      setStatus("saved");
      setError(null);
    } catch (saveError) {
      console.error("Autosave failed", saveError);
      setStatus("error");
      setError("Autosave failed. Please retry after checking your Firebase setup.");
    }
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (serializedValue === lastSavedSnapshot) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void handleSave(value, serializedValue);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [delay, enabled, lastSavedSnapshot, serializedValue, value]);

  return {
    error,
    lastSavedAt,
    status:
      enabled && serializedValue !== lastSavedSnapshot && status !== "saving" && status !== "error"
        ? "pending"
        : status,
  };
}
