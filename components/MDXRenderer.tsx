import { MDXRemote } from "next-mdx-remote/rsc";
import { createHighlighter, type Highlighter } from "shiki";
import type { JSX, ReactNode } from "react";
import { Suspense, isValidElement } from "react";
import { Loader2 } from "lucide-react";
import remarkGfm from "remark-gfm";
import { remarkGithubAlerts } from "@/lib/mdx/remark-github-alerts";
import { CodeBlockClient } from "./CodeBlockClient";

const mcfunctionSyntax = {
  name: "mcfunction",
  scopeName: "source.mcfunction",
  fileTypes: ["mcfunction"],
  repository: {},
  patterns: [
    {
      name: "keyword.control",
      match: '^/?[a-zA-Z0-9_]+',
    },
    {
      name: "string.quoted.double",
      match: '"[^"]*"',
    },
    {
      name: "string.quoted.single",
      match: "'[^']*'",
    },
    {
      name: "entity.name.function",
      match: '@[a-z]'
    },
    {
      name: "variable.parameter",
      match: '[a-zA-Z_][a-zA-Z0-9_]+',
    },
    {
      name: "constant.numeric",
      match: '[\\^~0-9.][0-9.]*',
    },
  ]
};

const components = {
  /* h2 is hidden in doc detail pages — the header card already shows the title */
  h2: () => null,
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
  /* GitHub-style task list checkbox */
  input: ({ checked, disabled, type, ...props }: JSX.IntrinsicElements["input"]) => {
    if (type === "checkbox") {
      return (
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled ?? true}
          className="gh-checkbox"
          {...props}
        />
      );
    }
    return <input type={type} checked={checked} disabled={disabled} {...props} />;
  },
  /* Details/summary for collapsible sections */
  details: ({ children, ...props }: JSX.IntrinsicElements["details"]) => (
    <details className="gh-details my-4 rounded-lg border border-[var(--color-border)]" {...props}>
      {children}
    </details>
  ),
  summary: ({ children, ...props }: JSX.IntrinsicElements["summary"]) => (
    <summary className="gh-summary cursor-pointer px-4 py-2.5 text-[13px] font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)] rounded-t-lg select-none hover:bg-[var(--color-bg-secondary)] transition-colors" {...props}>
      {children}
    </summary>
  ),
  /* Keyboard shortcut */
  kbd: ({ children, ...props }: JSX.IntrinsicElements["kbd"]) => (
    <kbd
      className="inline-flex items-center h-5 px-1.5 rounded text-[11px] font-mono leading-none
        bg-[var(--color-kbd-bg)] border border-[var(--color-kbd-border)] text-[var(--color-kbd-text)]"
      {...props}
    >
      {children}
    </kbd>
  ),
};

/** Extract <code> element from <pre><code>...</code></pre> structure */
function extractCodeChild(children: ReactNode): React.ReactElement | null {
  const isCode = (el: ReactNode) => isValidElement(el) && (el.type === "code" || el.type === components.code);
  if (isCode(children)) return children as React.ReactElement;
  if (Array.isArray(children) && children.length === 1)
    if (isCode(children[0])) return children[0] as React.ReactElement;
  return null;
}

let highlighter: Highlighter | null = null;

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: [mcfunctionSyntax],
    });
  }
  return highlighter;
}

async function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const hl = await getHighlighter();
  const resolvedLang = hl.getLoadedLanguages().includes(lang) ? lang : "mcfunction";
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
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm, remarkGithubAlerts],
          },
        }}
      />
    </Suspense>
  );
}