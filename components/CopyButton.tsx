"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  getText: () => string;
  label: string;
  successLabel: string;
}

export function CopyButton({ getText, label, successLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = getText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [getText]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
        bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]
        hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text-primary)]
        transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
      title={label}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span>{successLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
