import type { Graduate } from "@/types/graduate";
import { getApiBaseURL } from "./axios";

export async function getGraduatesPublic(): Promise<Graduate[]> {
  try {
    const base = getApiBaseURL().replace(/\/+$/, "");
    const res = await fetch(`${base}/graduates`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as Graduate[]) : [];
  } catch {
    return [];
  }
}
