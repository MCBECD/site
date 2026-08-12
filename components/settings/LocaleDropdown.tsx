"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { LOCALES, NATIVE_NAMES, type Locale } from "@/lib/i18n/types";

export function LocaleDropdown({ value, onChange }: { value: Locale; onChange: (v: Locale) => void }) {
  const [open, setOpen] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const select = useCallback(
    (v: Locale) => { onChange(v); setOpen(false); },
    [onChange],
  );

  const [pos, setPos] = useState<{ top: number; left: number; width: number; height: number }>({
    top: 0, left: 0, width: 0, height: 0,
  });

  // Track trigger position
  useEffect(() => {
    if (!open) return;
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    const below = window.innerHeight - rect.bottom;
    setFlipUp(below < 240 && rect.top > below);

    const onScroll = () => {
      const r = el.getBoundingClientRect();
      setPos({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const ArrowIcon = open ? ChevronUp : ChevronDown;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-10 flex items-center justify-between px-3 rounded-[var(--radius)] text-[13px]
          bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]
          border border-[var(--color-border)]
          hover:border-[var(--color-accent)]/30
          transition-colors text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{NATIVE_NAMES[value]}</span>
        <ArrowIcon className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
      </button>

      {open &&
        createPortal(
          <div
            ref={listRef}
            role="listbox"
            className="fixed py-1 rounded-[var(--radius)] border border-[var(--color-border)]
              bg-[var(--color-bg-primary)] shadow-lg z-[60] overflow-y-auto dropdown-in"
            style={{
              top: flipUp ? undefined : pos.top + pos.height + 6,
              bottom: flipUp ? window.innerHeight - pos.top + 6 : undefined,
              left: pos.left,
              width: pos.width,
              maxHeight: "40vh",
            }}
          >
            {LOCALES.map((loc) => (
              <button
                key={loc}
                type="button"
                role="option"
                aria-selected={loc === value}
                onClick={() => select(loc)}
                className={`w-full text-left px-3 py-2 text-[13px] flex items-center justify-between transition-colors
                  ${loc === value
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"}`}
              >
                <span>{NATIVE_NAMES[loc]}</span>
                {loc === value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
