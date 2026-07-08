import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["az", "en"],
  defaultLocale: "az",
  /**
   * "as-needed": AZ (default) prefikssiz (jetacademy.az/blog/),
   *              EN prefiks ilə (jetacademy.az/en/blog/).
   * Canonical served URL-ə işarə edir — redirect yoxdur, SEO-ya tam uyğun.
   */
  localePrefix: "as-needed",
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
