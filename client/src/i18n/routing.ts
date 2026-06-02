import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["az", "en"],
  defaultLocale: "az",
  /** Hər iki dil öz prefiksi ilə göstərilir (/az/, /en/).
   *  Canonical URL isə locale prefikssiz (jetacademy.az/blog/) qurulur — SEO-ya uyğun. */
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
