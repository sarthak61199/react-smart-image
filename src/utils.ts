import { CSSProperties } from "react";
import { Breakpoints } from "./types";

export const getSrcSet = (
  breakpoints: Breakpoints | undefined,
  transformUrl: ((src: string, width?: number) => string) | undefined,
  src: string | undefined
) => {
  if (!breakpoints) return undefined;
  return Object.values(breakpoints)
    .map((bp) => {
      const url = transformUrl ? transformUrl(src!, bp) : `${src}?w=${bp}`;
      return `${url} ${bp}w`;
    })
    .join(", ");
};

export const getSizes = (breakpoints: Breakpoints | undefined) => {
  if (!breakpoints) return undefined;
  return Object.keys(breakpoints)
    .map((bp) => `(min-width: ${bp}px) ${breakpoints[bp]}px`)
    .join(", ");
};

export const getAspectStyle = (
  width: number | undefined,
  height: number | undefined,
  style: CSSProperties = {}
) => {
  return width && height
    ? { aspectRatio: `${width} / ${height}`, ...style }
    : style;
};
