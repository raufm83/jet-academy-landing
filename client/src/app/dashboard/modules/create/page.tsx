"use client";
import ModuleForm from "@/components/views/dashboard/modules/module-form";
import { ModuleFormInputs } from "@/types/course";
import api from "@/utils/api/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";

export default function CreateModulePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<
    Array<{ id: string; title: { az: string; en: string } }>
  >([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [coursesLoading, setCoursesLoading] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      content: [{ az: "", en: "", order: 1, isActive: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "content",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get(
          "/courses?limit=100&includeUnpublished=true&sortOrder=desc"
        );
        setCourses(data.items ?? []);
      } catch {
        toast.error("Kurslar yüklənə bilmədi");
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const onSubmit = async (data: ModuleFormInputs) => {
    try {
      // 1. Create the module
      const response = await api.post("/course-modules", data);
      if (response.status !== 201) return;

      const moduleId: string = response.data.id;

      // 2. Assign to selected course if one was chosen
      if (selectedCourseId) {
        try {
          await api.post(`/course-modules/assign/${selectedCourseId}`, {
            moduleId,
            order: 999,
          });
          toast.success("Modul uğurla yaradıldı və kursa əlavə edildi");
        } catch {
          toast.warning("Modul yaradıldı, lakin kursa əlavə edilə bilmədi");
        }
      } else {
        toast.success("Modul uğurla yaradıldı");
      }

      router.push("/dashboard/modules");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xəta baş verdi");
    }
  };

  return (
    <ModuleForm
      mode="create"
      onSubmit={onSubmit}
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      router={router}
      fields={fields}
      append={append}
      remove={remove}
      courses={courses}
      selectedCourseId={selectedCourseId}
      onCourseSelectionChange={setSelectedCourseId}
      coursesLoading={coursesLoading}
    />
  );
}
