import { Post } from "@/types/post";
import { Locale } from "@/i18n/request";
import { PostType } from "@/types/enums";
import Pagination from "@/components/ui/pagination";
import PostCard from "../card";
import MarketingEmptyState from "@/components/shared/marketing-empty-state";

interface PostGridProps {
  posts: Post[];
  locale: Locale;
  t: any;
  meta?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  type?: PostType;
  paginationBaseUrl?: string;
}

export default function PostGrid({
  posts,
  locale,
  t,
  meta,
  type,
  paginationBaseUrl,
}: PostGridProps) {
  if (!posts || posts.length === 0) {
    if (type === PostType.OFFERS) {
      return (
        <MarketingEmptyState
          title={
            <>
              {t("noActiveCampaignsLine1")}
              <br />
              {t("noActiveCampaignsLine2")}
            </>
          }
          imageAlt={`${t("noActiveCampaignsLine1")} ${t("noActiveCampaignsLine2")}`}
        />
      );
    }
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-600 mb-2">
          {type === "EVENT" ? t("noEventsFound") : t("noPostsFound")}
        </h3>
        <p className="text-gray-500">{t("tryDifferentFilters")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 [@media(min-width:1500px)]:grid-cols-4 [@media(min-width:2500px)]:grid-cols-4 items-stretch">
        {posts.map((post: Post, index: number) => (
          <div key={post.id} className="min-h-0 h-full flex">
            <PostCard
              post={post}
              locale={locale}
              t={t}
              imagePriority={index === 0}
            />
          </div>
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination
            currentPage={meta.page!}
            totalPages={meta.totalPages!}
            baseUrl={
              paginationBaseUrl ??
              (type
                ? (() => {
                    const typePath =
                      type === "BLOG"
                        ? "blog"
                        : type === "OFFERS"
                          ? "offers"
                          : type === "EVENT"
                            ? "events"
                            : "news";
                    return `/${typePath}`;
                  })()
                : "/news")
            }
          />
        </div>
      )}
    </>
  );
}
