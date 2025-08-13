import { decode } from "blurhash";
import React, { forwardRef, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "../hooks/useInView";
import { ImageProps } from "../types";
import { getAspectStyle, getSizes, getSrcSet } from "../utils";

export const Image = forwardRef<HTMLImageElement, ImageProps>(({
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
  deferUntilInView,
  onLoad,
  ...rest
}: ImageProps, ref) => {
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [setInViewRef, inView] = useInView({ rootMargin: "0px 0px 200px 0px" });

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

  const resolvedSrc = useMemo(() => {
    if (deferUntilInView && !inView) return undefined;
    return transformUrl ? transformUrl(src, width) : src;
  }, [deferUntilInView, inView, transformUrl, src, width]);

  const srcSet = useMemo(() => {
    if (deferUntilInView && !inView) return undefined;
    return getSrcSet(breakpoints, transformUrl, src);
  }, [deferUntilInView, inView, breakpoints, transformUrl, src]);

  const sizes = useMemo(() => {
    if (deferUntilInView && !inView) return undefined;
    return getSizes(breakpoints);
  }, [deferUntilInView, inView, breakpoints]);

  // LQIP placeholder: Instead of hardcoded ?lqip, allow transformUrl to decide a low-quality variant if provided.
  const lqipStyleBackground = useMemo(() => {
    if (placeholder !== "lqip") return undefined;
    if (transformUrl) {
      // Convention: width very small (e.g., 16) to get tiny image; user transformUrl can interpret
      return transformUrl(src, 16);
    }
    return `${src}?lqip`;
  }, [placeholder, transformUrl, src]);

  // Compose user onLoad with internal fade-in state update
  const composedOnLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setLoaded(true);
      onLoad?.(e);
    },
    [onLoad]
  );

  // Merge forwarded ref with IntersectionObserver ref
  const setMergedRef = useCallback(
    (node: HTMLImageElement | null) => {
      setInViewRef(node);
      if (!ref) return;
      if (typeof ref === "function") {
        ref(node);
      } else {
        (ref as RefObject<HTMLImageElement | null>).current = node;
      }
    },
    [ref, setInViewRef]
  );

  return (
    <div style={{ position: "relative", ...aspectStyle }}>
      {placeholder === "blurhash" && blurhash && (
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
            filter: "blur(2px)",
            transition: "opacity 0.3s ease",
            opacity: loaded ? 0 : 1,
            pointerEvents: "none",
          }}
        />
      )}

      {placeholder === "lqip" && lqipStyleBackground && (
        <div
          style={{
            backgroundImage: `url(${lqipStyleBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "absolute",
            inset: 0,
            filter: "blur(4px)",
            transition: "opacity 0.3s ease",
            opacity: loaded ? 0 : 1,
            pointerEvents: "none",
          }}
        />
      )}

      <img
        ref={setMergedRef}
        // Omit src attribute entirely if deferring
        alt={alt}
        width={width}
        height={height}
        srcSet={srcSet}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        style={{
          width: "100%",
          height: "100%",
          objectFit: style?.objectFit || "cover",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease",
          // Ensure img above placeholder for fade-in
          position: "relative",
          zIndex: 1,
        }}
        {...rest}
        {...(resolvedSrc ? { src: resolvedSrc } : {})}
        onLoad={composedOnLoad}
      />
    </div>
  );
});

Image.displayName = "Image";
