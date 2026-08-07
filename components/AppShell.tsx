"use client";

import { useState, useCallback } from "react";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/Navbar";
import { SettingsPanel } from "@/components/SettingsPanel";

function ShellInner({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  return (
    <>
      <div className="fixed inset-0 bg-[var(--color-bg-primary)] -z-20" aria-hidden="true" />
      <Navbar onOpenSettings={openSettings} />
      <SettingsPanel open={settingsOpen} onClose={closeSettings} />
      <main className="pt-[var(--navbar-height)] min-h-screen">
        {children}
      </main>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <ShellInner>{children}</ShellInner>
      </ThemeProvider>
    </SettingsProvider>
  );
}
