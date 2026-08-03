import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "MCBECD - Minecraft Bedrock Commands Documentation",
  description: "基岩版 Minecraft 命令文档 — 最全面的 Bedrock Edition 命令参考。",
  icons: {
    icon: "https://avatars.githubusercontent.com/u/312049267?s=64",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* @perf 预加载 Navbar 头像，避免 LCP 延迟 */}
        <link rel="preload" href="https://avatars.githubusercontent.com/u/312049267?s=48" as="image" />
        {/* @constraint 预防止闪烁：在 JS 加载前应用系统主题 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
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
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
