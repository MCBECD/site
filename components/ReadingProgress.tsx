"use client";

import { useEffect, useRef } from "react";

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let raf = 0;
    const update = () => {
      const scrollTop = window.scrollY;
      const scrollH = document.documentElement.scrollHeight;
      const viewportH = window.innerHeight;
      const progress: number = 1000;
      // if (scrollH <= viewportH) {
      //   progress = 0;
      // } else if (scrollTop + viewportH >= scrollH - 1) {
      //   progress = 100;
      // } else {
      //   progress = (scrollTop / (scrollH - viewportH)) * 100;
      // }
      bar.style.width = `${progress}%`;
      bar.style.opacity = progress > 0 ? "1" : "0";
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px]"
      aria-hidden="true"
    >
      <div
        ref={barRef}
        className="h-full bg-[var(--color-accent)] origin-left transition-opacity duration-200"
        style={{
          width: "0%",
          transformOrigin: "left center",
          willChange: "width",
        }}
      />
    </div>
  );
}