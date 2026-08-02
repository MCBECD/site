import { permanentRedirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function LocalePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  permanentRedirect(`/${locale}/docs`);
}
