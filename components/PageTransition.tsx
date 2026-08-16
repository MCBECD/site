"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Cross-page transition — key-based remount for inner entrance animations.
 *
 * No wrapper fade: each page has its own staggered entrance animations
 * (hero-enter, doc-card-enter, etc.) that handle the opacity 0→1.
 * A wrapper-level fade would cause a visible double-fade / stutter.
 *
 * The `key` forces a fresh DOM element on each route, restarting
 * all inner CSS animations naturally.
 */

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => { isFirst.current = false; }, []);

  /* Scroll to top on navigation (not on first mount) */
  useEffect(() => {
    if (!isFirst.current) window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  /* First mount: bare fragment, no wrapper, no animation */
  if (isFirst.current) return <>{children}</>;

  /* Navigation: key change remounts the div → inner entrance animations restart.
   * No page-fade-in here: each page has its own staggered entrance animations
   * (hero-enter, doc-card-enter, etc.) that already handle the opacity 0→1.
   * Adding a wrapper fade would cause a visible double-fade / stutter. */
  return (
    <div key={pathname}>
      {children}
    </div>
  );
}
