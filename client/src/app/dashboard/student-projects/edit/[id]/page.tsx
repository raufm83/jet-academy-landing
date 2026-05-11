"use client";
import ProjectForm from "@/components/views/dashboard/student-projects/project-form";
import { STUDENT_PROJECT_CATEGORIES } from "@/constants/studentProjectCategories";
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

    // Yoxdursa yaradaq
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

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [courseCategories, setCourseCategories] = useState<CourseOption[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control, // <<< lazım olacaq
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInputs>();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/student-projects/${params.id}`);
        reset(data); // formu burda doldururuq, ayrıca initialValues lazım deyil
      } catch (error) {
        console.error("Layihə məlumatlarını yükləmə xətası:", error);
        toast.error("Layihə məlumatları yüklənə bilmədi");
        router.push("/dashboard/student-projects");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [params.id, reset, router]);

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

  const selectCategories = courseCategories;

  const getChangedFields = (original: any, updated: any): Partial<ProjectFormInputs> => {
    if (!original) return updated;

    const changes: Partial<ProjectFormInputs> = {};

    if (original.title?.az !== updated.title?.az || original.title?.en !== updated.title?.en) {
      changes.title = { ...updated.title };
    }
    if (original.description?.az !== updated.description?.az || original.description?.en !== updated.description?.en) {
      changes.description = { ...updated.description };
    }
    if (original.link !== updated.link) {
      changes.link = updated.link;
    }
    if (original.categoryId !== updated.categoryId) {
      changes.categoryId = updated.categoryId;
    }
    if (original.imageUrl !== updated.imageUrl) {
      changes.imageUrl = updated.imageUrl;
    }

    return changes;
  };

  const onSubmit = async (formData: ProjectFormInputs) => {
    try {
      const { data: original } = await api.get(`/student-projects/${params.id}`);
      const changedData = getChangedFields(original, formData);

      if (Object.keys(changedData).length === 0) {
        toast.info("Heç bir dəyişiklik edilmədi");
        router.push("/dashboard/student-projects");
        return;
      }

      if (changedData.categoryId) {
        changedData.categoryId = await ensureCategoryId(
          changedData.categoryId,
          dynamicCategoryNameMap
        );
      }

      const response = await api.patch(`/student-projects/${params.id}`, changedData);
      if (response.status === 200) {
        toast.success("Layihə uğurla yeniləndi");
        router.push("/dashboard/student-projects");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Yeniləmə xətası:", error);
      toast.error(error?.response?.data?.message || "Xəta baş verdi. Yenidən cəhd edin");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 min-h-screen w-full flex items-center justify-center">
        <p>Yüklənir...</p>
      </div>
    );
  }

  return (
    <ProjectForm
      mode="edit"
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
