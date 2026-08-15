"use client";

import { memo, useEffect, useState, useCallback, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const SCROLL_THRESHOLD = 320;

export const ScrollToTop = memo(function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const { t } = useLocale();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry!.isIntersecting),
      { rootMargin: `-${SCROLL_THRESHOLD}px 0px 0px 0px` },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
  }, [reducedMotion]);

  return (
    <>
      <div ref={sentinelRef} className="fixed top-0 left-0 w-0 h-0 pointer-events-none" aria-hidden="true" />
      <button
        type="button"
        onClick={handleScrollToTop}
        aria-label={t("common.backToTop")}
        className={[
          "fixed bottom-6 right-6 z-[var(--z-sticky)]",
          "w-11 h-11 rounded-full",
          "flex items-center justify-center",
          "bg-[var(--color-accent)] text-[var(--color-on-accent)]",
          "hover:bg-[var(--color-accent-hover)] active:scale-[0.92]",
          "transition-[opacity,transform] duration-[var(--duration-fast)]",
          "shadow-[var(--shadow-md)]",
          visible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-3 pointer-events-none",
        ].join(" ")}
        style={{
          transitionTimingFunction: "var(--ease-out)",
        }}
      >
        <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.5} />
      </button>
    </>
  );
});
