import ReactMarkdown from "react-markdown";
import Link from "next/link";
import type { CSSProperties, JSX, ReactNode } from "react";
import { isValidElement } from "react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { rehypeGithubAlerts } from "@/lib/mdx/rehype-github-alerts";
import { remarkCommandBlocks } from "@/lib/mdx/remark-command-blocks";
import { CodeBlockClient } from "./CodeBlockClient";
import { ExternalLink } from "./ExternalLink";
import { getHighlighter } from "@/lib/shiki";

function sanitizeHref(href: string | undefined): string {
  if (!href) return "";
  const trimmed = href.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return "";
  return trimmed;
}

/** Extract plain text from a ReactNode (string, array, or nested element). */
function extractText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (isValidElement(children)) return extractText((children.props as { children?: ReactNode }).children);
  return String(children ?? "");
}

/** Convert a `CmdXxx` code-fence language to its icon filename (kebab-case). */
function cmdIconName(lang: string): string {
  const type = lang.startsWith("Cmd") ? lang.slice(3) : lang;
  return type.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

interface CodeElementProps {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

async function renderCodeBlock(className: string, code: string) {
  const match = /language-(\w+)/.exec(className);
  const lang = match ? match[1]! : "mcfunction";

  const hl = await getHighlighter();
  const html = hl.codeToHtml(code, {
    lang: hl.getLoadedLanguages().includes(lang) ? lang : "mcfunction",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  if (lang.startsWith("Cmd")) {
    return (
      <div className="flex items-center gap-1.5">
        <img
          src={`/icons/cmd/${cmdIconName(lang)}.png`}
          alt=""
          aria-hidden="true"
          width={24}
          height={24}
          className="cmd-icon shrink-0 mt-2"
        />
        <CodeBlockClient html={html} code={code} />
      </div>
    );
  }
  return <CodeBlockClient html={html} code={code} />;
}

const components = {
  h2: () => null,
  pre: async ({ children }: { children?: ReactNode }) => {
    if (!isValidElement(children)) {
      return <pre>{children}</pre>;
    }

    const props = children.props as CodeElementProps;
    const className = props.className ?? "";
    const code = extractText(props.children).trim();

    return renderCodeBlock(className, code);
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
  kbd: ({ children, ...props }: JSX.IntrinsicElements["kbd"]) => (
    <kbd
      className="inline-flex items-center h-5 px-1.5 rounded-[var(--radius-sm)] text-[11px] font-mono leading-none bg-[var(--color-kbd-bg)] border border-[var(--color-kbd-border)] text-[var(--color-kbd-text)]"
      {...props}
    >
      {children}
    </kbd>
  ),
};

export function MDXRenderer({ source }: { source: string }) {
  return (
    <ReactMarkdown
      children={source}
      components={components}
      remarkPlugins={[remarkGfm, remarkCommandBlocks]}
      rehypePlugins={[rehypeRaw, rehypeGithubAlerts]}
    />
  );
}
