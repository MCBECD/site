"use client"

import { useEffect, useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Copy, Check } from "lucide-react";
import { getHighlighter } from "@/lib/shiki";

export function CodeBlockClient({ lang, code }: { lang: string; code: string }) {
  const { t } = useLocale();
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getHighlighter()
      .then((hl) => {
        if (!active) return;
        const target = hl.getLoadedLanguages().includes(lang) ? lang : "mcfunction";
        setHtml(
          hl.codeToHtml(code, {
            lang: target,
            themes: { light: "github-light", dark: "github-dark" },
          }),
        );
      })
      .catch(() => {
        // 高亮失败时保留未高亮的纯文本
      });
    return () => {
      active = false;
    };
  }, [lang, code]);

  const codeInner = html ? (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
      <code>{code}</code>
    </pre>
  );

  const codeBlock = (
    <div className="relative min-w-0 flex-1 my-2">
      {codeInner}
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