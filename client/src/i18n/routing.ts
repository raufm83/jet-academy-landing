import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["az", "en", "ru"],
  defaultLocale: "az",
  /** Bütün dillərdə URL-də locale prefiksi (/az/, /en/, /ru/) — SEO və href uyğunluğu */
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
