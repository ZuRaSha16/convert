import type { SVGProps } from "react";
import { brandMark } from "@/lib/brand";

export function LogoMark({ width = 31, height = 28, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={brandMark.viewBox}
      width={width}
      height={height}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path fill={brandMark.color} d={brandMark.path} />
    </svg>
  );
}
