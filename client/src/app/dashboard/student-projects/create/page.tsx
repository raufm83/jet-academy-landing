"use client";
import ProjectForm from "@/components/views/dashboard/student-projects/project-form";
import { STUDENT_PROJECT_CATEGORIES, type Category } from "@/constants/studentProjectCategories";
import { ProjectFormInputs } from "@/types/student-projects";
import api from "@/utils/api/axios";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const ensureCategoryId = async (
  categoryId: string,
  dynamicCategories?: Record<string, string>
) => {
  if (!categoryId?.startsWith("local-")) return categoryId;

  const categoryName =
    dynamicCategories?.[categoryId] ||
    STUDENT_PROJECT_CATEGORIES.find((c) => c.id === categoryId)?.name;

  if (!categoryName) throw new Error("Kateqoriya adı təyin edilə bilmədi");

  // Mövcud kateqoriyanı yoxlayaq
  try {
    const { data } = await api.get("/student-project-categories");
    const existingCategory = data.items.find(
      (c: any) => c.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (existingCategory) {
      return existingCategory.id;
    }

    const { data: newCategory } = await api.post(
      "/student-project-categories",
      {
        name: categoryName,
      }
    );
    return newCategory.id;
  } catch (error) {
    console.error("Kateqoriya xətası:", error);
    throw new Error("Kateqoriya yaradıla bilmədi");
  }
};

type CourseOption = { id: string; name: string };

export default function CreateProjectPage() {
  const router = useRouter();
  const [courseCategories, setCourseCategories] = useState<CourseOption[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get("/courses", {
          params: { page: 1, limit: 1000, sortOrder: "desc" },
        });
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        const mapped: CourseOption[] = items.map((c: any) => ({
          id: `local-${c.id}`,
          name: c?.title?.az || c?.title?.en || "Naməlum kurs",
        }));
        setCourseCategories(mapped);
      } catch (error) {
        console.error("Kursları yükləmək alınmadı:", error);
      }
    };

    fetchCourses();
  }, []);

  const dynamicCategoryNameMap = useMemo<Record<string, string>>(
    () =>
      courseCategories.reduce(
        (acc, c) => {
          acc[c.id] = c.name;
          return acc;
        },
        {} as Record<string, string>
      ),
    [courseCategories]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
  } = useForm<ProjectFormInputs>({
    defaultValues: {
      title: { az: "", en: "" },
      description: { az: "", en: "" },
      categoryId: "",
      link: "",
      imageUrl: "",
    },
  });

  const onSubmit = async (data: ProjectFormInputs) => {
    try {
      const realCategoryId = await ensureCategoryId(data.categoryId, dynamicCategoryNameMap);
      const payload = { ...data, categoryId: realCategoryId };

      const res = await api.post("/student-projects", payload);
      if (res.status === 201) {
        toast.success("Layihə uğurla yaradıldı");
        reset();
        router.push("/dashboard/student-projects");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Yaradılma xətası:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "Xəta baş verdi. Yenidən cəhd edin"
      );
    }
  };

  const selectCategories: Category[] =
    courseCategories.length > 0
      ? courseCategories
      : STUDENT_PROJECT_CATEGORIES;

  return (
    <ProjectForm
      mode="create"
      onSubmit={onSubmit}
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      router={router}
      control={control}
      categories={selectCategories}
    />
  );
}
