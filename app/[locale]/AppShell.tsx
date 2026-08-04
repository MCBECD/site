"use client";

import { useState, useCallback, memo } from "react";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DocTitleProvider, useDocTitle } from "@/contexts/DocTitleContext";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { BackgroundLayer } from "@/components/BackgroundLayer";
import { SettingsPanel } from "@/components/SettingsPanel";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "@/i18n/navigation";
import type { DocMeta, Chapter } from "@/lib/docs";

/* ── 页面过渡 ── */

interface PageTransitionProps {
  children: React.ReactNode;
  pathname: string;
}

const PageTransition = memo(
  function PageTransition({ children, pathname }: PageTransitionProps) {
    return (
      <AnimatePresence mode="popLayout">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{
            duration: 0.15,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  },
  (prev, next) => prev.pathname === next.pathname,
);

/* ── 路径感知的内容包装 ── */

function PathAwareContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <PageTransition pathname={pathname}>{children}</PageTransition>;
}

/* ── Shell 内部 ── */

function ShellInner({ children, locale, docs, chapters }: {
  children: React.ReactNode;
  locale: string;
  docs: DocMeta[];
  chapters: Chapter[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { title: docTitle } = useDocTitle();

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  return (
    <>
      <div className="fixed inset-0 bg-[var(--color-bg-primary)] -z-20" aria-hidden="true" />
      <BackgroundLayer />
      <Navbar
        docTitle={docTitle ?? undefined}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        onOpenSettings={openSettings}
      />
      <Sidebar
        docs={docs}
        chapters={chapters}
        locale={locale}
        open={sidebarOpen}
        onClose={closeSidebar}
      />
      <SettingsPanel open={settingsOpen} onClose={closeSettings} />
      <main className="pt-[var(--navbar-height)] md:pl-[var(--sidebar-width)] min-h-screen">
        {children}
      </main>
    </>
  );
}

/* ── 导出 ── */

interface AppShellProps {
  children: React.ReactNode;
  locale: string;
  docs: DocMeta[];
  chapters: Chapter[];
}

export function AppShell({ children, locale, docs, chapters }: AppShellProps) {
  return (
    <AuthProvider>
    <SettingsProvider>
      <ThemeProvider>
        <DocTitleProvider>
          <ShellInner locale={locale} docs={docs} chapters={chapters}>
            <PathAwareContent>{children}</PathAwareContent>
          </ShellInner>
        </DocTitleProvider>
      </ThemeProvider>
    </SettingsProvider>
    </AuthProvider>
  );
}
