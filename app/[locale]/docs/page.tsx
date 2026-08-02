import { setRequestLocale } from "next-intl/server";
import { getAllDocs } from "@/lib/docs";
import { docLocales } from "@/i18n/shared";
import type { DocMeta } from "@/lib/docs";
import DocsPageClient from "./DocsPageClient";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function DocsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  let docs: DocMeta[] = getAllDocs(locale);
  /* @why 界面语言可能没有对应文档，回退英文 */
  if (docs.length === 0) {
    docs = getAllDocs("en");
  }
  /* @constraint 非文档语言的链接必须指向 en，否则 404 */
  const linkLocale = (docLocales as readonly string[]).includes(locale) ? locale : "en";

  return <DocsPageClient docs={docs} locale={linkLocale} />;
}
