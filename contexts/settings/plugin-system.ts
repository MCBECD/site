/**
 * 插件系统 — 轻量级开关管理
 *
 * 每个插件一个 boolean 开关，存在 Settings.plugins 中。
 * 提供 toggle / isEnabled 工具函数。
 */

import { useCallback } from "react";
import type { PluginStates } from "@/contexts/SettingsContext";

export function isPluginEnabled(plugins: PluginStates, id: string): boolean {
  return !!plugins[id];
}

/**
 * 切换插件状态（纯函数，不依赖 React）
 * 传入当前 plugins map + 目标状态，返回新的 plugins map
 */
export function togglePluginState(
  plugins: PluginStates,
  id: string,
  enabled?: boolean,
): PluginStates {
  const next = { ...plugins };
  next[id] = enabled ?? !next[id];
  return next;
}

/**
 * React hook — 从 setSettings 创建 togglePlugin 回调
 * 封装了 setState + persist 的模式
 */
export function createTogglePlugin(
  setSettings: React.Dispatch<React.SetStateAction<import("@/contexts/SettingsContext").Settings>>,
  persist: (s: import("@/contexts/SettingsContext").Settings) => void,
) {
  return useCallback(
    (id: string, enabled?: boolean) => {
      setSettings((prev) => {
        const plugins = togglePluginState(prev.plugins, id, enabled);
        const next = { ...prev, plugins };
        persist(next);
        return next;
      });
    },
    [setSettings, persist],
  );
}
