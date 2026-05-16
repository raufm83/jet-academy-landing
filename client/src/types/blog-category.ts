export interface BlogCategory {
  id: string;
  name: { az: string; en: string };
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  _count?: { posts: number };
}
