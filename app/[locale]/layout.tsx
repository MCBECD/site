import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/shared";
import { getAllDocs } from "@/lib/docs";
import type { DocMeta } from "@/lib/docs";
import { AppShell } from "./AppShell";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/** @why static export 需要为每个 locale 生成页面 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL("https://mcbecd.pages.dev"),
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}`]),
      ),
    },
    openGraph: {
      locale,
      type: "website",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  let docs: DocMeta[] = getAllDocs(locale); // @performance 同步读取
  /* @why 界面语言可能没有对应文档，回退英文 */
  if (docs.length === 0) {
    docs = getAllDocs("en");
  }

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AppShell locale={locale} docs={docs}>
        {children}
      </AppShell>
    </NextIntlClientProvider>
  );
}
