"use client";

import type { ReactNode, CSSProperties } from "react";
import { useSquircle } from "@/hooks/useSquircle";

interface SquircleDivProps {
  children: ReactNode;
  cornerRadius?: number;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

/**
 * Lightweight block-level div with squircle clip-path.
 * Unlike <Squircle>, does NOT add border SVG or shadow — just clip-path.
 * Useful inside server-component-compatible slots (registered as MDX component).
 */
export function SquircleDiv({ children, cornerRadius = 10, className = "", style, onClick }: SquircleDivProps) {
  const ref = useSquircle<HTMLDivElement>(cornerRadius);
  return (
    <div ref={ref} className={className} style={style} onClick={onClick}>
      {children}
    </div>
  );
}
