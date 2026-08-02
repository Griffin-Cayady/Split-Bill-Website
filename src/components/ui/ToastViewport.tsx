import { useEffect } from "react";
import { useUIStore } from "../../store/uiStore";

export function ToastViewport() {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} id={toast.id} message={toast.message} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

function ToastItem({ id, message, onDismiss }: { id: string; message: string; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div
      className="animate-pop-in pointer-events-auto flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold shadow-xl"
      style={{ background: "#33291c", color: "#fff8ec" }}
    >
      {message}
    </div>
  );
}
