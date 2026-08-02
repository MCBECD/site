import { MDXRemote } from "next-mdx-remote/rsc";
import { createHighlighter } from "shiki";
import type { JSX } from "react";
import { Skeleton } from "./Skeleton";
import { Suspense } from "react";

const components = {
  pre: ({ children, ...props }: JSX.IntrinsicElements["pre"]) => (
    <pre className="overflow-x-auto rounded-lg p-4 bg-[var(--color-code-bg)] text-sm" {...props}>
      {children}
    </pre>
  ),
  code: ({ children, className, ...props }: JSX.IntrinsicElements["code"]) => {
    const match = /language-(\w+)/.exec(className ?? "");
    if (match) {
      return <CodeBlock code={String(children).trim()} lang={match[1]!} />;
    }
    return (
      <code className="px-1 py-0.5 rounded bg-[var(--color-code-bg)] text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
  table: ({ children, ...props }: JSX.IntrinsicElements["table"]) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-[var(--color-border)]" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: JSX.IntrinsicElements["th"]) => (
    <th className="border border-[var(--color-border)] px-4 py-2 text-left font-semibold bg-[var(--color-bg-tertiary)]" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: JSX.IntrinsicElements["td"]) => (
    <td className="border border-[var(--color-border)] px-4 py-2" {...props}>
      {children}
    </td>
  ),
};

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["shell", "javascript", "typescript", "json", "text"],
    });
  }
  return highlighterPromise;
}

async function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const hl = await getHighlighter();

  /* @constraint 预留 Minecraft 命令自定义语言支持，当前回退到 shell */
  const resolvedLang = hl.getLoadedLanguages().includes(lang) ? lang : "text";

  const html = hl.codeToHtml(code, {
    lang: resolvedLang,
    themes: { light: "github-light", dark: "github-dark" },
  });

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

interface MDXRendererProps {
  source: string;
}

export function MDXRenderer({ source }: MDXRendererProps) {
  return (
    <Suspense fallback={<Skeleton className="h-48 w-full" />}>
      <MDXRemote
        source={source}
        components={components}
      />
    </Suspense>
  );
}
