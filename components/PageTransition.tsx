"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Cross-page transition.
 *
 * Enter: fade + subtle upward slide.
 * Exit: quick fade only (no movement, avoids direction bugs).
 * mode="wait": exit completes before enter starts — clean sequence.
 * initial={false}: no animation on first page load.
 */

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    isFirstMount.current = false;
  });

  /* Scroll to top on navigation (not on first mount) */
  useEffect(() => {
    if (!isFirstMount.current) {
      window.scrollTo({ top: 0 });
    }
  }, [pathname]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] } }}
        exit={{ opacity: 0, transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] } }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
