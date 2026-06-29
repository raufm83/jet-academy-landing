"use client";
import { cn } from "@/utils/cn";
import { Link, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import Image from "next/image";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { HiChevronDown } from "react-icons/hi2";
import {
  useParams,
  usePathname as useNextPathname,
  useSearchParams,
} from "next/navigation";
import {
  pathnameWithoutLeadingLocale,
  interpolatePathnameDynamicSegments,
  fetchCourseSlugsFromApi,
  fetchBlogSlugsFromApi,
} from "@/utils/intl/language-switch-target";

const LOCALE_META: Record<string, { flag: string; label: string; ariaLabel: string; srLabel: string }> = {
  az: { flag: "/flags/az.png",  label: "AZ", ariaLabel: "Azərbaycan dilinə keç",  srLabel: "Cari dil: Azərbaycan" },
  en: { flag: "/flags/uk.webp", label: "EN", ariaLabel: "Switch to English",       srLabel: "Current language: English" },
};

const locales = ["az", "en"] as const;

function LanguageSwitcherInner({ className }: { className?: string }) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const intlPath = usePathname();
  const nextFullPath = useNextPathname() ?? "/";
  const params = useParams();
  const searchParams = useSearchParams();
  const rootRef = useRef<HTMLDivElement>(null);

  const pathStr = String(intlPath);
  let normalizedPathInternal =
    pathStr.includes("[") && pathStr.includes("]")
      ? interpolatePathnameDynamicSegments(
          pathStr,
          params as Readonly<Record<string, string | string[] | undefined>>
        )
      : pathStr;
  if (
    normalizedPathInternal.includes("[") ||
    normalizedPathInternal.includes("]")
  ) {
    normalizedPathInternal = pathnameWithoutLeadingLocale(nextFullPath);
  }

  const slugParam = typeof params.slug === "string" ? params.slug : undefined;

  const isCourseDetail =
    Boolean(slugParam) &&
    (pathStr === "/course/[slug]" ||
      /^\/course\/[^/]+\/?$/.test(normalizedPathInternal));

  const isBlogDetail =
    Boolean(slugParam) &&
    (pathStr === "/blog/[slug]" ||
      /^\/blog\/[^/]+\/?$/.test(normalizedPathInternal));

  const [courseSlugs, setCourseSlugs] = useState<Partial<Record<"az" | "en", string>> | null>(null);
  const [courseFetchDone, setCourseFetchDone] = useState(false);

  const [blogSlugs, setBlogSlugs] = useState<Partial<Record<"az" | "en", string>> | null>(null);
  const [blogFetchDone, setBlogFetchDone] = useState(false);

  const qs = searchParams.toString();

  let pathnameBase = normalizedPathInternal.startsWith("/")
    ? normalizedPathInternal
    : `/${normalizedPathInternal}`;
  if (!pathnameBase || pathnameBase === "") pathnameBase = "/";

  const defaultHref = (qs ? `${pathnameBase}?${qs}` : pathnameBase) as never;

  useEffect(() => {
    if (!isCourseDetail || !slugParam) {
      setCourseSlugs(null);
      setCourseFetchDone(false);
      return;
    }
    let cancelled = false;
    setCourseFetchDone(false);
    setCourseSlugs(null);
    (async () => {
      try {
        const slugs = await fetchCourseSlugsFromApi(slugParam);
        if (!cancelled && slugs) setCourseSlugs(slugs);
      } catch {
      } finally {
        if (!cancelled) setCourseFetchDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isCourseDetail, slugParam]);

  useEffect(() => {
    if (!isBlogDetail || !slugParam) {
      setBlogSlugs(null);
      setBlogFetchDone(false);
      return;
    }
    let cancelled = false;
    setBlogFetchDone(false);
    setBlogSlugs(null);
    (async () => {
      try {
        const slugs = await fetchBlogSlugsFromApi(slugParam);
        if (!cancelled && slugs) setBlogSlugs(slugs);
      } catch {
      } finally {
        if (!cancelled) setBlogFetchDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isBlogDetail, slugParam]);

  function hrefForTargetLocale(code: (typeof locales)[number]): never {
    if (courseSlugs) {
      const slug = (code === "az" ? courseSlugs.az : courseSlugs.en) ?? slugParam ?? "";
      const href = `/course/${slug}${qs ? `?${qs}` : ""}`;
      return href as never;
    }

    if (blogSlugs) {
      const slug = (code === "az" ? blogSlugs.az : blogSlugs.en) ?? slugParam ?? "";
      const href = `/blog/${slug}${qs ? `?${qs}` : ""}`;
      return href as never;
    }

    return defaultHref;
  }

  const linkPending = (isCourseDetail && !courseFetchDone) || (isBlogDetail && !blogFetchDone);

  useEffect(() => {
    function handlePointerDown(event: Event) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  const current = LOCALE_META[locale] ?? LOCALE_META.az;

  return (
    <div ref={rootRef} className={cn("relative z-[1001]", className)}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={locale === "az" ? "Dil seçin" : "Choose language"}
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          "border flex w-full bg-white [@media(min-width:3500px)]:!text-2xl justify-between gap-2 text-sm h-11 transition-all cursor-pointer font-semibold text-jsblack items-center border-gray-300 px-4 py-2 rounded-[30px]",
          !isOpen ? "hover:bg-jsblack/10" : "bg-jsblack/10"
        )}
      >
        <Image
          src={current.flag}
          alt=""
          width={24}
          height={17}
          unoptimized
          aria-hidden
          className="rounded-sm object-cover shrink-0 [@media(min-width:3500px)]:!w-10 [@media(min-width:3500px)]:!h-7"
        />
        <span className="sr-only">{current.srLabel}</span>
        <span aria-hidden>{current.label}</span>
        <HiChevronDown className="shrink-0" aria-hidden />
      </button>

      <div
        role="listbox"
        aria-label={locale === "az" ? "Dillər" : "Languages"}
        className={cn(
          "flex flex-col min-w-[110px] items-stretch top-full left-0 mt-2 absolute bg-white border border-gray-300 rounded-[16px] overflow-hidden transition-all duration-150 z-50 shadow-sm",
          isOpen
            ? "opacity-100 scale-100 visible"
            : "opacity-0 scale-95 invisible pointer-events-none"
        )}
      >
        {locales.map((code) => {
          const meta = LOCALE_META[code];
          return code === locale ? (
            <div
              key={code}
              role="option"
              aria-selected
              className="flex items-center justify-center gap-2.5 py-2.5 text-center bg-jsblack/5 opacity-70 cursor-default"
            >
              <Image
                src={meta.flag}
                alt=""
                width={24}
                height={17}
                unoptimized
                className="rounded-sm object-cover shrink-0 [@media(min-width:3500px)]:!w-10 [@media(min-width:3500px)]:!h-7"
              />
              <span className="text-sm font-semibold text-jsblack [@media(min-width:3500px)]:!text-xl">{meta.label}</span>
            </div>
          ) : linkPending ? (
            <div
              key={code}
              role="option"
              aria-selected={false}
              aria-disabled
              className="flex items-center justify-center gap-2.5 py-2.5 text-center opacity-40 cursor-wait"
            >
              <Image
                src={meta.flag}
                alt=""
                width={24}
                height={17}
                unoptimized
                className="rounded-sm object-cover shrink-0 [@media(min-width:3500px)]:!w-10 [@media(min-width:3500px)]:!h-7"
              />
              <span className="text-sm font-semibold text-jsblack [@media(min-width:3500px)]:!text-xl">{meta.label}</span>
            </div>
          ) : (
            <Link
              key={code}
              href={hrefForTargetLocale(code)}
              locale={code}
              prefetch={false}
              scroll={false}
              role="option"
              aria-selected={false}
              className="flex cursor-pointer items-center justify-center gap-2.5 py-2.5 text-center transition-colors hover:bg-jsblack/10"
              onClick={() => setIsOpen(false)}
            >
              <Image
                src={meta.flag}
                alt=""
                width={24}
                height={17}
                unoptimized
                className="rounded-sm object-cover shrink-0 [@media(min-width:3500px)]:!w-10 [@media(min-width:3500px)]:!h-7"
              />
              <span className="text-sm font-semibold text-jsblack [@media(min-width:3500px)]:!text-xl">{meta.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function LanguageSwitcher({ className }: { className?: string }) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            "h-11 min-w-[100px] rounded-[30px] border border-gray-300 bg-white",
            className
          )}
          aria-hidden
        />
      }
    >
      <LanguageSwitcherInner className={className} />
    </Suspense>
  );
}
