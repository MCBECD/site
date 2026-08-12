"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface CodeBlockClientProps {
  html: string;
  code: string;
}

export function CodeBlockClient({ html, code }: CodeBlockClientProps) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setMounted(true);
    return () => clearTimeout(copiedTimer.current);
  }, []);

  const doCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      setCopied(true);
      copiedTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — silent fail
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        doCopy();
      }
    },
    [doCopy],
  );

  const toast = (
    <div
      role="status"
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-[var(--radius)] px-4 py-2 text-sm font-medium shadow-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)] transition-all duration-300 pointer-events-none ${copied ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
    >
      <Check className="w-4 h-4" />
      <span>{t("code.copied")}</span>
    </div>
  );

  return (
    <div>
      <div
        className="flex"
        role="button"
        tabIndex={0}
        aria-label={t("code.copy")}
        onClick={handleBlockClick}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {mounted && createPortal(toast, document.body)}
    </div>
  );
}