"use client";

import { X, Sun, Moon, Monitor } from "lucide-react";
import { useSettings, type Theme, type FontSize } from "@/contexts/SettingsContext";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "浅色" },
  { value: "dark", icon: Moon, label: "深色" },
  { value: "system", icon: Monitor, label: "跟随系统" },
];

const FONT_OPTIONS: { value: FontSize; label: string }[] = [
  { value: "small", label: "小" },
  { value: "medium", label: "中" },
  { value: "large", label: "大" },
];

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { settings, updateTheme, updateFontSize } = useSettings();

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} aria-hidden="true" />
      <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2
        w-[min(380px,calc(100vw-32px))] rounded-xl shadow-2xl
        bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">

        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">设置</h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 rounded-md
              text-[var(--color-text-tertiary)]
              hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* 主题 */}
          <Section title="主题">
            <div className="flex gap-1.5">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateTheme(opt.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-md text-sm transition-colors
                    ${settings.theme === opt.value
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)]" }
                  `}
                >
                  <opt.icon className="w-4 h-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>

          {/* 字体大小 */}
          <Section title="字体大小">
            <div className="flex gap-1.5">
              {FONT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateFontSize(opt.value)}
                  className={`flex-1 min-h-[44px] rounded-md text-sm transition-colors
                    ${settings.fontSize === opt.value
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)]" }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-medium text-[var(--color-text-primary)] mb-3">{title}</div>
      {children}
    </div>
  );
}
