import { MDXRemote } from "next-mdx-remote/rsc";
import { createHighlighter, type Highlighter } from "shiki";
import type { JSX, ReactNode } from "react";
import { isValidElement } from "react";
import remarkGfm from "remark-gfm";
import { CodeBlockClient } from "./CodeBlockClient";

let highlighter: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

function ensureHighlighter(): Promise<Highlighter> {
  if (highlighter) return Promise.resolve(highlighter);
  if (highlighterPromise) return highlighterPromise;
  highlighterPromise = createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["shell", "javascript", "typescript", "json", "text"],
  }).then((hl) => {
    highlighter = hl;
    return hl;
  });
  return highlighterPromise;
}

function getHighlighter(): Highlighter | null {
  return highlighter;
}

const CodeComp = ({ children, ...props }: JSX.IntrinsicElements["code"]) => (
  <code className="text-[var(--color-accent)] bg-[var(--color-code-bg)] px-1.5 py-0.5 rounded text-sm" {...props}>
    {children}
  </code>
);

export const components = {
  pre: ({ children }: { children: ReactNode }) => {
    const hl = getHighlighter();
    const codeEl = extractCodeChild(children);
    if (!codeEl) {
      return <pre className="overflow-x-auto rounded-lg p-4 bg-[var(--color-code-bg)] text-sm">{children}</pre>;
    }
    const props = codeEl.props as Record<string, unknown>;
    const className = (props.className as string) ?? "";
    const match = /language-(\w+)/.exec(className);
    const lang = match ? match[1]! : "text";
    const code = String(props.children ?? "").trim();

    if (!hl) {
      return (
        <pre className="overflow-x-auto rounded-lg p-4 bg-[var(--color-code-bg)] text-sm">
          <CodeComp>{code}</CodeComp>
        </pre>
      );
    }

    return <CodeBlock code={code} lang={lang} highlighter={hl} />;
  },
  code: CodeComp,
  a: ({ children, href, ...props }: JSX.IntrinsicElements["a"]) => {
    const isExternal = href && (href.startsWith("http://") || href.startsWith("https://"));
    return (
      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="text-[var(--color-accent)] underline underline-offset-2 decoration-[var(--color-accent)]/30 hover:decoration-[var(--color-accent)]"
        {...props}
      >
        {children}
      </a>
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

function extractCodeChild(children: ReactNode): React.ReactElement | null {
  const isCodeEl = (el: React.ReactElement): boolean =>
    el.type === "code" || el.type === CodeComp;

  if (isValidElement(children) && isCodeEl(children)) return children;
  if (Array.isArray(children)) {
    for (const child of children) {
      if (isValidElement(child) && isCodeEl(child)) return child;
    }
  }
  return null;
}

function CodeBlock({ code, lang, highlighter: hl }: { code: string; lang: string; highlighter: Highlighter }) {
  const resolvedLang = hl.getLoadedLanguages().includes(lang) ? lang : "text";

  const html = hl.codeToHtml(code, {
    lang: resolvedLang,
    themes: { light: "github-light", dark: "github-dark" },
  });

  return <CodeBlockClient html={html} code={code} displayLang={lang === "text" ? "" : lang} />;
}

interface MDXRendererProps {
  source: string;
}

export async function MDXRenderer({ source }: MDXRendererProps) {
  await ensureHighlighter();
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
    />
  );
}