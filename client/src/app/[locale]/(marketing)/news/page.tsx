import PostGrid from "@/components/views/landing/post/grid";
import PostFilters from "@/components/views/landing/post/filters";
import { Locale } from "@/i18n/request";
import { PostType } from "@/types/enums";
import { getAllPosts } from "@/utils/api/post";
import { Metadata } from "next";
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
    type?: PostType;
    tag?: string;
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: PostsPageProps): Promise<Metadata> {
  const locale = params.locale;
  const type = searchParams.type as PostType | undefined;
  const t = await getTranslations({ locale, namespace: "postsPage" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  let canonicalPath = "/news";
  if (type) {
    canonicalPath = `/news?type=${type}`;
  }

  let title = t("metaTitle") || "Bloq | JET Academy";
  let description =
    t("metaDescription") ||
    "JET Academy-nin ən son məqalələrini, xəbərlərini və tədbirlərini kəşf edin";

  if (type) {
    switch (type) {
      case PostType.BLOG:
        title = t("blogMetaTitle") || "Bloq Məqalələri | JET Academy";
        description =
          t("blogMetaDescription") ||
          "Ən son bloq məqalələrimizi və fikirlərimizi oxuyun";
        break;
      case PostType.NEWS:
        title = t("newsMetaTitle") || "Xəbərlər | JET Academy";
        description =
          t("newsMetaDescription") ||
          "JET Academy-un ən son xəbərləri ilə tanış olun";
        break;
      case PostType.EVENT:
        title = t("eventMetaTitle") || "Tədbirlər | JET Academy";
        description =
          t("eventMetaDescription") ||
          "JET Academy-da keçirilən və gələcək tədbirləri kəşf edin";
        break;
    }
  }

  const pageKey =
    type === PostType.BLOG
      ? "blog"
      : type === PostType.EVENT
      ? "events"
      : "news";
  const resolvedMeta = await resolvePageMeta(pageKey, locale, title, description);
  const alternates = buildAlternates(canonicalPath, locale, baseUrl);

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
      index: !searchParams.page && !searchParams.limit,
      follow: true,
      googleBot: {
        index: !searchParams.page && !searchParams.limit,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}
export default async function AllPostsPage({
  params,
  searchParams,
}: PostsPageProps) {
  const locale = params.locale as Locale;
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 12;
  const type = searchParams.type as PostType | undefined;
  const tag =
    typeof searchParams.tag === "string" ? searchParams.tag.trim() : undefined;

  const [postsData, t] = await Promise.all([
    getAllPosts({
      page,
      limit,
      postType: type,
      includeBlogs: true,
      tag,
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
    name: locale === "az" ? "Xəbərlər" : "News",
    description: locale === "az" ? "Ən son xəbərlər" : "Latest news",
    url: `${base}/news`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
      { name: locale === "az" ? "Xəbərlər" : "News", url: `${base}/news` },
    ],
  });

  const qs = new URLSearchParams();
  if (tag) qs.set("tag", tag);
  if (type) qs.set("type", type);
  /** next-intl Link locale prefiksi əlavə edir — burada yalnız path (locale olmadan) */
  const paginationBaseUrl = `/news${qs.toString() ? `?${qs}` : ""}`;

  return (
    <div className="container py-20">
      <JsonLd data={schema} />
      <div className="mb-12 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl [@media(min-width:3500px)]:!text-5xl font-bold mb-4">
          {tag ? t("postsFilteredByTag", { tag }) : t("pageTitle")}
        </h1>
        {!tag ? (
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("pageDescription")}
          </p>
        ) : null}
      </div>

      <PostFilters type={type} t={t} />

      <PostGrid
        posts={posts}
        locale={locale}
        t={t}
        meta={transformedMeta}
        type={type}
        paginationBaseUrl={paginationBaseUrl}
      />
      <FaqSection pageKey="news" locale={locale} />
    </div>
  );
}
