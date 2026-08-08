import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
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
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem("mcbecd-settings")||"{}");if(s.theme==="dark"||(s.theme!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches)){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";var f=s.fontSize;document.documentElement.style.setProperty("--font-size-multiplier",String(f==="small"?0.875:f==="large"?1.125:1))}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
