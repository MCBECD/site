"use client";

import type { ReactNode } from "react";
import { useSquircle } from "@/hooks/useSquircle";

interface SquircleButtonProps {
  children: ReactNode;
  cornerRadius?: number;
  className?: string;
  onClick?: () => void;
}

export function SquircleButton({ children, cornerRadius = 10, className = "", onClick }: SquircleButtonProps) {
  const ref = useSquircle<HTMLButtonElement>(cornerRadius);
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  );
}
