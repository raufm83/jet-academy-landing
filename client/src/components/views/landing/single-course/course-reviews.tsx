import SectionTitle from "@/components/shared/section-title";
import ProjectCard from "@/components/views/landing/projects/project-card";
import { Project } from "@/types/student-projects";
import api from "@/utils/api/axios";
import { resolveOptimizedImageUrl } from "@/utils/optimized-image-url";

async function fetchCourseReviews(courseId: string): Promise<Project[]> {
  try {
    const response = await api.get("/student-projects", {
      params: { limit: 100, order: "asc", courseId },
    });
    const items: Project[] = response.data?.items ?? [];
    return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch {
    return [];
  }
}

export default async function CourseReviews({
  courseId,
  locale,
}: {
  courseId?: string;
  locale: string;
}) {
  if (!courseId) return null;
  const reviews = await fetchCourseReviews(courseId);
  if (!reviews.length) return null;
  const isAz = locale === "az";

  return (
    <section id="course-reviews" className="flex flex-col gap-6 my-10">
      <SectionTitle
        title={isAz ? "Tələbə rəyləri" : "Student reviews"}
        description={
          isAz
            ? "Bu təlimi bitirən tələbələrimizin rəyləri"
            : "Reviews from students who completed this course"
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((project, index) => (
          <ProjectCard
            key={project.id}
            imageUrl={resolveOptimizedImageUrl(project.imageUrl, "project")}
            link={project.link}
            title={project.title}
            description={project.description}
            category={project.category}
            loadEager={index === 0}
          />
        ))}
      </div>
    </section>
  );
}
