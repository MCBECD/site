"use client";

/**
 * BlockLayout —— 把 ```cmdblock 代码块渲染成命令方块立体图。
 *
 * @why 语法错误不能让它把整篇文档炸掉：静态导出时一个 throw 就是整个构建失败。
 * 这里接住异常，直接在原位置显示红色提示，作者打开页面就能看到哪一行写错了。
 *
 * @gotcha 这个组件必须标 use client：parseLayout 在浏览器里也要跑一次
 * （SSG 生成的 HTML 只是首帧，水合后需要重新计算排布）。
 */

import { useMemo } from "react";
import { CommandBlockScene } from "./CommandBlockScene";
import { parseBlockSource } from "@/lib/blocks/parseLayout";

export function BlockLayout({ code }: { code: string }) {
  const { blocks, cube, error } = useMemo(() => {
    try {
      const r = parseBlockSource(code);
      return { blocks: r.blocks, cube: r.cube ?? 64, error: null as string | null };
    } catch (e) {
      return { blocks: [], cube: 64, error: e instanceof Error ? e.message : String(e) };
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
    <div className="my-4 space-y-1.5">
      {/* @why 源码要跟着图一起显示：读者看到的是"这句话长什么样"，而不是凭空冒出一张图，
          否则不知道该怎么改。 */}
      <pre className="max-h-[200px] overflow-auto rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-3 py-2 text-[13px] leading-6">
        <code>{code}</code>
      </pre>
      {/* @why 立体图套一圈淡框：图有明暗和像素纹理，边框取 --color-border-light
          这种几乎融进背景的色，只标出"这里是一块图"，不抢注意力。早年用重色
          --color-border 加大内边距，框比图还大，整篇文档看过去全是框。
          @constraint w-fit 让框贴着图：CommandBlockScene 会按固定视角的投影包围盒
          给自己算出确定的宽高（不随交互变化），父级必须收缩适应，
          否则又变成占满整行的大框。 */}
      <div className="mx-auto w-fit overflow-hidden rounded-[var(--radius)] border border-[var(--color-border-light)]">
        <CommandBlockScene blocks={blocks} cube={cube} />
      </div>
    </div>
  );
}
