import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { createHighlighter, type Highlighter } from "shiki";
import type { JSX, ReactNode } from "react";
import { Suspense, isValidElement } from "react";
import { Loader2 } from "lucide-react";
import remarkGfm from "remark-gfm";
import { remarkGithubAlerts } from "@/lib/mdx/remark-github-alerts";
import { CodeBlockClient } from "./CodeBlockClient";
import { CmdImpulse } from "./mdx/CmdImpulse";
import { CmdRepeat } from "./mdx/CmdRepeat";
import { CmdChain } from "./mdx/CmdChain";
import { CmdConditionalImpulse } from "./mdx/CmdConditionalImpulse";
import { CmdConditionalRepeat } from "./mdx/CmdConditionalRepeat";
import { CmdConditionalChain } from "./mdx/CmdConditionalChain";
import { CmdChat } from "./mdx/CmdChat";

const mcfunctionSyntax = {
  name: "mcfunction",
  scopeName: "source.mcfunction",
  fileTypes: ["mcfunction"],
  repository: {},
  patterns: [
    {
      name: "entity.name.function",
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
      name: "entity.name.tag",
      match: '@[a-z]'
    },
    {
      name: "constant",
      match: "\\b(true|false|null)\\b",
    },
    {
      name: "variable.parameter",
      match: '[a-zA-Z_][a-zA-Z0-9_]+',
    },
    {
      name: "constant.numeric",
      match: '[\\^~0-9\\.-][0-9\\.-]*',
    },
  ]
};

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

const components = {
  /* h2 is hidden in doc detail pages — the header card already shows the title */
  h2: () => null,
  pre: async ({ children }: { children: ReactNode }) => {
    if (!isValidElement(children))
      return <pre>{children}</pre>;

    const props = children.props as Record<string, unknown>;
    const className = (props.className as string) ?? "";
    const match = /language-(\w+)/.exec(className);
    const lang = match ? match[1]! : "mcfunction";
    const code = String(props.children ?? "").trim();

    const hl = await getHighlighter();
    const resolvedLang = hl.getLoadedLanguages().includes(lang) ? lang : "mcfunction";
    const html = hl.codeToHtml(code, {
      lang: resolvedLang,
      themes: { light: "github-light", dark: "github-dark" },
    });
    return <CodeBlockClient html={html} code={code} />;
  },
  a: ({ children, href, ...props }: JSX.IntrinsicElements["a"]) =>
    href && (href.startsWith("http://") || href.startsWith("https://")) ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--color-accent)] underline underline-offset-2 decoration-[var(--color-accent)]/30 hover:decoration-[var(--color-accent)]"
        {...props}
      >
        {children}
      </a>
    ) : (
      <Link
        href={href ?? ""}
        className="text-[var(--color-accent)] underline underline-offset-2 decoration-[var(--color-accent)]/30 hover:decoration-[var(--color-accent)]"
        {...props}
      >
        {children}
      </Link>
    ),
  table: ({ children, ...props }: JSX.IntrinsicElements["table"]) => (
    <div className="overflow-x-auto overflow-hidden my-4 rounded-lg">
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
  input: ({ checked, disabled, type, ...props }: JSX.IntrinsicElements["input"]) =>
    type === "checkbox" ? (
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled ?? true}
        className="gh-checkbox"
        {...props}
      />
    ) : (
      <input type={type} checked={checked} disabled={disabled} {...props} />
    ),
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
  /* Command block icons */
  CmdImpulse,
  CmdRepeat,
  CmdChain,
  CmdConditionalImpulse,
  CmdConditionalRepeat,
  CmdConditionalChain,
  CmdChat,
};

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