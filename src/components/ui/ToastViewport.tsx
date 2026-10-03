import { useEffect } from "react";
import { useUIStore, type Toast } from "../../store/uiStore";

export function ToastViewport() {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--bottom-bar-h,0px)+12px)] z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { id, message, action } = toast;

  // Toasts with an action stay longer, so there is time to reach the button.
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), action ? 7000 : 4000);
    return () => clearTimeout(timer);
  }, [id, action, onDismiss]);

  return (
    <div
      className="animate-pop-in pointer-events-auto flex max-w-full items-center gap-3 rounded-full bg-chrome py-2 pr-2 pl-5 text-sm font-semibold text-chrome-ink shadow-xl"
    >
      <span className={action ? "truncate" : "py-1 pr-3"}>{message}</span>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onAction();
            onDismiss(id);
          }}
          className="min-h-9 shrink-0 rounded-full bg-accent px-4 text-sm font-extrabold text-accent-ink"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
