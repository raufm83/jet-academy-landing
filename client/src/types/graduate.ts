import type { MultilingualText } from "./general";

export interface Graduate {
  id: string;
  name: MultilingualText;
  story: MultilingualText;
  mediaType: "image" | "youtube";
  mediaUrl: string;
  courseId?: string | null;
  courseName?: MultilingualText | null;
  isActive: boolean;
  order: number;
  linkedin?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GraduateListResponse {
  items: Graduate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
