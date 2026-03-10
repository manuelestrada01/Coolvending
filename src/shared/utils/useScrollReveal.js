import { useEffect, useRef, useState } from "react";

export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clearTimeout(timeoutRef.current);
          setIsVisible(true);
        } else if (entry.intersectionRatio === 0) {
          // Only hide when completely out of viewport
          timeoutRef.current = setTimeout(() => setIsVisible(false), 600);
        }
      },
      { threshold: [0, 0.15], rootMargin: "0px 0px -120px 0px", ...options }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return [ref, isVisible];
}