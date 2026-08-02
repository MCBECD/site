import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "MCCD - Minecraft Commands Documentation",
  description: "Professional, immersive, multi-language Minecraft commands documentation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* @constraint 预防止闪烁：在 JS 加载前应用系统主题 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var settings = JSON.parse(localStorage.getItem('mccd-settings'));
                  var theme = settings && settings.theme;
                  if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  }
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
