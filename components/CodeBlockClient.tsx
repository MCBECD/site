"use client";

import { memo, useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Check, Copy } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface CodeBlockClientProps {
  html: string;
  code: string;
}

export const CodeBlockClient = memo(function CodeBlockClient({ html, code }: CodeBlockClientProps) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setMounted(true);
    return () => clearTimeout(copiedTimer.current);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      setCopied(true);
      copiedTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — silent fail
    }
  }, [code]);

  const toast = (
    <div
      role="status"
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[var(--z-toast)] flex items-center gap-2 rounded-[var(--radius)] px-4 py-2 text-[13px] font-medium shadow-[var(--shadow-lg)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)] transition-[opacity,transform] duration-[var(--duration-fast)] pointer-events-none ${copied ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
    >
      <Check className="w-4 h-4" />
      <span>{t("code.copied")}</span>
    </div>
  );

  return (
    <div className="code-block relative group min-w-0 flex-1">
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <button
        type="button"
        onClick={handleCopy}
        aria-label={t("code.copy")}
        title={t("code.copy")}
        className={`absolute top-2 right-2 z-[var(--z-search)] inline-flex items-center gap-1.5 h-7 px-2 rounded-[var(--radius-sm)] text-[12px] font-medium border transition-[color,background,border-color,opacity] duration-[var(--duration-fast)]
          ${copied
            ? "text-[var(--color-accent)] border-[var(--color-accent)]/40 bg-[var(--color-accent-muted)] opacity-100"
            : "text-[var(--color-text-tertiary)] border-[var(--color-border)] bg-[var(--color-code-bg)] opacity-60 group-hover:opacity-100 hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-tertiary)] focus-visible:opacity-100"
          }`}
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{copied ? t("code.copied") : t("code.copy")}</span>
      </button>
      {mounted && createPortal(toast, document.body)}
    </div>
  );
});
