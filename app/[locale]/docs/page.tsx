import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAllDocs } from "@/lib/docs";
import { Link } from "@/i18n/navigation";
import { FileText, ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function DocsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const docs = getAllDocs(locale);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          {t("sidebar.documentation")}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t("common.tagline")}
        </p>
      </div>

      {docs.length === 0 ? (
        <p className="text-[var(--color-text-tertiary)]">{t("doc.noDocs")}</p>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <Link
              key={doc.id}
              href={`/docs/${doc.id}`}
              locale={locale}
              className="block group p-4 rounded-lg border border-[var(--color-border)]
                bg-[var(--color-bg-primary)] hover:border-[var(--color-accent)]
                hover:bg-[var(--color-sidebar-active)] transition-all no-underline"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-[var(--color-accent)] shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-base font-medium text-[var(--color-text-primary)] truncate">
                      {doc.title}
                    </h2>
                    {doc.description && (
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5 truncate">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--color-text-tertiary)]
                  group-hover:text-[var(--color-accent)] transition-colors shrink-0 ml-3" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
