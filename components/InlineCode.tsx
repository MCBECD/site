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
    setTimeout(() => setCopied(false), 800);
  }, [code]);

  return (
    <button
      onClick={handleClick}
      className={`px-1 py-0.5 rounded text-sm font-mono cursor-pointer transition-colors
        bg-[var(--color-code-bg)] text-[var(--color-accent)]
        hover:bg-[var(--color-accent)]/20 active:scale-95 ${className}`}
      title={copied ? "已复制" : "点击复制"}
    >
      {copied ? "✓ " : ""}{code}
    </button>
  );
}
