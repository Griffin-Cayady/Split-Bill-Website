import type { SVGProps } from "react";
import {
  CaretDown,
  Check,
  DownloadSimple,
  LinkSimple,
  Minus,
  PencilSimple,
  Plus,
  ShareNetwork,
  Trash,
  WarningCircle,
  X,
  type Icon,
  type IconWeight,
} from "@phosphor-icons/react";

/**
 * App icons come from Phosphor (one family, one weight). These wrappers keep
 * the old `width` / `height` call sites working and default to 18px.
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & { weight?: IconWeight };

function render(Glyph: Icon, { width, height, weight, ...rest }: IconProps, defaultWeight: IconWeight = "bold") {
  return <Glyph size={width ?? height ?? 18} weight={weight ?? defaultWeight} aria-hidden={rest["aria-label"] ? undefined : true} {...rest} />;
}

export function TrashIcon(props: IconProps) {
  return render(Trash, props, "regular");
}
export function PlusIcon(props: IconProps) {
  return render(Plus, props);
}
export function MinusIcon(props: IconProps) {
  return render(Minus, props);
}
export function CheckIcon(props: IconProps) {
  return render(Check, props);
}
export function XIcon(props: IconProps) {
  return render(X, props);
}
export function AlertIcon(props: IconProps) {
  return render(WarningCircle, props, "regular");
}
export function DownloadIcon(props: IconProps) {
  return render(DownloadSimple, props);
}
export function LinkIcon(props: IconProps) {
  return render(LinkSimple, props);
}
export function ShareIcon(props: IconProps) {
  return render(ShareNetwork, props, "regular");
}
export function PencilIcon(props: IconProps) {
  return render(PencilSimple, props, "regular");
}
export function ChevronDownIcon(props: IconProps) {
  return render(CaretDown, props);
}
