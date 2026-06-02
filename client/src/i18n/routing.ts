import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["az", "en"],
  defaultLocale: "az",
  /** AZ (default) — prefix yoxdur; EN — /en/ prefiksi ilə. SEO canonical üçün doğru. */
  localePrefix: "as-needed",
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
