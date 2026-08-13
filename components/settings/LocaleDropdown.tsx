"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { LOCALES, NATIVE_NAMES, type Locale } from "@/lib/i18n/types";

/** Language selector dropdown — uses portal positioning to prevent clipping */
export function LocaleDropdown({ value, onChange }: { value: Locale; onChange: (v: Locale) => void }) {
  const [open, setOpen] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelect = useCallback(
    (v: Locale) => { onChange(v); setOpen(false); setActiveIndex(-1); },
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
      setActiveIndex(-1);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Keyboard navigation: Escape, Arrow keys, Enter/Space
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
          const next = prev < LOCALES.length - 1 ? prev + 1 : 0;
          itemRefs.current[next]?.focus();
          return next;
        });
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev > 0 ? prev - 1 : LOCALES.length - 1;
          itemRefs.current[next]?.focus();
          return next;
        });
        return;
      }
      if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
        itemRefs.current[0]?.focus();
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        const last = LOCALES.length - 1;
        setActiveIndex(last);
        itemRefs.current[last]?.focus();
        return;
      }
      if (e.key === "Tab") {
        // Allow Tab to close the dropdown and continue normal tab flow
        setOpen(false);
        setActiveIndex(-1);
        return;
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Set initial active index to current value
  useEffect(() => {
    if (open) {
      const idx = LOCALES.indexOf(value);
      setActiveIndex(idx >= 0 ? idx : 0);
    }
  }, [open, value]);

  // Focus the active item when dropdown opens
  useEffect(() => {
    if (open && activeIndex >= 0) {
      itemRefs.current[activeIndex]?.focus();
    }
  }, [open, activeIndex]);

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
            aria-activedescendant={activeIndex >= 0 ? `locale-option-${activeIndex}` : undefined}
            className="fixed py-1 rounded-[var(--radius)] border border-[var(--color-border)]
              bg-[var(--color-bg-primary)] shadow-lg z-[var(--z-portal)] overflow-y-auto dropdown-in"
            style={{
              top: flipUp ? undefined : pos.top + pos.height + 6,
              bottom: flipUp ? window.innerHeight - pos.top + 6 : undefined,
              left: pos.left,
              width: pos.width,
              maxHeight: "40vh",
            }}
          >
            {LOCALES.map((loc, i) => (
              <button
                key={loc}
                id={`locale-option-${i}`}
                ref={(el) => { itemRefs.current[i] = el; }}
                type="button"
                role="option"
                aria-selected={loc === value}
                onClick={() => handleSelect(loc)}
                className={`w-full text-left px-3 py-3 min-h-[44px] text-[13px] flex items-center justify-between transition-colors
                  ${i === activeIndex
                    ? "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]"
                    : loc === value
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
