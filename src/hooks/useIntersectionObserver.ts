import { useEffect, useRef, useCallback } from "react";

interface UseIntersectionObserverProps {
  onIntersect: () => void;
  isLoading: boolean;
  hasNextPage: boolean;
  threshold?: number;
  rootMargin?: string;
}

export const useIntersectionObserver = ({
  onIntersect,
  isLoading,
  hasNextPage,
  threshold = 0.1,
  rootMargin = "0px",
}: UseIntersectionObserverProps) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const callback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isLoading) {
        onIntersect();
      }
    },
    [onIntersect, hasNextPage, isLoading]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(callback, {
      threshold,
      rootMargin,
    });

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [callback, threshold, rootMargin]);

  return { sentinelRef };
};
