/**
 * Plugin system — Lightweight toggle management
 *
 * Each plugin has a single boolean toggle, stored in Settings.plugins.
 * Provides toggle / isEnabled utility functions.
 */

import { useCallback } from "react";
import type { PluginStates } from "@/contexts/SettingsContext";

function togglePluginState(
  plugins: PluginStates,
  id: string,
  enabled?: boolean,
): PluginStates {
  const next = { ...plugins };
  next[id] = enabled ?? !next[id];
  return next;
}

/**
 * React hook — Creates a togglePlugin callback from setSettings.
 * Encapsulates the setState + persist pattern.
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