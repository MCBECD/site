import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getDocById, getDocRawContent, getAllDocs, getAdjacentDocs, getChapterProgress } from "@/lib/docs";
import { docLocales } from "@/i18n/shared";
import { DocDetailClient } from "./DocDetailClient";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateStaticParams() {
  const paths: { locale: string; id: string }[] = [];
  for (const locale of docLocales) {
    for (const doc of getAllDocs(locale)) {
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

  const rawContent = getDocRawContent(locale, id) ?? "";
  const adjacent = getAdjacentDocs(locale, id);
  const chapterProgress = getChapterProgress(locale, id);

  return (
    <DocDetailClient
      doc={doc}
      locale={locale}
      rawContent={rawContent}
      adjacent={adjacent}
      chapterProgress={chapterProgress}
    />
  );
}
