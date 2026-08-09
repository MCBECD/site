"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ToggleSwitch } from "./ToggleSwitch";

interface PluginCardProps {
  name: string;
  desc: string;
  Icon: LucideIcon;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children: ReactNode;
}

/** 可折叠插件卡片 — toggle 开关 + 展开设置区域 */
export function PluginCard({ name, desc, Icon, enabled, onToggle, children }: PluginCardProps) {
  return (
    <div
      className={`rounded-lg border transition-all duration-200 ${
        enabled
          ? "border-[var(--color-accent)]/30 bg-[var(--color-bg-primary)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] opacity-60"
      }`}
    >
      {/* header row */}
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
            enabled
              ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
              : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]"
          }`}
        >
          <Icon className="w-[18px] h-[18px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[var(--color-text-primary)] leading-tight">{name}</div>
          <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 leading-snug">{desc}</div>
        </div>
        <ToggleSwitch checked={enabled} onChange={onToggle} />
      </div>

      {/* expanded settings */}
      {enabled && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)] collapse-in">
          <div className="pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}
