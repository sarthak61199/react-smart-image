import { CSSProperties } from "react";
import { Breakpoints } from "./types";

export const getSrcSet = (
  breakpoints: Breakpoints | undefined,
  transformUrl: ((src: string, width?: number) => string) | undefined,
  src: string
) => {
  if (!breakpoints) return undefined;
  const entries = Object.entries(breakpoints)
    .map(([k, v]) => [k, v] as const)
    .sort((a, b) => Number(a[0]) - Number(b[0]));
  return entries
    .map(([_, rawVal]) => {
      const numeric =
        typeof rawVal === "number"
          ? rawVal
          : parseInt(rawVal as unknown as string, 10);
      if (Number.isFinite(numeric)) {
        const url = transformUrl ? transformUrl(src, numeric) : `${src}?w=${numeric}`;
        return `${url} ${numeric}w`;
      }
      return undefined;
    })
    .filter(Boolean)
    .join(", ");
};

export const getSizes = (breakpoints: Breakpoints | undefined) => {
  if (!breakpoints) return undefined;
  const entries = Object.entries(breakpoints)
    .map(([k, v]) => [k, v] as const)
    .sort((a, b) => Number(a[0]) - Number(b[0]));
  return entries
    .map(([bp, val]) => {
      // If value is a number treat as px, otherwise use as-is (e.g. 50vw)
      return `(min-width: ${bp}px) ${typeof val === "number" ? `${val}px` : val
        }`;
    })
    .join(", ");
};

export const getAspectStyle = (
  width: number | undefined,
  height: number | undefined,
  style: CSSProperties = {}
) => {
  return width !== undefined && height !== undefined && width !== 0
    ? { aspectRatio: `${width} / ${height}`, ...style }
    : style;
};
