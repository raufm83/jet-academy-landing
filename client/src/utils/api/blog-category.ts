import type { BlogCategory } from "@/types/blog-category";
import { getApiBaseURL } from "@/utils/api/api-base-url";

export async function getBlogCategoriesOrdered(): Promise<BlogCategory[]> {
  try {
    const res = await fetch(`${getApiBaseURL()}/blog-categories`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as BlogCategory[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
