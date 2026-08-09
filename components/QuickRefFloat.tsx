"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ClipboardList, X, Copy, Check, Trash2 } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useLocale } from "@/contexts/LocaleContext";
import {
  getClipboardHistory,
  clearClipboardHistory,
  type ClipboardEntry,
} from "@/lib/storage";

/**
 * 速查浮窗 — 插件形态，通过设置面板开关
 * 显示最近复制过的命令，一键再复制
 */
export function QuickRefFloat() {
  const { isPluginEnabled } = useSettings();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ClipboardEntry[]>([]);
  const [copiedIdx, setCopiedIdx] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  const enabled = isPluginEnabled("quick-reference");

  // 加载数据 + 定时刷新
  const refresh = useCallback(() => {
    if (enabled) setEntries(getClipboardHistory());
  }, [enabled]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [refresh]);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!enabled) return null;

  const handleCopy = useCallback(async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(-1), 1500);
  }, []);

  const handleClear = useCallback(() => {
    clearClipboardHistory();
    setEntries([]);
  }, []);

  return (
    <div ref={ref} className="fixed bottom-5 right-5 z-30">
      {/* 浮窗面板 */}
      {open && (
        <div className="absolute bottom-12 right-0 w-72 rounded-xl border border-[var(--color-border)]
          bg-[var(--color-bg-elevated)] shadow-lg dropdown-in">
          {/* 面板头部 */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--color-border-light)]">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span className="text-[12px] font-medium text-[var(--color-text-primary)]">
                {t("plugin.quickRefTitle")}
              </span>
            </div>
            {entries.length > 0 && (
              <button
                onClick={handleClear}
                className="w-6 h-6 flex items-center justify-center rounded-md
                  text-[var(--color-text-tertiary)] hover:text-red-400 hover:bg-[var(--color-bg-tertiary)] transition-colors"
                title={t("plugin.quickRefClear")}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* 列表 */}
          <div className="max-h-64 overflow-y-auto">
            {entries.length === 0 ? (
              <div className="px-3.5 py-6 text-center">
                <p className="text-[12px] text-[var(--color-text-tertiary)]">
                  {t("plugin.quickRefEmpty")}
                </p>
              </div>
            ) : (
              <div className="py-1">
                {entries.map((entry, i) => (
                  <button
                    key={`${entry.ts}-${i}`}
                    onClick={() => handleCopy(entry.text, i)}
                    className="w-full text-left px-3.5 py-2 flex items-start gap-2.5
                      hover:bg-[var(--color-bg-tertiary)] transition-colors group"
                  >
                    <code className="text-[11px] font-mono text-[var(--color-accent)] bg-[var(--color-code-bg)]
                      px-1.5 py-0.5 rounded shrink-0 mt-0.5 max-w-[52px] truncate">
                      {entry.label}
                    </code>
                    <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed
                      line-clamp-2 flex-1 min-w-0 break-all">
                      {entry.text}
                    </p>
                    <span className="shrink-0 mt-0.5">
                      {copiedIdx === i ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 浮动按钮 */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border
          transition-colors
          ${open
            ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white"
            : "bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30"
          }`}
        aria-label={t("plugin.quickRefTitle")}
      >
        {open ? <X className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
      </button>

      {/* 未读数 badge */}
      {!open && entries.length > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center
          rounded-full bg-[var(--color-accent)] text-[10px] font-medium text-white px-1">
          {entries.length > 9 ? "9+" : entries.length}
        </span>
      )}
    </div>
  );
}
