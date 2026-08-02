"use client";

import { useState, useCallback } from "react";

interface InlineCodeProps {
  code: string;
  className?: string;
}

export function InlineCode({ code, className = "" }: InlineCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }, [code]);

  return (
    <button
      onClick={handleClick}
      className={`relative px-1 py-0.5 rounded text-sm font-mono cursor-pointer transition-all
        ${copied ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-[var(--color-code-bg)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20"}
        active:scale-95 ${className}`}
      title="点击复制"
    >
      {copied && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs px-1.5 py-0.5 rounded
          bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] whitespace-nowrap pointer-events-none">
          已复制
        </span>
      )}
      {code}
    </button>
  );
}
