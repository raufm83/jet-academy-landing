import SectionTitle from "@/components/shared/section-title";
import Button from "@/components/ui/button";
import ProjectCard from "@/components/views/landing/projects/project-card";
import api from "@/utils/api/axios";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { MdArrowRightAlt } from "react-icons/md";
import { resolveOptimizedImageUrl } from "@/utils/optimized-image-url";
import { feedbacksPageHref } from "@/lib/feedbacks-path";

/**
 * Homepage-də karusel əvəzinə statik grid istifadə olunur ki, sayt yüklənmə
 * sürəti artsın və layihələrin tam siyahısı rəylər səhifəsində görünsün.
 */
const HOMEPAGE_LIMIT = 3;

const fetchProjects = async () => {
  try {
    const response = await api.get(
      `/student-projects?limit=${HOMEPAGE_LIMIT}&order=asc`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return null;
  }
};

export default async function Projects() {
  try {
    const [t, projects, locale] = await Promise.all([
      getTranslations("feedbacks"),
      fetchProjects(),
      getLocale(),
    ]);
    if (!projects) return null;

    const normalized = Array.isArray(projects)
      ? {
          items: projects,
          meta: {
            total: projects.length,
            page: 1,
            limit: projects.length,
            totalPages: 1,
          },
        }
      : projects;

    const visible = (normalized?.items ?? []).slice(0, HOMEPAGE_LIMIT);
    if (!visible.length) return null;

    return (
      <div
        id="media"
        className="
          container mx-auto
          my-20 4xl:my-24
          p-0
          flex flex-col
          gap-8 4xl:gap-12
        "
      >
        <SectionTitle title={t("title")} description={t("description")} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 4xl:gap-8">
          {visible.map((project: any) => (
            <div
              key={project.id}
              className="h-[327px] rounded-3xl shadow-lg 4xl:rounded-[48px]"
            >
              <ProjectCard
                description={project.description}
                title={project.title}
                imageUrl={resolveOptimizedImageUrl(project.imageUrl, "project")}
                link={project.link}
                category={project.category}
                loadEager={false}
              />
            </div>
          ))}
        </div>

        <Link href={feedbacksPageHref(locale)}>
          <Button
            iconPosition="right"
            className="
              items-center mx-auto
              py-3 4xl:py-4 px-6 4xl:px-8
              [@media(min-width:3500px)]:!text-2xl
            "
            icon={
              <MdArrowRightAlt
                size={24}
                className="[@media(min-width:3500px)]:!w-12 [@media(min-width:3500px)]:!h-12"
              />
            }
            text={t("seeAll")}
          />
        </Link>
      </div>
    );
  } catch (error) {
    console.error("Projects component error:", error);
    return null;
  }
}