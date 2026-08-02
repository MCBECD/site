import { createNavigation } from "next-intl/navigation";
import { locales } from "./shared";

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation({ locales });
