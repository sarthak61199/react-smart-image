import { decode } from "blurhash";
import React, { useEffect, useRef, useState } from "react";
import { ImageProps } from "./types";
import { getAspectStyle, getSizes, getSrcSet } from "./utils";

export const Image = ({
  src,
  alt,
  width,
  height,
  breakpoints,
  placeholder = "none",
  blurhash,
  priority = false,
  transformUrl,
  style,
  ...rest
}: ImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (placeholder === "blurhash" && blurhash && canvasRef.current) {
      const pixels = decode(blurhash, 32, 32);
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        const imageData = ctx.createImageData(32, 32);
        imageData.data.set(pixels);
        ctx.putImageData(imageData, 0, 0);
      }
    }
  }, [placeholder, blurhash]);

  const aspectStyle = getAspectStyle(width, height, style);

  return (
    <div style={{ position: "relative", ...aspectStyle }}>
      {placeholder === "blurhash" && blurhash && !loaded && (
        <canvas
          ref={canvasRef}
          width={32}
          height={32}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {placeholder === "lqip" && !loaded && (
        <div
          style={{
            backgroundImage: `url(${src}?lqip)`,
            backgroundSize: "cover",
            position: "absolute",
            inset: 0,
          }}
        />
      )}

      <img
        src={transformUrl ? transformUrl(src, width) : src}
        alt={alt}
        width={width}
        height={height}
        srcSet={getSrcSet(breakpoints, transformUrl, src)}
        sizes={getSizes(breakpoints)}
        loading={priority ? "eager" : "lazy"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: style?.objectFit || "cover",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
        onLoad={() => setLoaded(true)}
        {...rest}
      />
    </div>
  );
};
