import clsx from "clsx";
import { Avatar } from "./Avatar";

interface ChipProps {
  name: string;
  color: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function Chip({ name, color, selected, onClick, disabled }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={clsx(
        "inline-flex h-12 min-w-12 items-center gap-2 rounded-full border-[1.5px] pl-1.5 pr-4 font-sans text-sm font-bold",
        "transition-colors duration-150",
        selected ? "text-white" : "bg-paper-raised text-ink hover:bg-paper-hover",
        disabled && "pointer-events-none opacity-40",
      )}
      style={{
        backgroundColor: selected ? color : undefined,
        borderColor: selected ? color : "var(--border)",
      }}
    >
      <Avatar name={name} color={selected ? "rgba(255,255,255,0.28)" : color} size="sm" />
      <span className="max-w-[9rem] truncate">{name}</span>
      <span aria-hidden="true" className="text-base font-extrabold">
        {onClick && (selected ? "✓" : "+")}
      </span>
    </button>
  );
}
