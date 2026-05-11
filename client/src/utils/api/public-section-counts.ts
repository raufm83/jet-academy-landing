import { getApiBaseURL } from "./axios";

export type PublicSectionCounts = {
  graduates: number;
  studentProjects: number;
};

/**
 * SSR/footer üçün: məzunlar və tələbə layihələri sayı.
 */
export async function fetchPublicSectionCounts(): Promise<PublicSectionCounts> {
  const base = getApiBaseURL().replace(/\/+$/, "");
  const headers = { Accept: "application/json" };

  try {
    const [gRes, pRes] = await Promise.all([
      fetch(`${base}/graduates`, { next: { revalidate: 60 }, headers }),
      fetch(`${base}/student-projects?limit=1&page=1`, {
        next: { revalidate: 60 },
        headers,
      }),
    ]);

    let graduates = 0;
    if (gRes.ok) {
      const data: unknown = await gRes.json();
      graduates = Array.isArray(data) ? data.length : 0;
    }

    let studentProjects = 0;
    if (pRes.ok) {
      const data: { meta?: { total?: number }; items?: unknown[] } =
        await pRes.json();
      studentProjects =
        typeof data?.meta?.total === "number"
          ? data.meta.total
          : Array.isArray(data?.items)
            ? data.items.length
            : 0;
    }

    return { graduates, studentProjects };
  } catch {
    return { graduates: 0, studentProjects: 0 };
  }
}
