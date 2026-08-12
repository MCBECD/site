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
    <div className="terminal-block p-5 detail-enter">
      {/* Terminal header */}
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border)]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        </div>
        <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono ml-1">mcbedrock — bash</span>
      </div>

      {/* Command list */}
      <div className="pt-3 space-y-2">
        {COMMANDS.map((item, i) => {
          const isActive = i === active;
          return (
            <div
              key={item.cmd}
              className={`text-[13px] font-mono leading-relaxed transition-opacity duration-200 ${
                isActive ? "opacity-100" : "opacity-40"
              }`}
            >
              <span aria-hidden="true" className="text-[var(--color-text-tertiary)]">{"> "}</span>
              <span className="text-[var(--color-text-primary)]">{item.cmd}</span>
              {isActive && (
                <>
                  <div className="text-[11px] text-[var(--color-accent)] mt-0.5 ml-4">
                    {t(item.descKey)}
                  </div>
                  <span className="terminal-cursor" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
