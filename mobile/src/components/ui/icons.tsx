import Svg, { Circle, Path, type SvgProps } from "react-native-svg";

export interface IconProps extends SvgProps {
  size?: number;
  color?: string;
}

function Base({ size = 18, color = "#33291c", children, ...props }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </Svg>
  );
}

export const TrashIcon = (p: IconProps) => (
  <Base {...p}>
    <Path d="M3 6h18" />
    <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <Path d="M10 11v6M14 11v6" />
  </Base>
);
export const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <Path d="M12 5v14M5 12h14" />
  </Base>
);
export const MinusIcon = (p: IconProps) => (
  <Base {...p}>
    <Path d="M5 12h14" />
  </Base>
);
export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <Path d="M20 6 9 17l-5-5" />
  </Base>
);
export const XIcon = (p: IconProps) => (
  <Base {...p}>
    <Path d="M18 6 6 18M6 6l12 12" />
  </Base>
);
export const DownloadIcon = (p: IconProps) => (
  <Base {...p}>
    <Path d="M12 3v12" />
    <Path d="m7 10 5 5 5-5" />
    <Path d="M4 20h16" />
  </Base>
);
export const LinkIcon = (p: IconProps) => (
  <Base {...p}>
    <Path d="M9 17H7A5 5 0 0 1 7 7h2" />
    <Path d="M15 7h2a5 5 0 1 1 0 10h-2" />
    <Path d="M8 12h8" />
  </Base>
);
export const ShareIcon = (p: IconProps) => (
  <Base {...p}>
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5" />
  </Base>
);
export const AlertIcon = (p: IconProps) => (
  <Base {...p}>
    <Path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <Path d="M12 9v4M12 17h.01" />
  </Base>
);
