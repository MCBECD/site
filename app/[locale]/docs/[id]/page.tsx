import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getDocById, getDocRawContent, getAllDocs } from "@/lib/docs";
import { docLocales } from "@/i18n/shared";
import { DocDetailClient } from "./DocDetailClient";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

/** @why static export 需要预生成所有文档页面 */
export async function generateStaticParams() {
  const paths: { locale: string; id: string }[] = [];
  for (const locale of docLocales) {
    const docs = getAllDocs(locale);
    for (const doc of docs) {
      paths.push({ locale, id: doc.id });
    }
  }
  return paths;
}

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const doc = getDocById(locale, id);
  if (!doc) return { title: "404" };
  return { title: doc.meta.title };
}

export default async function DocDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const doc = getDocById(locale, id);
  if (!doc) {
    notFound();
  }

  /* @constraint rawContent 用于下载功能，需原始内容 */
  const rawContent = getDocRawContent(locale, id) ?? "";

  return (
    <DocDetailClient doc={doc} locale={locale} rawContent={rawContent} />
  );
}
