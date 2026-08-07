import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "MCBECD - Minecraft 基岩版命令库",
  description: "社区贡献的 Minecraft 基岩版命令库 — 可直接复制使用的命令集合",
  icons: {
    icon: "https://avatars.githubusercontent.com/u/312049267?s=64",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preload" href="https://avatars.githubusercontent.com/u/312049267?s=48" as="image" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var settings = JSON.parse(localStorage.getItem('mcbecd-settings') || '{}');
                var theme = settings.theme;
                if (theme === 'dark' || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
                var fm = settings.fontSize;
                var mul = fm === 'small' ? 0.875 : fm === 'large' ? 1.125 : 1;
                document.documentElement.style.setProperty('--font-size-multiplier', mul);
              } catch(e) {}
            })();`,
          }}
        />\n      </head>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

import { AppShell } from "@/components/AppShell";
