import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { locales } from "./shared";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? requested : "zh-CN";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
