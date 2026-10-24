import type { Metadata } from "next";
import { EditorClient } from "./EditorClient";

/**
 * 命令方块编辑器。
 *
 * @why 独立于文档体系：不进导航、不进 sitemap、noindex，只是给作者调排布用的工具页。
 * 页面自己铺满整个视口（fixed inset-0），盖住站点外壳，视觉上就是另一个应用。
 */
export const metadata: Metadata = {
  title: "命令方块编辑器",
  robots: { index: false, follow: false },
};

export default function EditorPage() {
  return (
    <div className="fixed inset-0 z-[200] overflow-auto bg-[var(--color-bg)]">
      <EditorClient />
    </div>
  );
}
