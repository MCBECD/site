"use client";

import { useState, useCallback, useRef } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockClientProps {
  html: string;
  code: string;
  /** @why 显示用户原文指定的语言标签，不做强制转换 */
  displayLang: string;
}

export function CodeBlockClient({ html, code, displayLang }: CodeBlockClientProps) {
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

  /* @why 点击代码块区域直接复制，但选中文档时不触发（防误触） */
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
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)]">
        <span className="text-xs text-[var(--color-text-tertiary)] font-mono">{displayLang}</span>
        <button
          onClick={handleCopyClick}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs
            text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]
            hover:bg-[var(--color-sidebar-hover)] transition-colors"
          title={copied ? "✓" : "Copy"}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      {/* @why 点击代码区域直接复制，比找按钮更快 */}
      <div
        onClick={handleBlockClick}
        className="cursor-copy [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-4 [&_pre]:overflow-x-auto [&_code]:!text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
