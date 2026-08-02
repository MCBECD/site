import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getDocById, getDocRawContent } from "@/lib/docs";
import { DocDetailClient } from "./DocDetailClient";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale, id } = await params;
  const doc = getDocById(locale, id);
  if (!doc) return { title: "404" };
  return { title: doc.meta.title };
}

export default async function DocDetailPage({ params }: Props) {
  const { locale, id } = await params;
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
