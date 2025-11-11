import { useEffect, useRef, useState } from "react";

/**
 * Marks an element visible when it gets near the viewport.
 * - offset: px before the element enters the viewport (positive triggers earlier)
 * - once: if true, stays visible after first reveal
 */
export default function useScrollVisibility(offset = 120, once = true) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onScroll() {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewH = window.innerHeight || document.documentElement.clientHeight;

      // Trigger when top is within (viewport - offset)
      if (rect.top <= viewH - offset) {
        setVisible(true);
      } else if (!once) {
        setVisible(false);
      }
    }

    // Run once (for above-the-fold content), then on scroll
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset, once]);

  return { ref, visible };
}
