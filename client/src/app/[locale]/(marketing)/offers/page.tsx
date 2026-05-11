import PostGrid from "@/components/views/landing/post/grid";
import PostFilters from "@/components/views/landing/post/filters";
import JsonLd from "@/components/seo/json-ld";
import { collectionPageGraph, SITE } from "@/data/site-schema";
import { Locale } from "@/i18n/request";
import { PostType } from "@/types/enums";
import { getAllPosts } from "@/utils/api/post";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { resolvePageMeta } from "@/utils/api/page-meta";
import { buildAlternates } from "@/utils/seo";
import FaqSection from "@/components/views/landing/faq/faq-section";

interface OffersPageProps {
  params: {
    locale: string;
  };
  searchParams: {
    page?: string;
    limit?: string;
    tag?: string;
  };
}

export async function generateMetadata({
  params,
}: OffersPageProps): Promise<Metadata> {
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: "postsPage" });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const alternates = buildAlternates("/offers", locale, baseUrl);

  const { title, description } = await resolvePageMeta(
    "offers",
    locale,
    t("offers") || "Kampaniyalar",
    t("metaDescription") || "JET Academy-nin ən son kampaniyaları ilə tanış olun"
  );

  const openGraph: Metadata["openGraph"] = {
    title,
    description,
    url: alternates.canonical,
    type: "website",
    locale: locale === "az" ? "az_AZ" : "en_US",
  };
  return {
    title,
    description,
    alternates,
    openGraph,
  };
}

export default async function OffersPage({
  params,
  searchParams,
}: OffersPageProps) {
  const locale = params.locale as Locale;
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 12;
  const type = PostType.OFFERS;
  const tag =
    typeof searchParams.tag === "string" ? searchParams.tag.trim() : undefined;

  const [postsData, t] = await Promise.all([
    getAllPosts({
      page,
      limit,
      postType: type,
      includeBlogs: false,
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
  const pageTitle = t("offers") || "Kampaniyalar";
  const pageDescription = t("offersDescription");
  const itemList = (posts ?? []).slice(0, 12).map((p: any) => ({
    name: p.title[locale],
    url: `${base}/offers/${p.slug?.[locale] ?? p.slug?.az ?? p.slug?.en ?? ""}`,
  }));
  const schema = collectionPageGraph({
    name: pageTitle,
    description: pageDescription,
    url: `${base}/offers`,
    locale,
    breadcrumbItems: [
      { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
      { name: locale === "az" ? "Kampaniyalar" : "Special Offers", url: `${base}/offers` },
    ],
    itemList,
  });

  const qs = new URLSearchParams();
  if (tag) qs.set("tag", tag);
  const paginationBaseUrl = `/offers${qs.toString() ? `?${qs}` : ""}`;
  return (
    <div className="container py-20">
      <JsonLd data={schema} />
      <div className="text-center mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl [@media(min-width:3500px)]:!text-5xl font-bold mb-4">
          {tag ? t("postsFilteredByTag", { tag }) : pageTitle}
        </h1>
        {!tag ? (
          <p className="text-gray-600 max-w-2xl mx-auto">
            {pageDescription}
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
      <FaqSection pageKey="offers" locale={locale} />
    </div>
  );
}
