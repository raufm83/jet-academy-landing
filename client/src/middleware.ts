/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { getToken } from "next-auth/jwt";
import { Role } from "@/types/enums";
import { dashboardHomePathForRole } from "@/lib/dashboard-home";

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

    /** /en/dashboard/... → /dashboard/... — əks halda auth və icazə bloku işləmir */
    const dashboardLocaleMatch = pathTrim.match(
      /^\/(en)(\/dashboard(?:\/.*)?)$/
    );
    if (dashboardLocaleMatch) {
      let targetPath = dashboardLocaleMatch[2];
      if (!targetPath.endsWith("/")) {
        targetPath += "/";
      }
      const url = new URL(targetPath, request.url);
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url, 308);
    }

    /** /ru/* → /en/* (ru locale artıq dəstəklənmir) */
    if (pathTrim.match(/^\/ru(\/|$)/)) {
      const newPath = pathTrim.replace(/^\/ru/, "/en");
      return NextResponse.redirect(new URL(`${newPath}/`.replace(/\/+$/, "/"), request.url), 308);
    }

    /** /az/* → /* (default locale artıq prefix olmadan xidmət göstərir) */
    const azPrefixMatch = pathTrim.match(/^\/az(\/.*)?$/);
    if (azPrefixMatch) {
      const rest = azPrefixMatch[1] || "/";
      return NextResponse.redirect(new URL(rest, request.url), 308);
    }

    const feedbackLegacy = pathTrim.match(
      /^\/(en)\/(projects|feedback)$/
    );
    if (feedbackLegacy) {
      const loc = feedbackLegacy[1];
      const seg = feedbackLegacy[2];
      if (seg === "projects") {
        return NextResponse.redirect(new URL(`/${loc}/feedback/`, request.url), 308);
      }
    }

    /** Feedback legacy for az (no prefix): /reyler and /projects redirect */
    const feedbackAzLegacy = pathTrim.match(/^\/(projects|feedback)$/);
    if (feedbackAzLegacy) {
      const seg = feedbackAzLegacy[1];
      if (seg !== "reyler") {
        return NextResponse.redirect(new URL("/reyler/", request.url), 308);
      }
    }

    const courseLegacy = pathTrim.match(
      /^\/(en)\/(course|courses|tedris-saheleri)(?:\/([^/]+))?$/
    );
    if (courseLegacy) {
      const loc = courseLegacy[1];
      const seg = courseLegacy[2];
      const slug = courseLegacy[3];
      const targetBase = "courses";
      const targetPath = `/${loc}/${targetBase}${slug ? `/${slug}` : ""}`;
      if (`/${loc}/${seg}${slug ? `/${slug}` : ""}` !== targetPath) {
        return NextResponse.redirect(new URL(`${targetPath}/`, request.url), 308);
      }
    }

    /** Courses legacy for az (no prefix): /course/* and /courses/* → /tedris-saheleri/* */
    const coursesAzLegacy = pathTrim.match(/^\/(course|courses)(?:\/([^/]+))?$/);
    if (coursesAzLegacy) {
      const slug = coursesAzLegacy[2];
      return NextResponse.redirect(new URL(`/tedris-saheleri${slug ? `/${slug}` : ""}/`, request.url), 308);
    }

    const galleryLegacy = pathTrim.match(/^\/(en)\/(gallery|dersden-goruntuler)$/);
    if (galleryLegacy) {
      const loc = galleryLegacy[1];
      const seg = galleryLegacy[2];
      if (seg !== "gallery") {
        return NextResponse.redirect(new URL(`/${loc}/gallery/`, request.url), 308);
      }
    }

    /** Gallery legacy for az (no prefix): /gallery → /dersden-goruntuler */
    const galleryAzLegacy = pathTrim.match(/^\/gallery$/);
    if (galleryAzLegacy) {
      return NextResponse.redirect(new URL("/dersden-goruntuler/", request.url), 308);
    }

    if (pathname.match(/^\/(az|en|ru)\/dashboard\/login/)) {
      const newUrl = new URL(pathname.replace(/^\/(az|en|ru)/, ""), request.url);
      return NextResponse.redirect(newUrl, 308);
    }

    if (pathname.startsWith("/dashboard")) {
      const dashPath = pathname.replace(/\/+$/, "") || pathname;

      if (dashPath === "/dashboard/login") {
        const token = await getToken({
          req: request,
          secret: AUTH_SECRET,
        });

        if (token) {
          const roleName = (token.role as Role) || Role.USER;
          return NextResponse.redirect(getRoleHomePage(roleName, request));
        }
        return NextResponse.next();
      }

      const token = await getToken({
        req: request,
        secret: AUTH_SECRET,
      });
      if (!token) {
        const loginUrl = new URL("/dashboard/login/", request.url);
        if (dashPath !== "/dashboard/login") {
          loginUrl.searchParams.set("callbackUrl", pathname);
        }
        return NextResponse.redirect(loginUrl);
      }

      const userRole = (token.role as Role) || Role.USER;

      if (!hasRouteAccess(dashPath, userRole)) {
        return NextResponse.redirect(getRoleHomePage(userRole, request));
      }

      return NextResponse.next();
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
