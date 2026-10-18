import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { getAllDocs } from "@/lib/docs";
import { AppShell } from "@/components/AppShell";
import { DocsProvider } from "@/contexts/DocsContext";
import "@/styles/globals.css";

/**
 * @why 字体必须由 next/font 在构建期下载并自托管，不能在 globals.css 里
 * `@import url(fonts.googleapis.com)`：远程 @import 位于样式表首行，是
 * render-blocking 的，且要等主 CSS 下载解析后浏览器才发现这条 @import
 * （两跳串行）。中国大陆直连 Google Fonts 通常超时，实测首屏被阻塞 20s+
 * 才渲染，期间是白屏 / 无样式闪动，这正是"打开先闪一下"的根因之一。
 * 自托管后字体与 CSS 同源、可 preload，且不依赖访客网络能否访问 Google。
 */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

const SITE_URL = "https://mcbecd.pages.dev";

/**
 * @constraint 站点是 client-side i18n + 静态导出，服务端只能产出中文 metadata。
 * SITE_TITLE / SITE_DESC / openGraph.locale / inLanguage / <html lang> 都受这条限制。
 * 要做多语言 SEO，得改成按 locale 生成静态页（或 next-intl 的 rewrite 路由）。
 */
const SITE_TITLE = "MCBECD - Minecraft 基岩版命令库";
const SITE_DESC = "社区贡献的 Minecraft 基岩版命令库 — 可直接复制使用的命令集合，涵盖 give、execute、tp、scoreboard 等核心命令";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s - MCBECD",
  },
  description: SITE_DESC,
  icons: {
    icon: "/Logo.png",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "MCBECD",
    title: SITE_TITLE,
    description: SITE_DESC,
    // TODO(seo): 还没有 OG 图，加上后把 twitter.card 一并改成 summary_large_image。
    // images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_TITLE }],
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESC,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
  other: {
    "msvalidate.01": "BF57A28CBBC9D31E13C6587516DD0F93",
  },
};

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MCBECD",
  url: SITE_URL,
  description: SITE_DESC,
  inLanguage: "zh-CN",
};

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MCBECD",
  url: SITE_URL,
  logo: "https://avatars.githubusercontent.com/u/312049267?s=192",
  sameAs: ["https://github.com/MCBECD"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const docs = getAllDocs();
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/Logo.png" as="image" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem("mcbecd-settings")||"{}");var d=s.theme==="dark"||(s.theme!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);if(d){document.documentElement.classList.add("dark")}document.documentElement.style.colorScheme=d?"dark":"light";document.documentElement.style.backgroundColor=d?"#111111":"#ffffff";if(s.colorTheme&&s.colorTheme!=="default"){document.documentElement.setAttribute("data-color-theme",s.colorTheme)}var f=s.fontSize;document.documentElement.style.setProperty("--font-size-multiplier",String(f==="small"?0.875:f==="large"?1.125:1))}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`antialiased ${inter.variable} ${jetbrainsMono.variable}`}>
        {/* @why 首屏列表在 hydration 前是 visibility:hidden（避免先闪出默认第 1 页
            再被 localStorage 里的页码替换）。禁用 JS 时必须放行，否则列表永远不可见。
            用 dangerouslySetInnerHTML：React 对 <noscript> 子节点在启用 JS 的浏览器里
            按文本解析，普通 JSX 子节点会触发 hydration 不一致。 */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: "<style>.list-gate{visibility:visible !important}</style>",
          }}
        />
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[9999] focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-[var(--radius-sm)] focus-visible:bg-[var(--color-accent)] focus-visible:text-[var(--color-on-accent)] focus-visible:text-[13px] focus-visible:font-semibold focus-visible:outline-none focus-visible:shadow-[var(--shadow-lg)]"
        >
          Skip to content
        </a>
        <DocsProvider docs={docs}>
          <AppShell>{children}</AppShell>
        </DocsProvider>
      </body>
    </html>
  );
}
