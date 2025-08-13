import { useCallback, useRef, useState } from "react";

export type UseInViewOptions = IntersectionObserverInit & {
  once?: boolean;
};

export function useInView<T extends Element = Element>(
  options: UseInViewOptions = {}
): [(node: T | null) => void, boolean] {
  const {
    root,
    rootMargin = "0px 0px 200px 0px",
    threshold = 0,
    once = true,
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const [inView, setInView] = useState(false);

  const setTarget = useCallback(
    (node: T | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node) return;

      if (
        typeof window === "undefined" ||
        !("IntersectionObserver" in window)
      ) {
        setInView(true);
        return;
      }

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          const isVisible = entry.isIntersecting || entry.intersectionRatio > 0;
          if (isVisible) {
            setInView(true);
            if (once && observerRef.current) {
              observerRef.current.disconnect();
              observerRef.current = null;
            }
          } else if (!once) {
            setInView(false);
          }
        },
        { root, rootMargin, threshold }
      );

      observerRef.current.observe(node);
    },
    [root, rootMargin, threshold, once]
  );

  return [setTarget, inView];
}
