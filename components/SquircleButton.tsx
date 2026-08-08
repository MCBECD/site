"use client";

import type { ReactNode } from "react";
import { useSquircle } from "@/hooks/useSquircle";

interface SquircleButtonProps {
  children: ReactNode;
  cornerRadius?: number;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export function SquircleButton({ children, cornerRadius = 10, className = "", onClick, title }: SquircleButtonProps) {
  const ref = useSquircle<HTMLButtonElement>(cornerRadius);
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={className}
      title={title}
    >
      {children}
    </button>
  );
}
