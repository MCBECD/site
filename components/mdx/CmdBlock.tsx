/**
 * Unified command block icon component.
 * Replaces 7 duplicate Cmd*.tsx files.
 */
import {getHighlighter} from "@/lib/shiki";
import { CodeBlockClient } from "../CodeBlockClient";
import { CmdBlockIcon } from "./CmdBlockIcon";

/** Factory for backward-compatible MDX component aliases */
export function makeCmdBlock(icon: string) {
  return async function CmdAlias({ children }: { children?: React.ReactNode }) {

    const code = String(children).trim();

    try {
      const hl = await getHighlighter();
      const html = hl.codeToHtml(code, {
        lang: "mcfunction",
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
      });

      return <div className="flex items-center gap-1.5">
          <CmdBlockIcon type={icon} />
          <CodeBlockClient html={html} code={code} />
        </div>;
    } catch (err) {
      console.error(`[CmdBlock:${icon}] Syntax highlighting failed, rendering plain code:`, err);
      return <div className="flex items-center gap-1.5">
          <CmdBlockIcon type={icon} />
          <pre className="p-4 rounded-[var(--radius-sm)] bg-[var(--color-code-bg)] border border-[var(--color-border)] overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>;
    }
  };
}
