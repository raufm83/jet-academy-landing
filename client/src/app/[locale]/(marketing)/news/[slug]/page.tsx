import PostHero from "@/components/views/landing/post/hero";
import RelatedPosts from "@/components/views/landing/post/related";
import { Locale } from "@/i18n/request";
import { PostType } from "@/types/enums";
import { getAllPosts, getPostDetails } from "@/utils/api/post";
import { formatDate, formatTime } from "@/utils/formatters/formatDate";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { addTrailingSlash, truncateTitle, htmlToDescription } from "@/utils/seo";
import { getPostImageUrl, getPostImageSrc, getLocalizedPostTags } from "@/utils/helpers/post";
import { newsSingleGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";
import ContactFormForBlog from "@/components/views/landing/contact-us/contact-form-for-blog";
import BreadcrumbContextWrapper from "@/hooks/BreadcrumbContextWrapper";
import Breadcrumbs from "@/components/views/landing/bread-crumbs/bread-crumbs";
import { MdCalendarMonth, MdAccessTime } from "react-icons/md";

interface ISinglePostPageProps {
  params: {
    slug: string;
    locale: string;
  };
}

export async function generateStaticParams() {
  try {
    const { items } = await getAllPosts({
      page: 1,
      limit: 1000,
      postType: PostType.NEWS,
    });
    const locales: Locale[] = ["az", "en"];



    return locales.flatMap((locale) =>
      items
        .filter((item) => item.slug && item.slug[locale])
        .map((item) => ({
          locale,
          slug: item.slug[locale]!,
        }))
    );
  } catch (error) {
    console.error("Error generating static paths for posts:", error);
    return [];
  }
}

export default async function SinglePostPage({ params }: ISinglePostPageProps) {
  setRequestLocale(params.locale);
  const locale = params.locale as Locale;
  try {
    const [data, t] = await Promise.all([
      getPostDetails(params.slug),
      getTranslations("singlePostPage"),
    ]);


    if (!data || !data.title[locale] || !data.content[locale]) {
      console.warn(
        `Post data missing for slug: ${params.slug}, locale: ${locale}`
      );
      notFound();
    }

    const getPostTypeName = (type: PostType) => {
      switch (type) {
        case PostType.BLOG:
          return "blog";
        case PostType.NEWS:
          return "news";
        case PostType.EVENT:
          return "event";
        default:
          return type;
      }
    };

    const baseUrl = SITE.baseUrl;
    const base = locale === "az" ? baseUrl : `${baseUrl}/${locale}`;
    const newsTitle = data.title[locale] || "";
    const newsDescription = htmlToDescription(data.content[locale] || "");
    const newsImageUrl = getPostImageSrc(data.imageUrl, locale);
    const schema = newsSingleGraph({
      headline: newsTitle,
      description: newsDescription,
      url: `${base}/news/${params.slug}`,
      locale,
      breadcrumbItems: [
        { name: locale === "az" ? "Ana Səhifə" : "Home", url: base },
        { name: locale === "az" ? "Xəbərlər" : "News", url: `${base}/news` },
        { name: newsTitle, url: `${base}/news/${params.slug}` },
      ],
      imageUrl: newsImageUrl,
      datePublished: data.createdAt,
      dateModified: data.updatedAt || data.createdAt,
      author: data.author?.name ? { name: data.author.name } : null,
      keywords: getLocalizedPostTags(data.tags, locale),
    });

    return (
      <BreadcrumbContextWrapper title={data.title[locale]} postType={data.postType}>
        <JsonLd data={schema} />
        <div className="container pt-4">
          <Breadcrumbs dynamicTitle={data.title[locale]} />
        </div>
        <div className="min-h-screen ">
          <div className="relative container">
            <div className="flex flex-col lg:flex-row gap-8 py-20">
              <div className="w-full flex flex-col gap-8 lg:w-2/3">
                <PostHero
                  locale={locale}
                  title={data.title[locale]}
                  type={t(
                    `postType.${getPostTypeName(data.postType).toLowerCase()}`
                  )}
                  postType={data.postType}
                  eventDate={formatDate(data.eventDate || data.createdAt)}
                  eventTime={formatTime(data.eventDate || data.createdAt)}
                  dateIcon={<MdCalendarMonth className="text-xl" />}
                  timeIcon={<MdAccessTime className="text-xl" />}
                  content={data.content[locale]}
                  tags={data.tags || []}
                  imageUrl={data.imageUrl}
                  imageAlt={data.imageAlt?.[locale] || data.imageAlt?.az || data.title[locale]}
                  eventDateText={t("eventDateLabel")}
                  eventTimeText={t("eventTimeLabel")}
                  tagsText={t("tagsLabel")}
                />

                <RelatedPosts
                  title={t("relatedPosts")}
                  locale={locale}
                  currentPostId={data.id}
                  postType={data.postType}
                />
              </div>

              <div className="w-full lg:w-1/3 lg:sticky lg:top-7 h-fit">
              <ContactFormForBlog/>
              </div>
            </div>
          </div>
        </div>
      </BreadcrumbContextWrapper>
    );
  } catch (error) {
    console.error("Error in SinglePostPage:", error);
    notFound();
  }
}

export async function generateMetadata({
  params,
}: ISinglePostPageProps): Promise<Metadata> {
  setRequestLocale(params.locale);
  try {
    const data = await getPostDetails(params.slug);
    const locale = params.locale as Locale;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";

    if (!data || !data.title[locale] || !data.content[locale]) {
      console.warn(
        `Metadata: Post data missing for slug: ${params.slug}, locale: ${locale}`
      );
      return {
        title: "Not Found",
        description: "The requested post was not found",
        robots: {
          index: false,
        },
      };
    }

    const contentText = htmlToDescription(data.content[locale] || "");

    const postTypeUrl = "news";

    const canonicalUrl = addTrailingSlash(
      `${baseUrl}/${locale}/${postTypeUrl}/${params.slug}`
    );

    const azSlug = data.slug?.az || params.slug;
    const enSlug = data.slug?.en || params.slug;

    const truncatedTitle = truncateTitle(data.title[locale]);
    const truncatedDesc = contentText;
    const metaImagePath = getPostImageUrl(data.imageUrl, locale);
    const metaImageUrl = metaImagePath
      ? `${process.env.NEXT_PUBLIC_CDN_URL}/${metaImagePath}`
      : undefined;

    return {
      title: truncatedTitle,
      description: truncatedDesc,
      alternates: {
        canonical: canonicalUrl,
        languages: {
          az: data.slug.az
            ? addTrailingSlash(`${baseUrl}/az/${postTypeUrl}/${azSlug}`)
            : undefined,
          en: data.slug.en
            ? addTrailingSlash(`${baseUrl}/en/${postTypeUrl}/${enSlug}`)
            : undefined,
          "x-default": addTrailingSlash(`${baseUrl}/${postTypeUrl}/${azSlug}`),
        },
      },
      openGraph: {
        title: truncatedTitle,
        description: truncatedDesc,
        url: canonicalUrl,
        images: metaImageUrl ? [metaImageUrl] : [],
        type: "article",
        locale: locale === "az" ? "az_AZ" : "en_US",
        alternateLocale: locale === "az" ? "en_US" : "az_AZ",
      },
      twitter: {
        card: "summary_large_image",
        title: truncatedTitle,
        description: truncatedDesc,
        images: metaImageUrl ? [metaImageUrl] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error",
      description: "Failed to load post details",
      robots: {
        index: false,
      },
    };
  }
}

export const dynamic = "force-dynamic";
