import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/shared";
import { getAllDocs } from "@/lib/docs";
import { AppShell } from "./AppShell";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL("https://mccd.dev"),
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

  const messages = await getMessages();
  const docs = getAllDocs(locale); // @performance 同步读取，文档量少

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AppShell locale={locale} docs={docs}>
        {children}
      </AppShell>
    </NextIntlClientProvider>
  );
}
