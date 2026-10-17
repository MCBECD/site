"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { SettingsProvider, useSettings, DEFAULT_LOCALE } from "@/contexts/SettingsContext";
import { ThemeSync } from "@/contexts/ThemeSync";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { Navbar } from "@/components/Navbar";
import { SettingsPanel } from "@/components/SettingsPanel";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BackgroundLayer } from "@/components/BackgroundLayer";

function ShellInner({ children }: { children: ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  return (
    <>
      <BackgroundLayer />
      <Navbar onOpenSettings={openSettings} />
      <SettingsPanel isOpen={settingsOpen} onClose={closeSettings} />
      <main id="main-content" className="pt-[var(--navbar-height)] min-h-screen">
        <ErrorBoundary>
          <PageTransition>{children}</PageTransition>
        </ErrorBoundary>
        <ScrollToTop />
      </main>
    </>
  );
}

function SettingsAndLocale({ children, mounted }: { children: ReactNode; mounted: boolean }) {
  const { settings } = useSettings();
  const locale = mounted ? settings.locale : DEFAULT_LOCALE;
  return (
    <LocaleProvider locale={locale}>
      <ShellInner>{children}</ShellInner>
    </LocaleProvider>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SettingsProvider>
      <ThemeSync mounted={mounted}>
        <SettingsAndLocale mounted={mounted}>{children}</SettingsAndLocale>
      </ThemeSync>
    </SettingsProvider>
  );
}
