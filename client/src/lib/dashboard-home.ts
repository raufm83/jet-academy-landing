import { Role } from "@/types/enums";

/**
 * Rol üzrə default dashboard səhifəsi (trailingSlash: true ilə uyğun).
 * Middleware və /dashboard kök redirect eyni mənbədən istifadə edir.
 */
export function dashboardHomePathForRole(role: string | undefined): string {
  switch (role) {
    case Role.ADMIN:
    case Role.STAFF:
    case Role.CRMOPERATOR:
    case Role.COORDINATOR:
      return "/dashboard/requests/";
    case Role.CONTENTMANAGER:
      return "/dashboard/student-projects/";
    case Role.AUTHOR:
      return "/dashboard/posts/";
    case Role.HRMANAGER:
      return "/dashboard/vacancies/";
    case Role.USER:
    default:
      return "/dashboard/settings/";
  }
}
