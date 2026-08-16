"use client"

import { useLocale } from "@/contexts/LocaleContext";
import { Copy, Check } from "lucide-react";

export function CodeBlockClient({ lang, code, html }: { lang: string; code: string; html: string }) {
  const { t } = useLocale();
  const codeBlock = (
    <div className="relative min-w-0 flex-1 my-2">
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <button
        type="button"
        className="code-copy-btn"
        data-code={code}
        aria-label={t("code.copy")}
        title={t("code.copy")}
      >
        <Copy className="code-copy-icon w-3.5 h-3.5" />
        <Check className="code-copy-check w-3.5 h-3.5" />
      </button>
    </div>
  );

  return lang.startsWith("Cmd") ?
    <div className="flex items-center gap-2">
      <img
        src={`/icons/cmd/${lang.slice(3)}.png`}
        aria-hidden="true"
        width={24}
        height={24}
        className="cmd-icon shrink-0"
      />
      {codeBlock}
    </div> : codeBlock;
}