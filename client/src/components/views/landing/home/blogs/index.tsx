// src/components/views/landing/home/blogs.tsx
import SectionTitle from "@/components/shared/section-title";
import Button from "@/components/ui/button";
import { PostType } from "@/types/enums";
import { getPostsByType } from "@/utils/api/post";
import { Post } from "@/types/post";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { MdArrowRightAlt } from "react-icons/md";
import PostCard from "../../post/card";
import { Locale } from "@/i18n/request";

const HOMEPAGE_POST_TYPES = [PostType.NEWS, PostType.EVENT, PostType.BLOG] as const;

export default async function Blogs() {
  try {
    const [t, locale, ...results] = await Promise.all([
      getTranslations("blogs"),
      getLocale() as Promise<Locale>,
      ...HOMEPAGE_POST_TYPES.map((type) => getPostsByType(type, 1, 100)),
    ]);

    const allItems: Post[] = results
      .flatMap((r) => r.items ?? [])
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    if (allItems.length === 0) return null;

    const visible = allItems.slice(0, 4);
    const cardT = await getTranslations("postsPage");

    return (
      <div
        id="blogs"
        className="
          container mx-auto
          px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16
          2xl:px-0 3xl:px-24 4xl:px-32
          my-20 4xl:my-24
          flex flex-col gap-8 4xl:gap-12
        "
      >
        <SectionTitle title={t("title")} description={t("description")} />

        <div className="mx-auto grid w-full max-w-[1560px] grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-4">
          {visible.map((post) => (
            <PostCard
              key={post.id}
              t={cardT}
              locale={locale}
              post={post}
              compact
              imagePriority={false}
            />
          ))}
        </div>

        <Link href="/news">
          <Button
            iconPosition="right"
            className="items-center mx-auto py-3 [@media(min-width:3500px)]:!text-2xl px-6 4xl:py-4 4xl:px-8"
            icon={<MdArrowRightAlt size={24} className="[@media(min-width:3500px)]:!w-12 [@media(min-width:3500px)]:!h-12" />}
            text={t("seeAll")}
          />
        </Link>
      </div>
    );
  } catch (error) {
    console.error("Blogs component error:", error);
    return null;
  }
}
