"use client";

import type { BlogCategory } from "@/types/blog-category";
import { Link } from "@/i18n/routing";
import { Locale } from "@/i18n/request";
function buildBlogQuery(category?: string, tag?: string) {
  const q = new URLSearchParams();
  if (tag?.trim()) q.set("tag", tag.trim());
  if (category?.trim()) q.set("category", category.trim());
  const s = q.toString();
  return s ? `?${s}` : "";
}

function categoryLabel(category: BlogCategory, locale: Locale): string {
  if (locale === "en" || locale === "ru") {
    return category.name.en || category.name.az;
  }
  return category.name.az || category.name.en;
}

interface BlogCategoryFilterProps {
  locale: Locale;
  categories: BlogCategory[];
  activeCategory?: string;
  tag?: string;
  title: string;
  allLabel: string;
}

export default function BlogCategoryFilter({
  locale,
  categories,
  activeCategory = "",
  tag,
  title,
  allLabel,
}: BlogCategoryFilterProps) {
  if (categories.length === 0) {
    return null;
  }

  const pillClass = (active: boolean) =>
    [
      "rounded-full px-4 py-2 text-sm font-medium transition-all",
      active
        ? "bg-jsyellow text-white shadow-sm"
        : "bg-jsyellow/10 text-jsblack hover:bg-jsyellow/20",
    ].join(" ");

  const qsAll = buildBlogQuery(undefined, tag);

  return (
    <div className="mb-10 w-full px-4">
      <p className="mb-3 text-center text-xl font-semibold tracking-wide text-jsblack sm:text-2xl">
        {title}
      </p>
      <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2">
        <Link href={`/blog${qsAll}`} className={pillClass(!activeCategory)}>
          {allLabel}
        </Link>
        {categories.map((category) => {
          const qs = buildBlogQuery(category.id, tag);
          const isActive = activeCategory === category.id;
          return (
            <Link
              key={category.id}
              href={`/blog${qs}`}
              className={pillClass(isActive)}
            >
              {categoryLabel(category, locale)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
