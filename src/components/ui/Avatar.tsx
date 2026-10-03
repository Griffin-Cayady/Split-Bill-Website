import clsx from "clsx";
import { initials } from "../../lib/id";

interface AvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = { sm: "h-[30px] w-[30px] text-label", md: "h-11 w-11 text-sm", lg: "h-14 w-14 text-lg" };

export function Avatar({ name, color, size = "md" }: AvatarProps) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-extrabold tracking-wide text-white",
        sizeClasses[size],
      )}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
