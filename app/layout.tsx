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
  /**
   * @why 等宽字体不进首屏 preload。它总共只服务代码块，而代码块在文档详情页、位于
   * 首屏之下；`display: swap` 保证它到位前先显示回退等宽字体，不会阻塞渲染。
   * 首屏少一条 30KB 的 preload，就少一份和关键 JS 抢带宽的竞争者。
   */
  preload: false,
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
        {/* @why 不再手写 Logo.png 的 preload：Navbar 里 <img fetchPriority="high">
            已经让 Next 自动输出同一条 preload，手写会产生重复的 Link 头（实测响应头
            里出现两次），白白占掉一次优先级排队。 */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        {/* @why 构建号走 <meta> 而不是 /version.json：那个文件是 CI 产物，Cloudflare
            Pages 独立构建时不存在（线上一直 404）。这里由 Server Component 直接渲染，
            与谁在构建无关，也不额外发请求。SettingsPanel「关于」页从 meta 里读。 */}
        <meta name="mcbecd-build" content={process.env.NEXT_PUBLIC_BUILD_ID || ""} />
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
        {/* @why 列表不再有任何"hydration 前先隐藏"的门控。
            旧做法是 .list-gate 无条件 visibility:hidden 直到 React 接管，实测每个访客
            都要盯着一块空白 1.4s（快网）到 4.4s（Slow 4G + 4× CPU）——这是"打开很慢"
            最主要的体感来源，比任何字节优化都更伤。
            代价：上次翻到第 N 页 / 用列表视图的回头客，会先看到第 1 页（或卡片视图），
            hydration 完成后自然换成正确状态。一次内容替换，好过几秒空白。 */}
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[9999] focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-[var(--radius-sm)] focus-visible:bg-[var(--color-accent)] focus-visible:text-[var(--color-on-accent)] focus-visible:text-[13px] focus-visible:font-semibold focus-visible:outline-none focus-visible:shadow-[var(--shadow-lg)]"
        >
          Skip to content
        </a>
        <DocsProvider index={docs.map(({ id, title, category }) => ({ id, title, category }))}>
          <AppShell>{children}</AppShell>
        </DocsProvider>
      </body>
    </html>
  );
}
