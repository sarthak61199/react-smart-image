import { ImgHTMLAttributes } from "react";

export type Breakpoints = Record<string, number>;

type BaseImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt"
> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  breakpoints?: Breakpoints;
  priority?: boolean;
  transformUrl?: (src: string, width?: number) => string;
  deferUntilInView?: boolean;
};

type BlurhashPlaceholderProps = BaseImageProps & {
  placeholder: "blurhash";
  blurhash: string;
};

type LqipPlaceholderProps = BaseImageProps & {
  placeholder: "lqip";
  blurhash?: never;
};

type NonePlaceholderProps = BaseImageProps & {
  placeholder?: "none" | undefined;
  blurhash?: never;
};

export type ImageProps =
  | BlurhashPlaceholderProps
  | LqipPlaceholderProps
  | NonePlaceholderProps;
