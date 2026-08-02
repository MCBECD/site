import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/shared";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
