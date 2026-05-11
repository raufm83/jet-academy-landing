import SectionTitle from "@/components/shared/section-title";
import ProjectCard from "@/components/views/landing/projects/project-card";
import { Project } from "@/types/student-projects";
import api from "@/utils/api/axios";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { resolvePageMeta } from "@/utils/api/page-meta";
import { feedbacksPageHref } from "@/lib/feedbacks-path";
import { buildAlternatesFeedbacks } from "@/utils/seo";
import { staticPageGraph, SITE } from "@/data/site-schema";
import JsonLd from "@/components/seo/json-ld";
import FaqSection from "@/components/views/landing/faq/faq-section";
import { resolveOptimizedImageUrl } from "@/utils/optimized-image-url";

export async function generateFeedbacksMetadata(locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
  const alternates = buildAlternatesFeedbacks(locale, baseUrl);

  const rawTitle = t("feedbacksPageTitle") || "Rəylər";
  const rawDescription =
    t("feedbacksPageDescription") ||
    "Tələbələrimizin rəyləri";

  const { title, description } = await resolvePageMeta(
    "projects",
    locale,
    rawTitle,
    rawDescription
  );

  return {
    title,
    description,
    keywords: ["tələbə rəyləri", "jet academy", "təhsil", "innovasiya"],
    alternates,
    openGraph: {
      title,
      description,
      type: "website",
      url: alternates.canonical,
      locale: locale === "az" ? "az_AZ" : "en_US",
      alternateLocale: locale === "az" ? "en_US" : "az_AZ",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
      },
    },
  };
}

const fetchProjects = async () => {
  try {
    const response = await api.get("/student-projects?limit=1000&order=asc");
    return response.data as { items: Project[] };
  } catch {
    return { items: [] as Project[] };
  }
};

const fetchCourses = async () => {
  try {
    const response = await api.get("/courses?limit=1000&sortOrder=asc");
    return response.data as { items: any[] };
  } catch {
    return { items: [] };
  }
};

export default async function FeedbacksPublicPage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "feedbacks",
  });

  const [projectsData, coursesData] = await Promise.all([
    fetchProjects(),
    fetchCourses(),
  ]);

  const categoryMap: Record<string, string> = {};
  (coursesData?.items ?? []).forEach((course: any) => {
    if (course?.title?.az && course?.title?.en) {
      categoryMap[course.title.az] = course.title.en;
    }
  });

  const sortedProjects = [...(projectsData?.items ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  if (!sortedProjects.length) {
    notFound();
  }

  const baseUrl = SITE.baseUrl;
  const loc = params.locale;
  const listPath = feedbacksPageHref(loc);
  const reviewLabelAz = "Rəylər";
  const reviewLabelEn = "Reviews";

  const schema = staticPageGraph({
    name: loc === "az" ? reviewLabelAz : reviewLabelEn,
    description:
      loc === "az"
        ? "Tələbələrimizin rəyləri"
        : "Reviews from our students",
    url:
      loc === "az"
        ? `${baseUrl}${listPath}`
        : `${baseUrl}/${loc}${listPath}`,
    locale: loc,
    breadcrumbItems: [
      {
        name: loc === "az" ? "Ana Səhifə" : "Home",
        url: loc === "az" ? baseUrl : `${baseUrl}/${loc}`,
      },
      {
        name: loc === "az" ? reviewLabelAz : reviewLabelEn,
        url:
          loc === "az"
            ? `${baseUrl}${listPath}`
            : `${baseUrl}/${loc}${listPath}`,
      },
    ],
  });

  return (
    <div id="media" className="container my-20 flex flex-col gap-8">
      <JsonLd data={schema} />
      <SectionTitle title={t("title")} description={t("description")} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 [@media(min-width:2500px)]:grid-cols-4">
        {sortedProjects.map((project: Project, index: number) => (
          <ProjectCard
            key={project.id}
            imageUrl={resolveOptimizedImageUrl(project.imageUrl, "project")}
            link={project.link}
            title={project.title}
            description={project.description}
            category={project.category}
            categoryMap={categoryMap}
            loadEager={index === 0}
          />
        ))}
      </div>
      <FaqSection pageKey="projects" locale={params.locale} />
    </div>
  );
}
