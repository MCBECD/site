import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import type { CSSProperties, JSX, ReactNode } from "react";
import { Suspense, isValidElement } from "react";
import { Loader2 } from "lucide-react";
import remarkGfm from "remark-gfm";
import { rehypeGithubAlerts } from "@/lib/mdx/rehype-github-alerts";
import { CodeBlockClient } from "./CodeBlockClient";
import { ExternalLink } from "./ExternalLink";
import { makeCmdBlock } from "./mdx/CmdBlock";
import { getHighlighter } from "@/lib/shiki";

/**
 * Sanitize an href value to prevent javascript: and other dangerous protocol URLs.
 * Only allows relative paths (starting with / or #) and http(s) URLs.
 */
function sanitizeHref(href: string | undefined): string {
  if (!href) return "";
  const trimmed = href.trim();
  // Allow relative paths and fragment-only links
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  // Allow only http/https protocols
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Block everything else (javascript:, data:, vbscript:, etc.)
  return "";
}

interface CodeElementProps {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

const CmdImpulse = makeCmdBlock("impulse");
const CmdRepeat = makeCmdBlock("repeat");
const CmdChain = makeCmdBlock("chain");
const CmdConditionalImpulse = makeCmdBlock("conditional-impulse");
const CmdConditionalRepeat = makeCmdBlock("conditional-repeat");
const CmdConditionalChain = makeCmdBlock("conditional-chain");
const CmdChat = makeCmdBlock("chat");

const components = {
  /* h2 is hidden in doc detail pages — the header card already shows the title */
  h2: () => null,
  pre: async ({ children }: { children: ReactNode }) => {
    if (!isValidElement(children))
      return <pre>{children}</pre>;

    const props = children.props as CodeElementProps;
    const className = props.className ?? "";
    const match = /language-(\w+)/.exec(className);
    const lang = match ? match[1]! : "mcfunction";
    const code = String(props.children ?? "").trim();

    try {
      const hl = await getHighlighter();
      const resolvedLang = hl.getLoadedLanguages().includes(lang) ? lang : "mcfunction";
      const html = hl.codeToHtml(code, {
        lang: resolvedLang,
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
      });
      return <CodeBlockClient html={html} code={code} />;
    } catch (err) {
      console.error("[MDXRenderer] Syntax highlighting failed, rendering plain code:", err);
      return (
        <pre className="p-4 rounded-[var(--radius-sm)] bg-[var(--color-code-bg)] border border-[var(--color-border)] overflow-x-auto">
          <code>{code}</code>
        </pre>
      );
    }
  },
  a: ({ children, href, className, id, title }: JSX.IntrinsicElements["a"]) => {
    const safeHref = sanitizeHref(href);
    const isExternal = /^https?:\/\//i.test(safeHref);
    const combinedClassName = [
      "text-[var(--color-accent)] underline underline-offset-2 decoration-[var(--color-accent)]/30 hover:decoration-[var(--color-accent)]",
      className,
    ].filter(Boolean).join(" ");

    if (isExternal) {
      return (
        <ExternalLink href={safeHref} className={combinedClassName} id={id} title={title}>
          {children}
        </ExternalLink>
      );
    }
    return (
      <Link href={safeHref} className={combinedClassName} id={id} title={title}>
        {children}
      </Link>
    );
  },
  table: ({ children, ...props }: JSX.IntrinsicElements["table"]) => (
    <div className="overflow-x-auto overflow-hidden my-4 rounded-[var(--radius)]">
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
  /* GitHub-style task list checkbox — only whitelist known-safe attributes */
  input: ({ checked, disabled, type }: JSX.IntrinsicElements["input"]) =>
    type === "checkbox" ? (
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled ?? true}
        className="gh-checkbox"
        aria-checked={checked}
      />
    ) : (
      <input type={type} checked={checked} disabled={disabled} />
    ),
  /* Details/summary for collapsible sections */
  details: ({ children, ...props }: JSX.IntrinsicElements["details"]) => (
    <details className="gh-details my-4 rounded-[var(--radius)] border border-[var(--color-border)]" {...props}>
      {children}
    </details>
  ),
  summary: ({ children, ...props }: JSX.IntrinsicElements["summary"]) => (
    <summary className="gh-summary cursor-pointer px-4 py-2.5 text-[13px] font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)] rounded-t-[var(--radius)] select-none hover:bg-[var(--color-bg-secondary)] transition-colors duration-[var(--duration-fast)]" {...props}>
      {children}
    </summary>
  ),
  /* Keyboard shortcut */
  kbd: ({ children, ...props }: JSX.IntrinsicElements["kbd"]) => (
    <kbd
      className="inline-flex items-center h-5 px-1.5 rounded-[var(--radius-sm)] text-[11px] font-mono leading-none
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
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeGithubAlerts],
          },
        }}
      />
    </Suspense>
  );
}
