"use client";

import { useCallback } from "react";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  filename: string;
  getContent: () => string;
  label: string;
}

export function DownloadButton({ filename, getContent, label }: DownloadButtonProps) {
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
        bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]
        hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text-primary)]
        transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
      title={label}
    >
      <Download className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
