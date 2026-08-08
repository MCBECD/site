"use client";

import { useCallback } from "react";
import { Download } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface DownloadButtonProps {
  filename: string;
  getContent: () => string;
}

export function DownloadButton({ filename, getContent }: DownloadButtonProps) {
  const { t } = useLocale();

  const handleDownload = useCallback(() => {
    const content = getContent();
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.mdx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filename, getContent]);

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[var(--radius)] text-[13px]
        text-[var(--color-text-secondary)]
        hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]
        transition-colors"
      title={t("code.download")}
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{t("code.download")}</span>
    </button>
  );
}
