import type { Metadata } from "next";
import { getAllDocs } from "@/lib/docs";
import { AppShell } from "@/components/AppShell";
import { DocsProvider } from "@/contexts/DocsContext";
import "@/styles/globals.css";

const SITE_URL = "https://mcbecd.pages.dev";
// TODO(seo-locale): SITE_TITLE and SITE_DESC should be locale-aware.
// The site uses client-side i18n (static export), so server-rendered metadata
// is always Chinese. Consider generating per-locale static pages or using
// next-intl with rewrite-based routing to serve locale-specific metadata.
const SITE_TITLE = "MCBECD - Minecraft 基岩版命令库";
const SITE_DESC = "社区贡献的 Minecraft 基岩版命令库 — 可直接复制使用的命令集合，涵盖 give、execute、tp、scoreboard 等核心命令";
// TODO(seo-locale): English fallback descriptions for better international indexing:
// const SITE_DESC_EN = "Community-driven Minecraft Bedrock command library — copy-paste commands for give, execute, tp, scoreboard and more";

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
    // TODO(seo-locale): openGraph.locale is hardcoded. Should match the active locale.
    // When locale routing is implemented, generate per-locale OG metadata.
    locale: "zh_CN",
    siteName: "MCBECD",
    title: SITE_TITLE,
    description: SITE_DESC,
    // TODO(seo): Add an OG image for better social sharing previews.
    // e.g. images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_TITLE }],
  },
  twitter: {
    // NOTE: Using "summary" because there is no OG image yet.
    // Change to "summary_large_image" once an OG image is added above.
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
  // TODO(seo-locale): inLanguage should be dynamically set per locale.
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
  // TODO(seo-locale): lang attribute is hardcoded to zh-CN. The LocaleContext updates it
  // client-side via useEffect, but SSR always renders zh-CN. When locale routing is
  // implemented, generate per-locale HTML with the correct lang attribute.
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
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem("mcbecd-settings")||"{}");var d=s.theme==="dark"||(s.theme!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);if(d){document.documentElement.classList.add("dark")}document.documentElement.style.colorScheme=d?"dark":"light";if(s.colorTheme&&s.colorTheme!=="default"){document.documentElement.setAttribute("data-color-theme",s.colorTheme)}var f=s.fontSize;document.documentElement.style.setProperty("--font-size-multiplier",String(f==="small"?0.875:f==="large"?1.125:1))}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
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
