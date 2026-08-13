"use client";

import { memo } from "react";
import { useLocale } from "@/contexts/LocaleContext";

export const CmdBlockIcon = memo(function CmdBlockIcon({ type }: { type: string }) {
  const { t } = useLocale();
  return (
    <img
      src={`/icons/cmd/${type}.png`}
      alt={t("cmd.iconAlt", { type })}
      width={24}
      height={24}
      className="cmd-icon shrink-0 mr-1"
    />
  );
});
