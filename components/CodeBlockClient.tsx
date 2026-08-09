"use client";

import { useState, useCallback } from "react";
import { Check } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface CodeBlockClientProps {
  html: string;
  code: string;
}

export function CodeBlockClient({ html, code }: CodeBlockClientProps) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);

  const doCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.error("Failed to copy to clipboard");
    }
  }, [code]);

  const handleBlockClick = useCallback(
    (_e: React.MouseEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) return;
      doCopy();
    },
    [doCopy],
  );

  return (
    <>
      <div
        onClick={handleBlockClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div
        role="status"
        className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg
          px-4 py-2 text-sm font-medium shadow-xl border border-[var(--color-border)]
          bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]
          transition-all duration-300 pointer-events-none
          ${copied ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
      >
        <Check className="w-4 h-4 text-emerald-500" />
        <span>{t("code.copied")}</span>
      </div>
    </>
  );
}