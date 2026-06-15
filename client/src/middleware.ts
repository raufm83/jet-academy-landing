/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getToken } from "next-auth/jwt";
import { Role } from "@/types/enums";
import { dashboardHomePathForRole } from "@/lib/dashboard-home";
import { getSessionCookieName, isSecureAuthCookies } from "@/utils/api/auth-cookie";

export { Role };

const ROUTE_PERMISSIONS = {
  COMMON: ["/dashboard/login"],

  ADMIN_ONLY: [
    "/dashboard/admin",
    "/dashboard/settings",
    "/dashboard/users",
    "/dashboard/users/create",
    "/dashboard/users/edit",
    "/dashboard/contact-info",
    "/dashboard/home-hero",
    "/dashboard/about-page",
  ],

  STAFF: [
    "/dashboard/student-projects",
    "/dashboard/student-projects/create",
    "/dashboard/student-projects/edit",
    "/dashboard/team",
    "/dashboard/team/create",
    "/dashboard/team/edit",
    "/dashboard/requests",
    "/dashboard/exams",
    "/dashboard/gallery",
    "/dashboard/gallery/create",
    "/dashboard/gallery/edit",
    "/dashboard/glossary",
    "/dashboard/glossary/create",
    "/dashboard/glossary/edit",
    "/dashboard/glossary/categories",
    "/dashboard/glossary/categories/create",
    "/dashboard/glossary/categories/edit",
    "/dashboard/settings",
    "/dashboard/home-hero",
  ],

  CRMOPERATOR: ["/dashboard/requests", "/dashboard/settings"],

  CONTENTMANAGER: [
    "/dashboard/student-projects",
    "/dashboard/student-projects/create",
    "/dashboard/student-projects/edit",
    "/dashboard/gallery",
    "/dashboard/gallery/create",
    "/dashboard/gallery/edit",
    "/dashboard/courses",
    "/dashboard/courses/create",
    "/dashboard/courses/edit",
    "/dashboard/posts",
    "/dashboard/posts/create",
    "/dashboard/posts/edit",
    "/dashboard/blog-categories",
    "/dashboard/blog-categories/create",
    "/dashboard/blog-categories/edit",
    "/dashboard/team",
    "/dashboard/team/create",
    "/dashboard/team/edit",
    "/dashboard/glossary",
    "/dashboard/glossary/create",
    "/dashboard/glossary/edit",
    "/dashboard/glossary/categories",
    "/dashboard/glossary/categories/create",
    "/dashboard/glossary/categories/edit",
    "/dashboard/settings",
    "/dashboard/home-hero",
    "/dashboard/about-page",
  ],

  AUTHOR: [
    "/dashboard/posts",
    "/dashboard/posts/create",
    "/dashboard/posts/edit",
    "/dashboard/glossary",
    "/dashboard/glossary/create",
    "/dashboard/glossary/edit",
    "/dashboard/settings",
  ],

  USER: [
    "/dashboard/profile",
    "/dashboard/settings",
  ],
  HRMANAGER: [
    "/dashboard/vacancies",
    "/dashboard/vacancies/create",
    "/dashboard/vacancies/edit",
    "/dashboard/settings",
  ],
};

const AUTH_SECRET = process.env.NEXTAUTH_SECRET;

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Dashboard cavablarının (xüsusən redirect-lərin) brauzerdə keşlənməsinin qarşısını alır.
 * Keşlənmiş permanent redirect-lər "bəzi kompüterlərdə" sonsuz döngü/error yaradırdı.
 */
const noStore = (response: NextResponse): NextResponse => {
  response.headers.set("Cache-Control", "no-store, must-revalidate");
  return response;
};

/**
 * Checks if a pathname matches any route in the provided routes array
 */
