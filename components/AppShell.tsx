"use client";

import { useState, useCallback, useEffect } from "react";
import { SettingsProvider, useSettings, DEFAULT_LOCALE } from "@/contexts/SettingsContext";
import { ThemeSync } from "@/contexts/ThemeSync";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { Navbar } from "@/components/Navbar";
import { SettingsPanel } from "@/components/SettingsPanel";
import { PageTransition } from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BackgroundLayer } from "@/components/BackgroundLayer";

function ShellInner({ children }: { children: React.ReactNode }) {
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

function SettingsAndLocale({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const locale = mounted ? settings.locale : DEFAULT_LOCALE;
  return (
    <LocaleProvider locale={locale}>
      {children}
    </LocaleProvider>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeSync>
        <SettingsAndLocale>
          <ShellInner>{children}</ShellInner>
        </SettingsAndLocale>
      </ThemeSync>
    </SettingsProvider>
  );
}
