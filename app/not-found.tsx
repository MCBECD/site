"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale } from "@/contexts/LocaleContext";

export default function NotFound() {
  const { t } = useLocale();
  const router = useRouter();

  /**
   * @why 两个出口要分开：一个原路退回，一个回命令库。
   * 直接输错地址或从新标签打开时，浏览器历史里只有当前一条，back() 会退到站外，
   * 这种情况退回首页兜底。
   */
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <div className="max-w-[var(--landing-max-width)] mx-auto px-[var(--content-gutter)] py-20 md:py-32">
      <div className="max-w-md mx-auto text-center space-y-6">
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight text-[var(--color-text-primary)]">
          404
        </h1>
        <p className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed">
          {t("notFound.description")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* .cta-primary 原本只给 <a> 用，套到 <button> 上要补掉原生边框和光标 */}
          <button
            type="button"
            onClick={goBack}
            className="cta-primary border-0 cursor-pointer"
          >
            {t("notFound.backPrevious")}
          </button>
          <Link href="/" className="cta-secondary">
            {t("notFound.browseDocs")}
          </Link>
        </div>
      </div>
    </div>
  );
}
