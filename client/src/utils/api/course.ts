import { getApiBaseURL } from "@/utils/api/api-base-url";

/** SSR və brauzer üçün eyni API kökü (yalnız NEXT_PUBLIC olanda səksən xəta olmurdu). */
function publicApiUrl(path: string): string {
  const base = getApiBaseURL().replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export async function getCourseDetails(slug: string) {
  try {
    const res = await fetch(publicApiUrl(`courses/slug/${encodeURIComponent(slug)}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch course data");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching course details:", error);
    throw error;
  }
}

export async function getAllCourses({
  limit = 100,
  page = 1,
  sortOrder = "asc",
  includeUnpublished = false,
}: {
  limit?: number;
  page?: number;
  sortOrder?: string;
  includeUnpublished?: boolean;
} = {}) {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      /** API: order sahəsi + tie-break; includeUnpublished=false — yalnız aktiv (published) kurslar */
      sortOrder,
      includeUnpublished: String(includeUnpublished),
    });
    const res = await fetch(publicApiUrl(`courses?${params}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch courses");
    }

    const data = await res.json();
    if (Array.isArray(data?.items)) {
      data.items = [...data.items].sort((a, b) => {
        const oa = Number(a?.order ?? 0);
        const ob = Number(b?.order ?? 0);
        if (ob !== oa) return ob - oa;
        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta - tb;
      });
    }
    return data;
  } catch (error) {
    console.error("Error fetching all courses:", error);
    throw error;
  }
}
