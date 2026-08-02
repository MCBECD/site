"use client";

import { useState, useCallback } from "react";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DocTitleProvider, useDocTitle } from "@/contexts/DocTitleContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { BackgroundLayer } from "@/components/BackgroundLayer";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "@/i18n/navigation";
import type { DocMeta } from "@/lib/docs";

interface AppShellProps {
  children: React.ReactNode;
  locale: string;
  docs: DocMeta[];
}

function AppShellInner({ children, locale, docs }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { title: docTitle } = useDocTitle();
  const pathname = usePathname();

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  return (
    <SettingsProvider>
      <ThemeProvider>
        <DocTitleProvider>
          <BackgroundLayer />
          <Navbar
            docTitle={docTitle ?? undefined}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
            onOpenSettings={openSettings}
          />
          <Sidebar
            docs={docs}
            locale={locale}
            open={sidebarOpen}
            onClose={closeSidebar}
          />
          <SettingsPanel open={settingsOpen} onClose={closeSettings} />
          {/* @constraint 主内容区偏移导航栏和侧边栏 */}
          {/* @why AnimatePresence + key 实现一镜到底页面渐变滑动过渡 */}
          <main className="pt-[var(--navbar-height)] md:pl-[var(--sidebar-width)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </DocTitleProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}

export function AppShell(props: AppShellProps) {
  return <AppShellInner {...props} />;
}
