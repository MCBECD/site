"use client";

const TABS = [
  { key: "docs", label: "基础命令" },
  { key: "community", label: "社区文档" },
] as const;

export type PageTabKey = (typeof TABS)[number]["key"];

interface PageTabsProps {
  active: PageTabKey;
  onChange: (key: PageTabKey) => void;
}

/** Tab switcher for the merged root page. Switching tabs does not change the URL. */
export function PageTabs({ active, onChange }: PageTabsProps) {
  return (
    <nav
      className="inline-flex items-center gap-0.5 p-0.5 rounded-full bg-[var(--color-bg-tertiary)]"
      aria-label="页面切换"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className="flex items-center justify-center px-4 py-1.5 text-[13px] rounded-full transition-[color,background] duration-[var(--duration-fast)]"
            style={{
              color: isActive ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
              background: isActive ? "var(--color-bg-elevated)" : "transparent",
            }}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}