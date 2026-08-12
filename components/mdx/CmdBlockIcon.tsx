"use client";

import { useLocale } from "@/contexts/LocaleContext";

export function CmdBlockIcon({ type }: { type: string }) {
  const { t } = useLocale();
  return (
    <img
      src={`/icons/cmd/${type}.png`}
      alt={t("cmd.iconAlt", { type })}
      width={24}
      height={24}
      className="cmd-icon shrink-0 mt-2 mr-1"
    />
  );
}
