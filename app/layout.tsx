import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeScript } from "@/components/ThemeScript";

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
        <ThemeScript />
      </head>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

import { AppShell } from "@/components/AppShell";