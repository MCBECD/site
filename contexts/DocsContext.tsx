"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { DocMeta } from "@/lib/docs";

interface DocsContextValue {
  docs: DocMeta[];
  docMap: Map<string, DocMeta>;
}

const DocsContext = createContext<DocsContextValue | null>(null);

export function DocsProvider({ docs, children }: { docs: DocMeta[]; children: ReactNode }) {
  const docMap = new Map(docs.map((d) => [d.id, d]));
  return (
    <DocsContext value={{ docs, docMap }}>
      {children}
    </DocsContext>
  );
}

export function useDocs(): DocsContextValue {
  const ctx = useContext(DocsContext);
  if (!ctx) throw new Error("useDocs must be used within DocsProvider");
  return ctx;
}