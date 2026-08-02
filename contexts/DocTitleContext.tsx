"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface DocTitleContextValue {
  title: string | null;
  setTitle: (title: string | null) => void;
}

const DocTitleContext = createContext<DocTitleContextValue>({
  title: null,
  setTitle: () => {},
});

export function DocTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState<string | null>(null);
  return (
    <DocTitleContext value={{ title, setTitle }}>
      {children}
    </DocTitleContext>
  );
}

export function useDocTitle(): DocTitleContextValue {
  return useContext(DocTitleContext);
}
