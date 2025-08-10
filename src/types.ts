import { ImgHTMLAttributes } from "react";

export type Breakpoints = Record<string, number>;

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  width?: number;
  height?: number;
  breakpoints?: Breakpoints;
  placeholder?: "blurhash" | "lqip" | "none";
  blurhash?: string;
  priority?: boolean;
  transformUrl?: (src: string, width?: number) => string;
}
