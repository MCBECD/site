import { getHighlighter } from "@/lib/shiki";
import { CodeCopyButton } from "./CodeCopyButton";

/**
 * @why 语法高亮必须在构建期（SSG）做完，不能放到客户端。
 * 旧实现是 "use client" + useEffect 里 await getHighlighter()，shiki 引擎与
 * markdown/sh/mcfunction 语法包全被打进客户端 bundle：文档详情页实测多传
 * 430KB JS（gzip 后），慢网下首屏要多等一两秒，且每个访客都在重复做
 * 构建时就能做完的事。
 *
 * 现在是 async server component：构建时产出高亮好的 HTML，
 * 客户端只 hydrate 一个复制按钮。
 */
export async function CodeBlock({ lang, code }: { lang: string; code: string }) {
  let html: string | null = null;
  try {
    const hl = await getHighlighter();
    const target = hl.getLoadedLanguages().includes(lang) ? lang : "mcfunction";
    html = hl.codeToHtml(code, {
      lang: target,
      themes: { light: "github-light", dark: "github-dark" },
    });
  } catch {
    // 高亮失败时退回未高亮的纯文本，不能因为装饰性问题让整页 500
  }

  const inner = html ? (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <pre className="p-4 overflow-x-auto text-[13px] leading-relaxed">
      <code>{code}</code>
    </pre>
  );

  const codeBlock = (
    <div className="relative min-w-0 flex-1 my-2">
      {inner}
      <CodeCopyButton code={code} />
    </div>
  );

  return lang.startsWith("Cmd") ? (
    <div className="flex items-center gap-2">
      <img
        src={`/icons/cmd/${lang.slice(3)}.png`}
        aria-hidden="true"
        width={24}
        height={24}
        className="cmd-icon shrink-0"
      />
      {codeBlock}
    </div>
  ) : codeBlock;
}
