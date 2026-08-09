"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Cross-page transition — pure CSS, opacity only.
 *
 * No framer-motion: JS-driven animation on the main thread causes jank.
 * No y-translate: vertical movement during page swap looks stuttery
 * because content height differs between pages.
 * No exit animation: avoids the "two flash" sequential feel.
 *
 * The `key` forces a fresh DOM element on each route, restarting
 * the CSS animation. `animation-fill-mode: both` ensures the new
 * element starts at opacity 0 from the very first paint (no flash).
 */

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => { isFirst.current = false; }, []);

  /* Scroll to top on navigation (not on first mount) */
  useEffect(() => {
    if (!isFirst.current) window.scrollTo({ top: 0 });
  }, [pathname]);

  /* First mount: bare fragment, no wrapper, no animation */
  if (isFirst.current) return <>{children}</>;

  /* Navigation: key change remounts the div → CSS animation restarts */
  return (
    <div key={pathname} className="page-fade-in">
      {children}
    </div>
  );
}
