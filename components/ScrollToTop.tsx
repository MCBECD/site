"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const THRESHOLD = 320;
    const onScroll = () => {
      setVisible(window.scrollY > THRESHOLD);
    };
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
      aria-label="Scroll to top"
      className={[
        "fixed bottom-6 right-6 z-50",
        "w-11 h-11 rounded-full",
        "flex items-center justify-center",
        "bg-[var(--color-accent)] text-white shadow-lg",
        "hover:bg-[var(--color-accent-hover)] active:scale-[0.92]",
        "transition-all duration-200 var(--ease-out)",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none",
      ].join(" ")}
      style={{
        boxShadow: "0 4px 16px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.5} />
    </button>
  );
}