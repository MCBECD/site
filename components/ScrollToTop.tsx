"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const SCROLL_THRESHOLD = 320;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t("doc.home")}
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
  );
}
