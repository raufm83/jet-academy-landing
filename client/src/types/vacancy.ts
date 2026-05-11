import type { MultilingualText, SlugI18n } from "./general";

export interface Vacancy {
  id: string;
  title: MultilingualText;
  description: MultilingualText;
  requirements?: MultilingualText | null;
  workConditions?: MultilingualText | null;
  jobLevel?: { az: string; en: string } | null;
  slug: SlugI18n;
  employmentType?: string | null;
  deadline?: string | null;
  tags?: { az?: string[]; en?: string[] } | string[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface VacancyListResponse {
  items: Vacancy[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
