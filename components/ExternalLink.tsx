"use client";

import { useLocale } from "@/contexts/LocaleContext";
import type { ReactNode, AnchorHTMLAttributes } from "react";

export function ExternalLink({
  href,
  children,
  className,
  ...props
}: {
  href: string;
  children: ReactNode;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">) {
  const { t } = useLocale();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    >
      {children}
      <span className="sr-only"> {t("common.opensInNewTab")}</span>
    </a>
  );
}
