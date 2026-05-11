import api from "@/utils/api/axios";
import type { FaqItem } from "@/types/faq";

/** Public: FAQ-ları səhifə key-ə görə (`GET /faq-public?pageKey=`) */
export async function getFaqsByPageKey(pageKey: string): Promise<FaqItem[]> {
  try {
    const { data } = await api.get<FaqItem[]>("/faq-public", {
      params: { pageKey },
    });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Alias — vakansiya və digər səhifələrdə eyni ad */
export async function getFaqByPage(pageKey: string): Promise<FaqItem[]> {
  return getFaqsByPageKey(pageKey);
}
