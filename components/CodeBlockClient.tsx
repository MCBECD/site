"use client";

import { useState, useCallback, useRef } from "react";
import { Copy, Check } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface CodeBlockClientProps {
  html: string;
  code: string;
  displayLang: string;
}

export function CodeBlockClient({ html, code, displayLang }: CodeBlockClientProps) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const clickTargetRef = useRef<"button" | "block">("block");

  const doCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  const handleCopyClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      clickTargetRef.current = "button";
      doCopy();
    },
    [doCopy],
  );

  const handleBlockClick = useCallback(
    (e: React.MouseEvent) => {
      if (clickTargetRef.current === "button") {
        clickTargetRef.current = "block";
        return;
      }
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) return;
      doCopy();
    },
    [doCopy],
  );

  return (
    <div className="group relative my-4 rounded-lg border border-[var(--color-border)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)]">
        <span className="text-xs text-[var(--color-text-tertiary)] font-mono">{displayLang}</span>
        <button
          onClick={handleCopyClick}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs
            text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]
            hover:bg-[var(--color-bg-secondary)] transition-colors"
          title={t("code.copy")}
        >
          {copied ? (
            <span className="flex items-center gap-1 text-green-500">
              <Check className="w-3.5 h-3.5" />
              {t("code.copied")}
            </span>
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      <div
        onClick={handleBlockClick}
        className="cursor-copy [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-4 [&_pre]:overflow-x-auto [&_code]:!text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
