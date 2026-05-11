export interface PaginationMeta {
  total: number;
  page: string;
  limit: string;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface MultilingualText {
  az: string;
  en?: string | null;
  ru?: string | null;
}

export interface SlugI18n {
  az: string;
  en?: string | null;
  ru?: string | null;
}
