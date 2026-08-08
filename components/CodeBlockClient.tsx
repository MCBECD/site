"use client";

import { useState, useCallback, useRef } from "react";
import { Check } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { Squircle } from "@/components/Squircle";

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

  const handleBlockClick = useCallback(
    (_e: React.MouseEvent) => {
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
    <>
      <Squircle
        cornerRadius={10}
        borderColor="var(--color-border)"
        className="my-4 overflow-x-auto bg-[var(--color-code-bg)] text-sm"
        onClick={handleBlockClick as unknown as () => void}
      >
        <pre
          className="cursor-copy p-4"
          style={{ minWidth: 0 }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Squircle>
      <Squircle
        cornerRadius={8}
        borderColor="var(--color-border)"
        shadow="0 4px 12px rgba(0,0,0,0.12)"
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 text-sm font-medium
          bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]
          transition-all duration-200 pointer-events-none
          ${copied ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
      >
        <span className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{t("code.copied")}</span>
        </span>
      </Squircle>
    </>
  );
}