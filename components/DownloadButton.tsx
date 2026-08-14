"use client";

import { memo, useCallback } from "react";
import { Download } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface DownloadButtonProps {
  filename: string;
  getContent: () => string;
}

/** Sanitize a filename for use in a download attribute (strip path traversal sequences) */
function sanitizeFilename(name: string): string {
  // Strip directory traversal and path separators, keep only word chars and hyphens
  return name.replace(/\.+/g, "").replace(/[/\\]/g, "_");
}

export const DownloadButton = memo(function DownloadButton({ filename, getContent }: DownloadButtonProps) {
  const { t } = useLocale();

  const handleDownload = useCallback(() => {
    try {
      const content = getContent();
      const safeName = sanitizeFilename(filename);
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}.mdx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[DownloadButton] Failed to trigger download:", err);
    }
  }, [filename, getContent]);

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 h-11 px-2 rounded-[var(--radius)] text-[13px]
        text-[var(--color-text-secondary)]
        hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]
        transition-colors duration-100"
      title={t("code.download")}
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{t("code.download")}</span>
    </button>
  );
});
