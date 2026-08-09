"use client";

import type { ReactNode } from "react";

/** 设置面板通用的 section 标题 + 内容区域 */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[13px] font-medium text-[var(--color-text-primary)] mb-2.5">{title}</div>
      {children}
    </div>
  );
}