const pathMatches = (pathname: string, routes: string[]): boolean => {
  if (routes.includes(pathname)) {
    return true;
  }

  return routes.some((route) => {
    if (route.endsWith("/edit") || route.endsWith("/create")) {
      const baseRoute = route.split("/").slice(0, -1).join("/");
      return (
        pathname.startsWith(baseRoute + "/") &&
        (
          pathname.includes("/edit/") ||
          pathname.endsWith("/edit") ||
          pathname.includes("/create/") ||
          pathname.endsWith("/create")
        )
      );
    }
    return false;
  });
};

/**
 * Determines if a user with the given role has access to the specified path
 */
const hasRouteAccess = (pathname: string, role: Role): boolean => {
  const p = pathname.replace(/\/+$/, "") || pathname;

  if (pathMatches(p, ROUTE_PERMISSIONS.COMMON)) {
    return true;
  }

  if (p === "/dashboard/settings") {
    return true;
  }

  if (p === "/dashboard") {
    return true;
  }

  if (role === Role.ADMIN) {
    return true;
  }

  switch (role) {
    case Role.STAFF:
      return pathMatches(p, ROUTE_PERMISSIONS.STAFF);
    case Role.USER:
      return pathMatches(p, ROUTE_PERMISSIONS.USER);
    case Role.CRMOPERATOR:
      return pathMatches(p, ROUTE_PERMISSIONS.CRMOPERATOR);
    case Role.CONTENTMANAGER:
      return pathMatches(p, ROUTE_PERMISSIONS.CONTENTMANAGER);
    case Role.AUTHOR:
      return pathMatches(p, ROUTE_PERMISSIONS.AUTHOR);
    case Role.HRMANAGER:
      return pathMatches(p, ROUTE_PERMISSIONS.HRMANAGER);
    case Role.COORDINATOR:
      return (
        pathMatches(p, ROUTE_PERMISSIONS.STAFF) ||
        pathMatches(p, ROUTE_PERMISSIONS.CRMOPERATOR)
      );
    default:
      return false;
  }
};

/**
 * Gets the appropriate home page URL for a given role
 */
const getRoleHomePage = (role: Role, request: Request): URL => {
  return new URL(dashboardHomePathForRole(role), request.url);
};

