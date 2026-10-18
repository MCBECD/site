"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, type ComponentProps } from "react";

/**
 * @why App Router 的 Link 默认会在链接进入视口时预取整条 RSC。首页一屏十几张
 * 文档卡，等于开屏后立刻并发十几个请求：每个都不大，但在弱网/移动网络下会持续
 * 占用连接，用户体感是"这站一直在转"。`prefetch={null}` 在 Next 16 里并不收窄
 * 视口预取（实测仍有 16 个请求），只有 `false` 才真正关掉。
 *
 * 这里改成 false + 手动 hover/focus 预取：鼠标进入或键盘聚焦时才拉一次，
 * 桌面端导航依旧即时，移动端不会为没点开的链接付流量。
 */
export function HoverPrefetchLink({ href, onMouseEnter, onFocus, ...rest }: ComponentProps<typeof Link>) {
  const router = useRouter();

  const prefetch = useCallback(() => {
    if (typeof href === "string") router.prefetch(href);
  }, [router, href]);

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={(e) => {
        prefetch();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        prefetch();
        onFocus?.(e);
      }}
      {...rest}
    />
  );
}
