"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Cross-page transition — enter only, no exit.
 *
 * Why no AnimatePresence / exit animation:
 * mode="wait" creates a sequential exit→enter that feels like
 * two separate flashes. Removing exit and only animating enter
 * gives a single, clean visual event.
 */

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    isFirstMount.current = false;
  }, []);

  /* Scroll to top on navigation (not on first mount) */
  useEffect(() => {
    if (!isFirstMount.current) {
      window.scrollTo({ top: 0 });
    }
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      initial={isFirstMount.current ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
