"use client";

import type { BlogCategory } from "@/types/blog-category";
import { Link } from "@/i18n/routing";
import { BLOG_CATEGORY_UNCATEGORIZED } from "@/data/blog-category";

function buildBlogQuery(category?: string, tag?: string) {
  const q = new URLSearchParams();
  if (tag?.trim()) q.set("tag", tag.trim());
  if (category?.trim()) q.set("category", category.trim());
  const s = q.toString();
  return s ? `?${s}` : "";
}

interface BlogCategoryFilterProps {
  locale: string;
  categories: BlogCategory[];
  activeCategory?: string;
  tag?: string;
  tAll: string;
  tUncategorized: string;
}

export default function BlogCategoryFilter({
  locale,
  categories,
  activeCategory = "",
  tag,
  tAll,
  tUncategorized,
}: BlogCategoryFilterProps) {
  const labelLocale = locale === "en" ? "en" : locale === "ru" ? "en" : "az";

  const itemClass = (active: boolean) =>
    [
      "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-jsyellow text-white shadow-sm"
        : "bg-gray-100 text-jsblack hover:bg-jsyellow/15",
    ].join(" ");

  if (categories.length === 0) {
    return null;
  }

  const qsAll = buildBlogQuery(undefined, tag);
  const qsUn = buildBlogQuery(BLOG_CATEGORY_UNCATEGORIZED, tag);

  return (
    <div className="w-full mb-10">
      <h2 className="mb-3 text-center text-xl font-bold text-jsblack sm:text-2xl md:text-3xl">
        {locale === "az"
          ? "Kateqoriyalar"
          : locale === "ru"
            ? "Категории"
            : "Categories"}
      </h2>
      <div className="flex flex-wrap justify-center gap-2 px-2">
        <Link href={`/blog${qsAll}`} className={itemClass(!activeCategory)}>
          {tAll}
        </Link>
        <Link
          href={`/blog${qsUn}`}
          className={
            itemClass(activeCategory.toLowerCase() === BLOG_CATEGORY_UNCATEGORIZED)
          }
        >
          {tUncategorized}
        </Link>
        {categories.map((c) => {
          const qs = buildBlogQuery(c.id, tag);
          const active = activeCategory === c.id;
          const title =
            labelLocale === "en"
              ? c.name.en || c.name.az
              : c.name.az || c.name.en;
          return (
            <Link key={c.id} href={`/blog${qs}`} className={itemClass(active)}>
              {title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
