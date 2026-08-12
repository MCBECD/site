/**
 * Unified command block icon component.
 * Replaces 7 duplicate Cmd*.tsx files.
 */
import {getHighlighter} from "@/lib/shiki";
import { CodeBlockClient } from "../CodeBlockClient";

/** Factory for backward-compatible MDX component aliases */
export function makeCmdBlock(icon: string) {
  return async function CmdAlias({ children }: { children?: React.ReactNode }) {

    const code = String(children).trim();

    const hl = await getHighlighter();
    const html = hl.codeToHtml(code, {
      lang: "mcfunction",
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    });

    return <div className="flex items-center gap-1.5 align-middle">
        <img src={`/icons/cmd/${icon}.png`} alt="" width={24} height={24} className="cmd-icon shrink-0 mt-2 mr-1" />
        <CodeBlockClient html={html} code={code} />
      </div>;
  };
}