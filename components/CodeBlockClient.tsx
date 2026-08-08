"use client";

import { useState, useCallback, useRef } from "react";
import { Check } from "lucide-react";
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

  // const handleCopyClick = useCallback(
  //   (e: React.MouseEvent) => {
  //     e.stopPropagation();
  //     clickTargetRef.current = "button";
  //     doCopy();
  //   },
  //   [doCopy],
  // );

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

  // return (
  //   <div className="group relative my-5 rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden">
  //     <div className="flex items-center justify-between px-4 h-9 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)]">
  //       <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono">{displayLang}</span>
  //       <button
  //         onClick={handleCopyClick}
  //         className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px]
  //           text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]
  //           hover:bg-[var(--color-bg-secondary)] transition-colors"
  //         title={t("code.copy")}
  //       >
  //         {copied ? (
  //           <span className="flex items-center gap-1 text-emerald-500">
  //             <Check className="w-3 h-3" />
  //             {t("code.copied")}
  //           </span>
  //         ) : (
  //           <Copy className="w-3 h-3" />
  //         )}
  //       </button>
  //     </div>
  //     <div
  //       onClick={handleBlockClick}
  //       className="cursor-copy [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-4 [&_pre]:overflow-x-auto [&_code]:!text-[13px]"
  //       dangerouslySetInnerHTML={{ __html: html }}
  //     />
  //   </div>
  // );

  return (
    <>
      <pre
        onClick={handleBlockClick}
        className="[&_pre]:!p-2 my-4 overflow-x-auto rounded-lg bg-[var(--color-code-bg)] text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div
        role="status"
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg
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