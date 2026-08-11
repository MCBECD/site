"use client";

import { useState, useCallback, useEffect } from "react";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const doCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  const handleBlockClick = useCallback(
    (_e: React.MouseEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) return;
      doCopy();
    },
    [doCopy],
  );

  const toast = (
    <div
      role="status"
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-lg
        px-4 py-2 text-sm font-medium shadow-xl border border-emerald-500/30
        bg-emerald-500/10 text-emerald-600 dark:text-emerald-400
        transition-all duration-300 pointer-events-none
        ${copied ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
    >
      <Check className="w-4 h-4" />
      <span>{t("code.copied")}</span>
    </div>
  );

  return (
    <>
      <div
        onClick={handleBlockClick}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {mounted && createPortal(toast, document.body)}
    </>
  );
}