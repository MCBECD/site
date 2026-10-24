"use client";

/**
 * BlockLayout —— 把 ```cmdblock 代码块渲染成命令方块立体图。
 *
 * @why 语法错误不能让它把整篇文档炸掉：静态导出时一个 throw 就是整个构建失败。
 * 这里接住异常，直接在原位置显示红色提示，作者打开页面就能看到哪一行写错了。
 *
 * @gotcha 这个组件必须标 use client：parseLayout 在浏览器里也要跑一次
 * （SSG 生成的 HTML 只是首帧，水合后拖拽视角需要重新计算）。
 */

import { useMemo } from "react";
import { CommandBlockScene } from "./CommandBlockScene";
import { parseLayout } from "@/lib/blocks/parseLayout";

export function BlockLayout({ code }: { code: string }) {
  const { blocks, error } = useMemo(() => {
    try {
      return { blocks: parseLayout(code), error: null as string | null };
    } catch (e) {
      return { blocks: [], error: e instanceof Error ? e.message : String(e) };
    }
  }, [code]);

  if (error) {
    return (
      <div className="my-4 rounded-[var(--radius)] border border-red-500/40 bg-red-500/10 px-4 py-3 text-[13px] leading-6 text-red-600 dark:text-red-400">
        <strong>排布语法错误</strong>
        <div className="mt-1">{error}</div>
      </div>
    );
  }

  return (
    <div className="my-5 space-y-2">
      {/* @why 源码要跟着图一起显示：读者看到的是"这句话长什么样"，而不是凭空冒出一张图，
          否则不知道该怎么改。 */}
      <pre className="overflow-x-auto rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-3 text-[13px] leading-6">
        <code>{code}</code>
      </pre>
      <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)]">
        <CommandBlockScene blocks={blocks} cube={48} />
      </div>
    </div>
  );
}
