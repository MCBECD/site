"use client";

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface CopyDropdownProps {
  rawContent: string;
}

const CopyDropdown = memo(function CopyDropdown({ rawContent }: CopyDropdownProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
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

  // Keyboard navigation for the dropdown
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
        triggerRef.current?.focus();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev < 1 ? prev + 1 : 0;
          itemRefs.current[next]?.focus();
          return next;
        });
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev > 0 ? prev - 1 : 1;
          itemRefs.current[next]?.focus();
          return next;
        });
        return;
      }
      if (e.key === "Tab") {
        setOpen(false);
        setActiveIndex(-1);
        return;
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2000);
  }, []);

  const handleCopy = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setOpen(false);
      setActiveIndex(-1);
      showToast(label);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — silently skip
    }
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
        ref={triggerRef}
        onClick={() => { setOpen(!open); setActiveIndex(-1); }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("code.copy")}
        className="inline-flex items-center gap-1.5 h-11 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-[var(--color-accent)]" /> : <Copy className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{copied ? t("code.copied") : t("code.copy")}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-[var(--duration-fast)] ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-36 py-1 rounded-[var(--radius)] border border-[var(--color-border)]
          bg-[var(--color-bg-primary)] shadow-[var(--shadow-lg)] z-[var(--z-dropdown)] dropdown-in"
          role="menu">
          <button
            ref={(el) => { itemRefs.current[0] = el; }}
            role="menuitem"
            onClick={() => handleCopy(rawContent, t("code.copiedMd"))}
            className={`w-full text-left px-3 py-3 min-h-[44px] text-[13px] transition-[color,transform] duration-[var(--duration-fast)] active:scale-[0.92]
              ${activeIndex === 0
                ? "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"}`}
          >
            {t("code.copyMd")}
          </button>
          <button
            ref={(el) => { itemRefs.current[1] = el; }}
            role="menuitem"
            onClick={() => handleCopy(plainText, t("code.copiedPlain"))}
            className={`w-full text-left px-3 py-3 min-h-[44px] text-[13px] transition-[color,transform] duration-[var(--duration-fast)] active:scale-[0.92]
              ${activeIndex === 1
                ? "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"}`}
          >
            {t("code.copyPlain")}
          </button>
        </div>
      )}

      {toastMsg && (
        <div className="absolute right-0 top-full mt-2 px-3 py-1.5 rounded-[var(--radius)] text-[12px] font-medium
          bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30
          shadow-[var(--shadow-lg)] z-[var(--z-dropdown)] whitespace-nowrap dropdown-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
});

export { CopyDropdown };
