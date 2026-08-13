"use client";

import { memo, useEffect, useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";

const COMMANDS = [
  { cmd: "/give @s diamond_sword", descKey: "landing.cmdGive" },
  { cmd: "/execute as @e[type=cow] run tp ~ ~10 ~", descKey: "landing.cmdExecute" },
  { cmd: '/tellraw @a {"text":"Hello","color":"gold"}', descKey: "landing.cmdTellraw" },
  { cmd: "/scoreboard objectives add deaths deathCount", descKey: "landing.cmdScoreboard" },
] as const;

const ROTATION_INTERVAL = 3500;

export const CommandPreview = memo(function CommandPreview() {
  const { t } = useLocale();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % COMMANDS.length);
    }, ROTATION_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 detail-enter">
      {/* Command list */}
      <div className="space-y-2.5">
        {COMMANDS.map((item, i) => {
          const isActive = i === active;
          return (
            <div
              key={item.cmd}
              className={`text-[13px] leading-relaxed transition-opacity duration-200 ${
                isActive ? "opacity-100" : "opacity-35"
              }`}
            >
              <span className="font-mono text-[var(--color-text-primary)]">{item.cmd}</span>
              {isActive && (
                <div className="text-[12px] text-[var(--color-accent)] mt-0.5 ml-1">
                  {t(item.descKey)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
