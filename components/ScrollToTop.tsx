"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const SCROLL_THRESHOLD = 320;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
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

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="fixed top-0 left-0 w-0 h-0 pointer-events-none" aria-hidden="true" />
      <button
        type="button"
        onClick={scrollToTop}
        aria-label={t("common.backToTop")}
        className={[
          "fixed bottom-6 right-6 z-[45]",
          "w-11 h-11 rounded-full",
          "flex items-center justify-center",
          "bg-[var(--color-accent)] text-white",
          "hover:bg-[var(--color-accent-hover)] active:scale-[0.92]",
          "transition-all duration-200",
          visible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-3 pointer-events-none",
        ].join(" ")}
        style={{
          boxShadow: "var(--color-card-hover-shadow)",
          transitionTimingFunction: "var(--ease-out)",
        }}
      >
        <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.5} />
      </button>
    </>
  );
}