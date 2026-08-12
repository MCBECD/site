"use client";

import Link from "next/link";
import { Terminal } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

export default function NotFound() {
  const { t } = useLocale();

  return (
    <div className="max-w-[var(--landing-max-width)] mx-auto px-[var(--content-gutter)] py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
      {/* Left: error info */}
      <div className="space-y-5">
        <p className="text-[12px] font-mono text-[var(--color-accent)] cmd-prompt">
          {t("notFound.errorCode")}
        </p>
        <h1 className="text-7xl md:text-8xl font-bold font-mono tracking-tight text-[var(--color-text-primary)]">
          404
        </h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] max-w-sm leading-relaxed">
          {t("notFound.description")}
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Link href="/" className="cta-primary">
            {t("notFound.backHome")}
          </Link>
          <Link href="/docs/" className="cta-secondary">
            {t("notFound.browseDocs")}
          </Link>
        </div>
      </div>

      {/* Right: terminal block */}
      <div className="terminal-block p-5 detail-enter">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border)]">
          <Terminal className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono">mcbedrock</span>
        </div>
        <pre className="text-[13px] font-mono leading-relaxed pt-3 whitespace-pre-wrap">
          <span className="text-[var(--color-text-tertiary)]">{"> "}</span>
          <span className="text-[var(--color-text-primary)]">{"/tp ~ ~ ~"}</span>{"\n"}
          <span className="text-red-400">{'Syntax error: unexpected "404"'}</span>{"\n"}
          <span className="text-[var(--color-text-tertiary)]">{"> "}</span>
          <span className="terminal-cursor" />
        </pre>
      </div>
    </div>
  );
}
