"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

/**
 * @why 复制按钮必须留在客户端（要读 locale、要碰 clipboard），但高亮本身不该在这里：
 * 旧实现把整个 shiki 高亮器拖进了客户端 bundle，文档详情页因此多下 400KB+ JS。
 * 现在只保留这两个图标。
 *
 * @why 复制行为收回到按钮自己身上。此前是父组件 DocDetailClient 在正文容器上做事件
 * 委托（依赖 data-code 属性 + 一个 createPortal 的全局 Toast）。那套委托是"正文还在
 * 客户端"时代的遗留：正文现在由 Server Component 直接输出静态 HTML，父组件不再是
 * 包裹正文的 client 组件，委托也就无处可挂。按钮自己管状态更简单，反馈也就在手指下。
 *
 * @gotcha `.copied` 类名与 styles/components.css 里的图标互换规则绑定，不能改名。
 */
export function CodeCopyButton({ code }: { code: string }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      ?.writeText(code)
      .then(() => {
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        /* 剪贴板被拒（非安全上下文 / 权限拒绝）时不提示，避免骗用户"已复制" */
      });
  }, [code]);

  const label = copied ? t("code.copied") : t("code.copy");

  return (
    <button
      type="button"
      className={`code-copy-btn${copied ? " copied" : ""}`}
      onClick={handleCopy}
      aria-label={label}
      title={label}
    >
      <Copy className="code-copy-icon w-3.5 h-3.5" />
      <Check className="code-copy-check w-3.5 h-3.5" />
    </button>
  );
}
