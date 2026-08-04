"use client";

import { useState, useCallback, memo } from "react";
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

/* ── 页面过渡 ── */

/* @why 独立于 AppShell state 的纯展示组件。
 *      React.memo + 仅比较 pathname，避免 sidebar/settings/title
 *      等无关 state 变更触发 AnimatePresence 重新评估 */
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
            ease: [0.4, 0, 0.2, 1], // Material deceleration curve
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  },
  /* @why 仅 pathname 变化时重新渲染，忽略 children 引用变化 */
  (prev, next) => prev.pathname === next.pathname,
);

/* ── 路径感知的内容包装 ── */

/* @why 在 DocTitleProvider 内部读取 pathname，
 *      但作为独立组件让 PageTransition 不依赖
 *      DocTitle 的 state 变化。只监听 pathname。 */
function PathAwareContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <PageTransition pathname={pathname}>{children}</PageTransition>;
}

/* ── Shell 内部 ── */

function ShellInner({ children, locale, docs }: {
  children: React.ReactNode;
  locale: string;
  docs: DocMeta[];
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
      {/* @why 底层纯色，BackgroundLayer 在它上面用 blur+overlay 叠加背景图 */}
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
        locale={locale}
        open={sidebarOpen}
        onClose={closeSidebar}
      />
      <SettingsPanel open={settingsOpen} onClose={closeSettings} />
      {/* @constraint 主内容区偏移导航栏和侧边栏 */}
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
}

export function AppShell({ children, locale, docs }: AppShellProps) {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <DocTitleProvider>
          <ShellInner locale={locale} docs={docs}>
            <PathAwareContent>{children}</PathAwareContent>
          </ShellInner>
        </DocTitleProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
