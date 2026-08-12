"use client";

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface Props {
  rawContent: string;
}

const CopyDropdown = memo(function CopyDropdown({ rawContent }: Props) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    return () => {
      clearTimeout(toastTimer.current);
      clearTimeout(copiedTimer.current);
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2000);
  }, []);

  const doCopy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard API unavailable
    }
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    setCopied(true);
    setOpen(false);
    showToast(label);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
  }, [showToast]);

  const plainText = useMemo(() =>
    rawContent
      .replace(/^---[\s\S]*?---/, '')  // strip frontmatter
      .replace(/^#{1,6}\s/gm, '')     // strip headings
      .replace(/\*\*(.+?)\*\*/g, '$1') // strip bold
      .replace(/\*(.+?)\*/g, '$1')     // strip italic
      .replace(/`(.+?)`/g, '$1')       // strip inline code
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // strip links
      .trim(),
    [rawContent]
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[13px]
          text-[var(--color-text-secondary)]
          hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]
          transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{copied ? t("code.copied") : t("code.copy")}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-100 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-36 py-1 rounded-lg border border-[var(--color-border)]
          bg-[var(--color-bg-primary)] shadow-lg z-50 dropdown-in">
          <button
            onClick={() => doCopy(rawContent, t("code.copiedMd"))}
            className="w-full text-left px-3 py-2 text-[13px] text-[var(--color-text-secondary)]
              hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {t("code.copyMd")}
          </button>
          <button
            onClick={() => doCopy(plainText, t("code.copiedPlain"))}
            className="w-full text-left px-3 py-2 text-[13px] text-[var(--color-text-secondary)]
              hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {t("code.copyPlain")}
          </button>
        </div>
      )}

      {toastMsg && (
        <div className="absolute right-0 top-full mt-2 px-3 py-1.5 rounded-lg text-[12px] text-white
          bg-[var(--color-toast-bg)] shadow-lg z-50 whitespace-nowrap dropdown-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
);

export default CopyDropdown;
