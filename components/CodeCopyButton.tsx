"use client";

import { Copy, Check } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

/**
 * @why 复制按钮必须留在客户端（要读 locale、要被 DocDetailClient 的委托点击处理），
 * 但高亮本身不该在这里：旧实现把整个 shiki 高亮器拖进了客户端 bundle，
 * 文档详情页因此多下 400KB+ JS。现在只保留这两个图标。
 *
 * @constraint data-code 属性是 DocDetailClient 事件委托的查找依据，不能改名。
 */
export function CodeCopyButton({ code }: { code: string }) {
  const { t } = useLocale();
  return (
    <button
      type="button"
      className="code-copy-btn"
      data-code={code}
      aria-label={t("code.copy")}
      title={t("code.copy")}
    >
      <Copy className="code-copy-icon w-3.5 h-3.5" />
      <Check className="code-copy-check w-3.5 h-3.5" />
    </button>
  );
}
