import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllDocs } from "@/lib/docs";
import { docLocales } from "@/i18n/shared";
import DocsPageClient from "./DocsPageClient";
import type { DocMeta } from "@/lib/docs";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function DocsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  let docs: DocMeta[] = getAllDocs(locale);
  if (docs.length === 0) {
    docs = getAllDocs("en");
  }
  const linkLocale = (docLocales as readonly string[]).includes(locale) ? locale : "en";

  return (
    <DocsPageClient
      docs={docs}
      locale={linkLocale}
      heading={t("sidebar.documentation")}
      tagline={t("common.tagline")}
      emptyText={t("doc.noDocs")}
    />
  );
}
