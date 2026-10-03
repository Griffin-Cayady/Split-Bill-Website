import clsx from "clsx";
import { Avatar } from "./Avatar";
import { CheckIcon, PlusIcon } from "./icons";

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
        "inline-flex min-h-11 items-center gap-2 rounded-full border py-1 pr-3.5 pl-1 text-sm",
        "transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97]",
        selected
          ? "border-ink bg-ink font-semibold text-paper"
          : "border-field-border bg-paper-raised font-medium text-ink-soft hover:border-ink hover:text-ink",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      <Avatar name={name} color={color} size="sm" />
      <span className="max-w-[9rem] truncate">{name}</span>
      {onClick && (selected ? <CheckIcon width={14} height={14} aria-hidden="true" /> : <PlusIcon width={14} height={14} aria-hidden="true" />)}
    </button>
  );
}
