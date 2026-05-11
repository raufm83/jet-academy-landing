/* eslint-disable @typescript-eslint/no-explicit-any */

import { feedbacksPageHref } from "@/lib/feedbacks-path";
import { coursesListingPath } from "@/utils/course-paths";
import { galleryListingPath } from "@/utils/gallery-paths";

/** Navbar-da dinamik bölmələr: sayt 1-dən az elementdə bu linklər göstərilmir */
export type NavSectionVisibility = {
  showGraduates?: boolean;
  showStudentProjects?: boolean;
  showVacancies?: boolean;
};

export const getNavLinks = (
  t: any,
  visibility?: NavSectionVisibility,
  locale: string = "az",
) => {
  const showGraduates = visibility?.showGraduates !== false;
  const showStudentProjects = visibility?.showStudentProjects !== false;
  const showVacancies = visibility?.showVacancies !== false;

  return [
    {
      title: t("home"),
      href: "/",
    },
    ...(showGraduates
      ? [
          {
            title: t("graduates"),
            href: "/graduates",
          },
        ]
      : []),
    ...(showStudentProjects
      ? [
          {
            title: t("feedbacks"),
            href: feedbacksPageHref(locale),
            className: "text-red-500 font-semibold hover:text-red-600",
          },
        ]
      : []),
    {
      title: t("courses"),
      href: coursesListingPath(locale),
    },
    {
      title: t("offers"),
      href: "/offers",
      className: "text-red-500 font-semibold hover:text-red-600",
    },
    {
      title: t("useful"),
      href: "#",
      items: [
        {
          title: t("about"),
          href: "/about-us",
        },
        {
          title: t("blog"),
          href: "/blog",
        },
        {
          title: t("news"),
          href: "/news",
        },
        {
          title: t("event"),
          href: "/events",
        },
        {
          title: t("gallery"),
          href: galleryListingPath(locale),
        },
        {
          title: t("glossary"),
          href: "/glossary/terms",
        },
        ...(showVacancies
          ? [
              {
                title: t("vacancies"),
                href: "/vacancies",
              },
            ]
          : []),
      ],
    },
    {
      title: t("contact"),
      href: "/contact-us",
    },
  ];
};
