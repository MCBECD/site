"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useRef, useEffect } from "react";

/**
 * Cross-page transition wrapper.
 *
 * Detects route changes via usePathname() and plays a subtle
 * fade + directional slide animation using framer-motion's
 * AnimatePresence (keeps the old page mounted during exit).
 *
 * Direction is inferred by comparing path depth:
 *   deeper     → slide from right (forward)
 *   shallower  → slide from left  (back)
 */

const dur = 0.22;
const ease = [0.23, 1, 0.32, 1] as const;

const forward: Variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0, transition: { duration: dur, ease } },
  exit: { opacity: 0, x: -16, transition: { duration: dur * 0.8, ease } },
};

const backward: Variants = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0, transition: { duration: dur, ease } },
  exit: { opacity: 0, x: 16, transition: { duration: dur * 0.8, ease } },
};

const variantsMap = { forward, backward } as const;

/* Track previous path depth for direction inference */
let prevDepth = 1;
let isFirstMount = true;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const depth = pathname.split("/").filter(Boolean).length;
  const isForward = depth > prevDepth;
  const direction = isFirstMount ? "forward" : isForward ? "forward" : "backward";
  const variants = variantsMap[direction];

  useEffect(() => {
    prevDepth = depth;
    isFirstMount = false;
  });

  /* Scroll to top on route change */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={direction}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="page-transition-wrapper"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
