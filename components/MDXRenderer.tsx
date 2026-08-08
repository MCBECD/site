import { MDXRemote } from "next-mdx-remote/rsc";
import { createHighlighter, type Highlighter } from "shiki";
import type { JSX, ReactNode } from "react";
import { Suspense, isValidElement } from "react";
import { Loader2 } from "lucide-react";
import remarkGfm from "remark-gfm";
import { CodeBlockClient } from "./CodeBlockClient";

const components = {
  pre: async ({ children }: { children: ReactNode }) => {
    const codeEl = extractCodeChild(children);
    if (!codeEl) {
      return <pre className="overflow-x-auto rounded-lg p-4 bg-[var(--color-code-bg)] text-sm">{children}</pre>;
    }
    const props = codeEl.props as Record<string, unknown>;
    const className = (props.className as string) ?? "";
    const match = /language-(\w+)/.exec(className);
    const lang = match ? match[1]! : "text";
    const code = String(props.children ?? "").trim();
    return <CodeBlock code={code} lang={lang} />;
  },
  code: ({ children, ...props }: JSX.IntrinsicElements["code"]) => (
    <code className="text-[var(--color-accent)] bg-[var(--color-code-bg)] px-1.5 py-0.5 rounded text-sm" {...props}>
      {children}
    </code>
  ),
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

/** 从 <pre><code>...</code></pre> 结构中提取 <code> 元素 */
function extractCodeChild(children: ReactNode): React.ReactElement | null {
  if (isValidElement(children) && children.type === "code") return children as React.ReactElement;
  if (Array.isArray(children) && children.length === 1) {
    const child = children[0];
    if (isValidElement(child) && child.type === "code") return child as React.ReactElement;
  }
  return null;
}

let highlighter: Highlighter | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["shell", "javascript", "typescript", "json", "text"],
    });
  }
  return highlighter;
}

async function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const hl = await getHighlighter();
  const resolvedLang = hl.getLoadedLanguages().includes(lang) ? lang : "text";
  const html = hl.codeToHtml(code, {
    lang: resolvedLang,
    themes: { light: "github-light", dark: "github-dark" },
  });
  return <CodeBlockClient html={html} code={code} displayLang={lang === "text" ? "" : lang} />;
}

export function MDXRenderer({ source }: { source: string }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
        </div>
      }
    >
      <MDXRemote
        source={source}
        components={components}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </Suspense>
  );
}
