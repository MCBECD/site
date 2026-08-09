"use client";

import { ClipboardList } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useSettings } from "@/contexts/SettingsContext";
import { PluginCard } from "./PluginCard";

const PLUGIN_ID = "quick-reference";

export function QuickRefPluginCard() {
  const { t } = useLocale();
  const { isPluginEnabled, togglePlugin } = useSettings();
  const enabled = isPluginEnabled(PLUGIN_ID);

  return (
    <PluginCard
      name={t("plugin.quickRefName")}
      desc={t("plugin.quickRefDesc")}
      Icon={ClipboardList}
      enabled={enabled}
      onToggle={(v) => togglePlugin(PLUGIN_ID, v)}
    >
      <></>
    </PluginCard>
  );
}
