import { useCallback, useRef, useState } from "react";

interface PendingDelete<T> {
  id: string;
  item: T;
  index: number;
}

/** Tracks a single pending deletion for a 5s undo window (PRD §4.2). */
export function useUndoableDelete<T extends { id: string }>(onRestore: (item: T, index: number) => void, delayMs = 5000) {
  const [pending, setPending] = useState<PendingDelete<T> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleDelete = useCallback(
    (item: T, index: number) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPending({ id: item.id, item, index });
      timerRef.current = setTimeout(() => setPending(null), delayMs);
    },
    [delayMs],
  );

  const undo = useCallback(() => {
    setPending((current) => {
      if (current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        onRestore(current.item, current.index);
      }
      return null;
    });
  }, [onRestore]);

  return { pending, scheduleDelete, undo };
}
