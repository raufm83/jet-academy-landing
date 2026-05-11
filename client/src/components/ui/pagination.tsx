"use client";

import { Link } from "@/i18n/routing";
import {
  buildPaginationHref,
  getPaginationItems,
} from "@/utils/pagination";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Path + mövcud query (page istisna olmaqla və ya köhnə page ilə); buildPaginationHref düzəldir */
  baseUrl: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const safeCurrent = Math.min(Math.max(1, currentPage), totalPages);
  const items = getPaginationItems(safeCurrent, totalPages, 2);

  const href = (page: number) => buildPaginationHref(baseUrl, page);
  const prevHref = safeCurrent > 1 ? href(safeCurrent - 1) : null;
  const nextHref = safeCurrent < totalPages ? href(safeCurrent + 1) : null;

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {prevHref ? (
        <Link
          href={prevHref}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-jsyellow text-jsblack transition-colors hover:bg-jsyellow/10"
          aria-label="Əvvəlki səhifə"
        >
          <MdChevronLeft className="h-5 w-5" />
        </Link>
      ) : (
        <span
          className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-gray-200 text-gray-300"
          aria-hidden
        >
          <MdChevronLeft className="h-5 w-5" />
        </span>
      )}

      {items.map((item, index) => {
        if (item === "ellipsis") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-10 w-10 items-center justify-center text-gray-600"
              aria-hidden
            >
              …
            </span>
          );
        }

        const isActive = item === safeCurrent;
        return (
          <Link
            key={item}
            href={href(item)}
            className={`flex h-10 min-w-10 items-center justify-center rounded-full px-2 text-sm transition-colors ${
              isActive
                ? "bg-jsyellow text-white"
                : "border border-jsyellow text-jsblack hover:bg-jsyellow/10"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {item}
          </Link>
        );
      })}

      {nextHref ? (
        <Link
          href={nextHref}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-jsyellow text-jsblack transition-colors hover:bg-jsyellow/10"
          aria-label="Növbəti səhifə"
        >
          <MdChevronRight className="h-5 w-5" />
        </Link>
      ) : (
        <span
          className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-gray-200 text-gray-300"
          aria-hidden
        >
          <MdChevronRight className="h-5 w-5" />
        </span>
      )}
    </nav>
  );
}
