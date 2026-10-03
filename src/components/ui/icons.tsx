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

function wrap(Glyph: Icon, defaultWeight: IconWeight = "bold") {
  return function AppIcon({ width, height, weight = defaultWeight, ...rest }: IconProps) {
    return <Glyph size={width ?? height ?? 18} weight={weight} aria-hidden={rest["aria-label"] ? undefined : true} {...rest} />;
  };
}

export const TrashIcon = wrap(Trash, "regular");
export const PlusIcon = wrap(Plus);
export const MinusIcon = wrap(Minus);
export const CheckIcon = wrap(Check);
export const XIcon = wrap(X);
export const AlertIcon = wrap(WarningCircle, "regular");
export const DownloadIcon = wrap(DownloadSimple);
export const LinkIcon = wrap(LinkSimple);
export const ShareIcon = wrap(ShareNetwork, "regular");
export const PencilIcon = wrap(PencilSimple, "regular");
export const ChevronDownIcon = wrap(CaretDown);
