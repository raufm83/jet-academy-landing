import { Role } from "@/types/enums";
import { Session } from "next-auth";
import {
  MdBook,
  MdOutlineMessage,
  MdPeople,
  MdPeopleAlt,
  MdSettings,
  MdPhoto,
  MdVideoChat,
  MdShield,
  MdViewModule,
  MdPostAdd,
  MdLightbulbOutline,
  MdSearch,
  MdHelpOutline,
  MdWork,
  MdSchool,
  MdHome,
  MdArticle,
  MdBookmarks,
} from "react-icons/md";

export interface MenuItem {
  name: string;
  icon: JSX.Element;
  path: string;
}

export function getMenuItems(session: Session | null): MenuItem[] {
  const staffMenuItems: MenuItem[] = [
    {
      name: "Sorğular",
      icon: <MdOutlineMessage size={24} />,
      path: "/dashboard/requests",
    },
    {
      name: "Tələbə Rəyləri",
      icon: <MdBook size={24} />,
      path: "/dashboard/student-projects",
    },
    // exams
    {
      name: "İmtahanlar",
      icon: <MdBook size={24} />,
      path: "/dashboard/exams",
    },
    {
      name: "Hero (əsas səhifə)",
      icon: <MdHome size={24} />,
      path: "/dashboard/home-hero",
    },
  ];

  const adminMenuItems: MenuItem[] = [
    {
      name: "Sorğular",
      icon: <MdOutlineMessage size={24} />,
      path: "/dashboard/requests",
    },
    {
      name: "İstifadəçilər",
      icon: <MdPeople size={24} />,
      path: "/dashboard/users",
    },
    {
      name: "Komanda",
      icon: <MdPeopleAlt size={24} />,
      path: "/dashboard/team",
    },
    {
      name: "Əlaqə məlumatları",
      icon: <MdOutlineMessage size={24} />,
      path: "/dashboard/contact-info",
    },
    {
      name: "Hero (əsas səhifə)",
      icon: <MdHome size={24} />,
      path: "/dashboard/home-hero",
    },
    {
      name: "Haqqımızda (CMS)",
      icon: <MdArticle size={24} />,
      path: "/dashboard/about-page",
    },
    {
      name: "Tələbə Rəyləri",
      icon: <MdBook size={24} />,
      path: "/dashboard/student-projects",
    },
    {
      name: "Kurslar",
      icon: <MdVideoChat size={24} />,
      path: "/dashboard/courses",
    },
    {
      name: "Postlar",
      icon: <MdPostAdd size={24} />,
      path: "/dashboard/posts",
    },
    {
      name: "Bloq kateqoriyaları",
      icon: <MdBookmarks size={24} />,
      path: "/dashboard/blog-categories",
    },
    {
      name: "Tələblər",
      icon: <MdShield size={24} />,
      path: "/dashboard/eligibilities",
    },
    {
      name: "Modullar",
      icon: <MdViewModule size={24} />,
      path: "/dashboard/modules",
    },
    {
      name: "Qalereya",
      icon: <MdPhoto size={24} />,
      path: "/dashboard/gallery",
    },
    {
      name: "İmtahanlar",
      icon: <MdBook size={24} />,
      path: "/dashboard/exams",
    },
    {
      name: "Lügət",
      icon: <MdLightbulbOutline size={24} />,
      path: "/dashboard/glossary",
    },
    {
      name: "SEO",
      icon: <MdSearch size={24} />,
      path: "/dashboard/seo",
    },
    {
      name: "FAQ",
      icon: <MdHelpOutline size={24} />,
      path: "/dashboard/faq",
    },
    {
      name: "Vakansiyalar",
      icon: <MdWork size={24} />,
      path: "/dashboard/vacancies",
    },
    {
      name: "Məzunlar",
      icon: <MdSchool size={24} />,
      path: "/dashboard/graduates",
    },
  ];

  const CRMOperatorMenuItems: MenuItem[] = [
    {
      name: "Sorğular",
      icon: <MdOutlineMessage size={24} />,
      path: "/dashboard/requests",
    },
    {
      name: "İmtahanlar",
      icon: <MdBook size={24} />,
      path: "/dashboard/exams",
    },
  ];

  const contentManagerMenuItems: MenuItem[] = [
    {
      name: "Kurslar",
      icon: <MdVideoChat size={24} />,
      path: "/dashboard/courses",
    },

    {
      name: "Tələbə Rəyləri",
      icon: <MdBook size={24} />,
      path: "/dashboard/student-projects",
    },
    {
      name: "Xəbərlər",
      icon: <MdPostAdd size={24} />,
      path: "/dashboard/posts",
    },
    {
      name: "Bloq kateqoriyaları",
      icon: <MdBookmarks size={24} />,
      path: "/dashboard/blog-categories",
    },
    {
      name: "Qalereya",
      icon: <MdPhoto size={24} />,
      path: "/dashboard/gallery",
    },
    {
      name: "Müəllimlər",
      icon: <MdPeople size={24} />,
      path: "/dashboard/team",
    },
    {
      name: "Lügət",
      icon: <MdLightbulbOutline size={24} />,
      path: "/dashboard/glossary",
    },
    {
      name: "SEO",
      icon: <MdSearch size={24} />,
      path: "/dashboard/seo",
    },
    {
      name: "FAQ",
      icon: <MdHelpOutline size={24} />,
      path: "/dashboard/faq",
    },
    {
      name: "Vakansiyalar",
      icon: <MdWork size={24} />,
      path: "/dashboard/vacancies",
    },
    {
      name: "Məzunlar",
      icon: <MdSchool size={24} />,
      path: "/dashboard/graduates",
    },
    {
      name: "Hero (əsas səhifə)",
      icon: <MdHome size={24} />,
      path: "/dashboard/home-hero",
    },
    {
      name: "Haqqımızda (CMS)",
      icon: <MdArticle size={24} />,
      path: "/dashboard/about-page",
    },
  ];

  const baseMenuItemsEnd: MenuItem[] = [
    {
      name: "Parametrlər",
      icon: <MdSettings size={24} />,
      path: "/dashboard/settings",
    },
  ];

  const authorMenuItems: MenuItem[] = [
    {
      name: "Postlar",
      icon: <MdPostAdd size={24} />,
      path: "/dashboard/posts",
    },
    {
      name: "Terminlər",
      icon: <MdLightbulbOutline size={24} />,
      path: "/dashboard/glossary",
    },
  ];

  const hrManagerMenuItems: MenuItem[] = [
    {
      name: "Vakansiyalar",
      icon: <MdWork size={24} />,
      path: "/dashboard/vacancies",
    },
  ];

  const isHrManager = session?.user?.role === Role.HRMANAGER;

  return [
    ...(session?.user?.role === Role.ADMIN ? adminMenuItems : []),
    ...(session?.user?.role === Role.CRMOPERATOR ? CRMOperatorMenuItems : []),
    ...(session?.user?.role === Role.CONTENTMANAGER
      ? contentManagerMenuItems
      : []),
    ...(session?.user?.role === Role.STAFF ? staffMenuItems : []),
    ...(session?.user?.role === Role.AUTHOR ? authorMenuItems : []),
    ...(isHrManager ? hrManagerMenuItems : []),
    ...baseMenuItemsEnd,
  ];
}
