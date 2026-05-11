import PostGrid from "@/components/views/landing/post/grid";
import { Locale } from "@/i18n/request";
import { PostType } from "@/types/enums";
import { getAllPosts } from "@/utils/api/post";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { resolvePageMeta } from "@/utils/api/page-meta";
import { buildAlternates } from "@/utils/seo";
import { collectionPageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";

interface PostsPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    type?: PostType;
  };
  params: {
    locale: string;
    type?: string;
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: PostsPageProps): Promise<Metadata> {
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: "postsPage" });
  const type = params.type?.toUpperCase() as PostType | undefined;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const alternates = buildAlternates(`/${params.type || "news"}`, locale, baseUrl);

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
      : type === PostType.OFFERS
      ? "offers"
      : "news";
  const resolvedMeta = await resolvePageMeta(pageKey, locale, title, description);

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
  searchParams,
  params,
}: PostsPageProps) {
  const locale = params.locale as Locale;
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 12;
  const type = params.type?.toUpperCase() as PostType | undefined;

  const [postsData, t] = await Promise.all([
    getAllPosts({
      page,
      limit,
      postType: type,
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
  const categoryLabel = params.type
    ? params.type.charAt(0).toUpperCase() + params.type.slice(1).toLowerCase()
    : "News";
  const schema = collectionPageGraph({
    name: categoryLabel,
    description: locale === "az" ? `${categoryLabel} kateqoriyası` : `${categoryLabel} category`,
    url: `${base}/news/category/${params.type}`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
      { name: locale === "az" ? "Xəbərlər" : "News", url: `${base}/news` },
      { name: categoryLabel, url: `${base}/news/category/${params.type}` },
    ],
  });

  return (
    <div className="container py-20">
      <JsonLd data={schema} />
      <div className="mb-12 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl [@media(min-width:3500px)]:!text-5xl font-bold mb-4">{t("pageTitle")}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t("pageDescription")}
        </p>
      </div>

      <PostGrid
        posts={posts}
        locale={locale}
        t={t}
        meta={transformedMeta}
        type={type}
      />
    </div>
  );
}
