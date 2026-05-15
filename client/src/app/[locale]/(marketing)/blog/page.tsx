import PostGrid from "@/components/views/landing/post/grid";
import PostFilters from "@/components/views/landing/post/filters";
import PostSearch from "@/components/views/landing/post/post-search";
import { Locale } from "@/i18n/request";
import { PostType } from "@/types/enums";
import { getAllPosts } from "@/utils/api/post";
import { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { resolvePageMeta } from "@/utils/api/page-meta";
import { buildAlternates } from "@/utils/seo";
import { collectionPageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";
import FaqSection from "@/components/views/landing/faq/faq-section";

interface PostsPageProps {
  params: {
    locale: string;
  };
  searchParams: {
    page?: string;
    limit?: string;
    tag?: string;
    q?: string;
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: PostsPageProps): Promise<Metadata> {
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: "postsPage" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const alternates = buildAlternates("/blog", locale, baseUrl);

  const title = t("blogMetaTitle") || "Bloq Məqalələri | JET Academy";
  const description =
    t("blogMetaDescription") || "Ən son bloq məqalələrimizi və fikirlərimizi oxuyun";
  const resolvedMeta = await resolvePageMeta("blog", locale, title, description);

  return {
    title: resolvedMeta.title,
    description: resolvedMeta.description,
    alternates,
    openGraph: {
      title: resolvedMeta.title,
      description: resolvedMeta.description,
      url: alternates.canonical,
      type: "website",
      locale: locale === "az" ? "az_AZ" : "en_US",
      alternateLocale: locale === "az" ? "en_US" : "az_AZ",
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedMeta.title,
      description: resolvedMeta.description,
    },
    robots: {
      index: !searchParams.page && !searchParams.limit && !searchParams.q,
      follow: true,
      googleBot: {
        index: !searchParams.page && !searchParams.limit && !searchParams.q,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: PostsPageProps) {
  const locale = params.locale as Locale;
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 12;
  const type = PostType.BLOG;
  const tag =
    typeof searchParams.tag === "string" ? searchParams.tag.trim() : undefined;
  const searchQuery =
    typeof searchParams.q === "string" ? searchParams.q.trim() : undefined;

  const [postsData, t] = await Promise.all([
    getAllPosts({
      page,
      limit,
      postType: type,
      includeBlogs: true,
      tag,
      search: searchQuery,
    }),
    getTranslations({ locale, namespace: "postsPage" }),
  ]);

  const { items: posts, meta } = postsData;

  const transformedMeta = {
    page: meta.page,
    limit: meta.limit,
    totalItems: meta.total,
    totalPages: meta.totalPages,
  };

  const baseUrl = SITE.baseUrl;
  const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;
  const schema = collectionPageGraph({
    name: locale === "az" ? "Bloq" : "Blog",
    description: locale === "az" ? "Ən son bloq məqalələri" : "Latest blog articles",
    url: `${base}/blog`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
      { name: locale === "az" ? "Bloq" : "Blog", url: `${base}/blog` },
    ],
  });

  const qs = new URLSearchParams();
  if (tag) qs.set("tag", tag);
  if (searchQuery) qs.set("q", searchQuery);
  const paginationBaseUrl = `/blog${qs.toString() ? `?${qs}` : ""}`;

  return (
    <div className="container py-20">
      <JsonLd data={schema} />
      <div className="mb-12 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl [@media(min-width:3500px)]:!text-5xl font-bold mb-4">
          {tag ? t("postsFilteredByTag", { tag }) : t("blog")}
        </h1>
        {!tag ? (
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("blogDescription")}
          </p>
        ) : null}
      </div>

      <Suspense
        fallback={
          <div className="mb-8 h-14 max-w-3xl mx-auto rounded-full bg-gray-100 animate-pulse" />
        }
      >
        <PostSearch
          placeholderText={t("blogSearchPlaceholder")}
          initialQuery={searchQuery ?? ""}
        />
      </Suspense>

      <PostFilters type={type} t={t} />

      <PostGrid
        posts={posts}
        locale={locale}
        t={t}
        meta={transformedMeta}
        type={type}
        paginationBaseUrl={paginationBaseUrl}
      />
      <FaqSection pageKey="blog" locale={locale} />
    </div>
  );
}
