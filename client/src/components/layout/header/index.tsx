"use client";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/utils/cn";
import { HiOutlinePhone } from "react-icons/hi2";
import { HiMenuAlt3, HiX } from "react-icons/hi";

import Logo from "./logo";
import NavLink from "./nav-link";
import Button from "@/components/ui/button";
import LanguageSwitcher from "@/components/shared/language-switcher";
import { useContactModal } from "@/hooks/useContactModal";
import { getNavLinks } from "@/data/navlinks";
import { usePathname } from "@/i18n/routing";
import { usePublicSectionVisibility } from "@/hooks/use-public-section-visibility";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  /** Hydration: server və ilk klient renderi eyni olsun — mount olana qədər filtr tətbiq olunmur */
  const [navReady, setNavReady] = useState(false);
  const { toggle } = useContactModal();
  const t = useTranslations("navbar");
  const locale = useLocale();
  const sectionVis = usePublicSectionVisibility();
  const navLinks = getNavLinks(
    t,
    navReady
      ? {
          showGraduates: sectionVis.showGraduates,
          showStudentProjects: sectionVis.showStudentProjects,
          showVacancies: sectionVis.showVacancies,
        }
      : undefined,
    locale,
  );
  const path = usePathname();

  useEffect(() => {
    setNavReady(true);
  }, []);

  useEffect(() => {
    document.body.style.overflowY = isMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, [isMenuOpen]);

  return (
    <header
      className="
        transition-all relative z-[999]
        pt-6 sm:pt-8 md:pt-10 lg:pt-12 xl:pt-14 2xl:pt-16 4xl:pt-20
        duration-300

      "
    >
      <nav
        className="
        container mx-auto flex justify-between items-center
                px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 3xl:px-28 4xl:px-32
                [@media(min-width:2500px)]:!max-w-[2200px]
                [@media(min-width:2500px)]:!px-[111px]
                [@media(min-width:3500px)]:!max-w-full
                [@media(min-width:3500px)]:!px-32
        "
      >
        <Link href="/" className="relative z-50 p-0 mb-[3px] shrink-0">
 <Logo
  className="
    w-40 sm:w-44 md:w-40 lg:w-44 xl:w-52 2xl:w-60 4xl:w-72
    aspect-[3/1]
  "
/>

</Link>

        <div className="hidden lg:flex items-center gap-2 min-w-0 flex-1 justify-end xl:gap-4 2xl:gap-8 4xl:gap-12">
          <ul
            className="flex flex-nowrap items-center gap-2 whitespace-nowrap sm:gap-2.5 md:gap-3 lg:gap-3 xl:gap-5 2xl:gap-6 min-w-0"
            role="list"
          >
            {navLinks.map((link) => (
              <li key={link.href + link.title} className="list-none shrink-0">
                
                <NavLink
                  isActive={path === link.href}
                  {...link}
                  handleClick={() => setIsMenuOpen(false)}
                  className={`${link.className ?? ""} py-1 whitespace-nowrap text-xs sm:text-sm lg:text-sm xl:text-base [@media(min-width:2500px)]:!text-2xl`}
                />
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-2 xl:gap-3">
            <LanguageSwitcher />
            <Button
              onClick={() => {
                setIsMenuOpen(false);
                toggle();
              }}
              icon={<HiOutlinePhone size={18} />}
              className="font-medium text-xs sm:text-sm [@media(min-width:2500px)]:!text-2xl lg:text-sm xl:text-base h-8 sm:h-9 lg:h-9 xl:h-10 2xl:h-12 px-2 sm:px-3 lg:px-3 xl:px-5 2xl:px-6 bg-jsyellow hover:bg-jsyellow/90 text-white hover:text-white"
              text={t("contactus")}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:hidden relative z-50 shrink-0">
          <LanguageSwitcher />
          
          <button
            onClick={() => setIsMenuOpen((o) => !o)}
            className="p-2 text-jsblack hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
          </button>
        </div>

        {/* Mobile menu backdrop */}
        <div
          className={cn(
            "fixed inset-0 bg-black z-40 transition-opacity duration-300",
            isMenuOpen ? "opacity-50 visible" : "opacity-0 invisible pointer-events-none"
          )}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Mobile menu panel */}
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
            isMenuOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
          )}
        >
          <div className="relative flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="flex shrink-0 items-center justify-end border-b border-gray-200 p-3">
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                aria-label={t("closeMenu")}
              >
                <HiX size={24} aria-hidden />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              <div className="flex flex-col gap-1.5">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.href + link.title}
                    {...link}
                    handleClick={() => setIsMenuOpen(false)}
                    className={`${link.className ?? ""} cursor-pointer whitespace-nowrap border-b border-gray-100 py-2.5 text-base last:border-b-0 md:text-lg`}
                  />
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-100 bg-white p-4">
              <Button
                onClick={() => {
                  setIsMenuOpen(false);
                  toggle();
                }}
                icon={<HiOutlinePhone size={22} />}
                className="h-12 w-full bg-jsyellow text-base font-medium text-white hover:bg-jsyellow/90 md:text-lg"
                text={t("contactus")}
              />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
