import { useEffect, useId, useRef } from "react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Esc / backdrop click. Defaults to onCancel; pass a safe action when "cancel" itself is destructive. */
  onDismiss?: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  onConfirm,
  onCancel,
  onDismiss = onCancel,
}: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Focus the safe choice for destructive dialogs so a stray Enter never destroys anything,
  // and hand focus back to whatever opened the dialog once it closes.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    (danger ? cancelRef : confirmRef).current?.focus();
    return () => opener?.focus();
  }, [open, danger]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>("button:not([disabled])");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onDismiss]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={onDismiss}
    >
      <div
        ref={panelRef}
        className="w-full max-w-sm rounded-2xl border-[1.5px] border-border bg-paper-raised p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="font-display text-lg font-extrabold text-ink">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="mt-2 text-sm text-ink-soft">
            {description}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button ref={cancelRef} variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button ref={confirmRef} variant={danger ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
