"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Cross-page transition — key-based remount for inner entrance animations.
 *
 * Always renders the keyed wrapper: on first mount the key is stable, so
 * entrance animations play exactly once. On navigation the key changes,
 * which remounts the subtree and naturally restarts the inner animations.
 *
 * (Previously the wrapper was conditional on a `isFirst` ref, which flipped
 * right after hydration and remounted the whole page — making every entrance
 * animation play twice: a truncated first run, then a full second run.)
 */

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirst = useRef(true);

  /* Scroll to top on navigation (not on first mount) */
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);

  return <div key={pathname}>{children}</div>;
}
