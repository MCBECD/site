"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { DocMeta } from "@/lib/docs";

interface DocsContextValue {
  docs: DocMeta[];
  docMap: Map<string, DocMeta>;
}

const DocsContext = createContext<DocsContextValue | null>(null);

export function DocsProvider({ docs, children }: { docs: DocMeta[]; children: ReactNode }) {
  const visibleDocs = useMemo(() => docs.filter((d) => !d.hidden), [docs]);
  const docMap = useMemo(() => new Map(docs.map((d) => [d.id, d])), [docs]);
  return (
    <DocsContext value={{ docs: visibleDocs, docMap }}>
      {children}
    </DocsContext>
  );
}

export function useDocs(): DocsContextValue {
  const ctx = useContext(DocsContext);
  if (!ctx) throw new Error("useDocs must be used within DocsProvider");
  return ctx;
}