const middlewares = withAuth(
  async function middleware(request) {
    const pathname = request.nextUrl.pathname;

    const pathTrim = pathname.replace(/\/+$/, "") || pathname;

    /** /az/dashboard/... və /en/dashboard/... → /dashboard/... — əks halda auth bloku işləmir
     *  as-needed: az-da prefix yoxdur, amma köhnə /az/dashboard linkləri hələ gələ bilər */
    const dashboardLocaleMatch = pathTrim.match(
      /^\/(az|en)(\/dashboard(?:\/.*)?)$/
    );
    if (dashboardLocaleMatch) {
      let targetPath = dashboardLocaleMatch[2];
      if (!targetPath.endsWith("/")) {
        targetPath += "/";
      }
      const url = new URL(targetPath, request.url);
      url.search = request.nextUrl.search;
      /** 307 (temporary) — 308 brauzerdə keşlənərək "bəzi kompüterlərdə" sonsuz
       *  yönləndirmə/error yaradırdı; dashboard üçün keşlənməyən redirect istifadə edirik. */
      return noStore(NextResponse.redirect(url, 307));
    }

    /** /ru/* → /en/* (ru locale artıq dəstəklənmir) */
    if (pathTrim.match(/^\/ru(\/|$)/)) {
      const newPath = pathTrim.replace(/^\/ru/, "/en");
      return NextResponse.redirect(new URL(`${newPath}/`.replace(/\/+$/, "/"), request.url), 308);
    }

    const feedbackLegacy = pathTrim.match(
      /^\/(az|en)\/(projects|reyler|feedback)$/
    );
    if (feedbackLegacy) {
      const loc = feedbackLegacy[1];
      const seg = feedbackLegacy[2];
      let destSeg: string | null = null;
      if (seg === "projects") {
        destSeg = loc === "az" ? "reyler" : "feedback";
      } else if (seg === "feedback" && loc === "az") {
        destSeg = "reyler";
      } else if (seg === "reyler" && loc !== "az") {
        destSeg = "feedback";
      }
      if (destSeg && destSeg !== seg) {
        return NextResponse.redirect(new URL(`/${loc}/${destSeg}/`, request.url), 308);
      }
    }

    const courseLegacy = pathTrim.match(
      /^\/(az|en)\/(course|courses|tedris-saheleri)(?:\/([^/]+))?$/
    );
    if (courseLegacy) {
      const loc = courseLegacy[1];
      const seg = courseLegacy[2];
      const slug = courseLegacy[3];
      const targetBase = loc === "az" ? "tedris-saheleri" : "courses";
      const targetPath = `/${loc}/${targetBase}${slug ? `/${slug}` : ""}`;
      if (`/${loc}/${seg}${slug ? `/${slug}` : ""}` !== targetPath) {
        return NextResponse.redirect(new URL(`${targetPath}/`, request.url), 308);
      }
    }

    const galleryLegacy = pathTrim.match(/^\/(az|en)\/(gallery|dersden-goruntuler)$/);
    if (galleryLegacy) {
      const loc = galleryLegacy[1];
      const seg = galleryLegacy[2];
      const targetBase = loc === "az" ? "dersden-goruntuler" : "gallery";
      if (seg !== targetBase) {
        return NextResponse.redirect(new URL(`/${loc}/${targetBase}/`, request.url), 308);
      }
    }

    if (pathname.match(/^\/(az|en|ru)\/dashboard\/login/)) {
      const newUrl = new URL(pathname.replace(/^\/(az|en|ru)/, ""), request.url);
      return noStore(NextResponse.redirect(newUrl, 307));
    }

    if (pathname.startsWith("/dashboard")) {
      const dashPath = pathname.replace(/\/+$/, "") || pathname;

      if (dashPath === "/dashboard/login") {
        return noStore(NextResponse.next());
      }

      const token = await getToken({
        req: request,
        secret: AUTH_SECRET,
        cookieName: getSessionCookieName(),
        secureCookie: isSecureAuthCookies(),
      });
      if (!token) {
        const loginUrl = new URL("/dashboard/login/", request.url);
        if (dashPath !== "/dashboard/login") {
          loginUrl.searchParams.set("callbackUrl", pathname);
        }
        const response = NextResponse.redirect(loginUrl, 307);

        /** Köhnə/zədələnmiş cookie-ləri (default ad + chunk qalıqları .0/.1)
         *  təmizləyirik ki, brauzerdə qalıb yeni sessiya ilə qarışmasın. */
        const cookieHeader = request.headers.get("cookie") || "";
        for (const base of [
          "next-auth.session-token",
          "__Secure-next-auth.session-token",
        ]) {
          for (const suffix of ["", ".0", ".1", ".2", ".3"]) {
            const name = `${base}${suffix}`;
            if (cookieHeader.includes(`${name}=`)) {
              response.cookies.set(name, "", {
                maxAge: 0,
                path: "/",
                httpOnly: true,
                sameSite: "lax",
                secure: base.startsWith("__Secure-"),
              });
            }
          }
        }

        return noStore(response);
      }

      const userRole = (token.role as Role) || Role.USER;

      if (!hasRouteAccess(dashPath, userRole)) {
        return noStore(NextResponse.redirect(getRoleHomePage(userRole, request), 307));
      }

      return noStore(NextResponse.next());
    }

    // SEO: JSON-LD schema üçün layout-da pathname oxumaq
    request.headers.set("x-pathname", pathname);
    return intlMiddleware(request);
  },
  {
    callbacks: {
      authorized: ({ token }) => true,
    },
    pages: {
      signIn: "/dashboard/login",
    },
  }
);

export default middlewares;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/((?!api|_next|public|_vercel|.*\\..*|favicon.ico).*)",
    "/",
    "/(az|en|ru)/:path*", // legacy /az/* and /ru/* are redirected above
  ],
};
