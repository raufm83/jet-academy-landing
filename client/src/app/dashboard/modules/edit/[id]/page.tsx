"use client";
import ModuleForm from "@/components/views/dashboard/modules/module-form";
import { ModuleFormInputs } from "@/types/course";
import api from "@/utils/api/axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";

export default function EditModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<
    Array<{ id: string; title: { az: string; en: string } }>
  >([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Keep track of the course assignment that existed when the page loaded
  // so we can diff it against the user's selection on submit.
  const originalCourseId = useRef<string>("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "content",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moduleRes, coursesRes] = await Promise.all([
          api.get(`/course-modules/${params.id}`),
          api.get("/courses?limit=100&includeUnpublished=true&sortOrder=desc"),
        ]);

        const moduleData = moduleRes.data;

        reset({
          title: moduleData.title ?? { az: "", en: "" },
          description: moduleData.description ?? { az: "", en: "" },
          content: Array.isArray(moduleData.content)
            ? moduleData.content.map((item: any) => ({
                ...item,
                isActive: item?.isActive !== false,
              }))
            : [],
        });

        // Extract the first assigned courseId (a module belongs to one course at a time)
        const firstAssigned: string = (moduleData.courses ?? [])[0]?.courseId ?? "";
        setSelectedCourseId(firstAssigned);
        originalCourseId.current = firstAssigned;

        setCourses(coursesRes.data.items ?? []);
      } catch (error) {
        console.error("Məlumatlar yüklənmədi:", error);
        toast.error("Məlumatlar yüklənə bilmədi");
        router.push("/dashboard/modules");
      } finally {
        setIsLoading(false);
        setCoursesLoading(false);
      }
    };

    fetchData();
  }, [params.id, reset, router]);

  const onSubmit = async (data: ModuleFormInputs) => {
    try {
      // 1. Update module fields
      const response = await api.patch(`/course-modules/${params.id}`, data);
      if (response.status !== 200) return;

      // 2. Sync course assignment: remove old, add new if changed
      const prev = originalCourseId.current;
      const next = selectedCourseId;

      if (prev !== next) {
        const ops: Promise<any>[] = [];
        if (prev) {
          ops.push(api.delete(`/course-modules/assign/${prev}/${params.id}`));
        }
        if (next) {
          ops.push(
            api.post(`/course-modules/assign/${next}`, {
              moduleId: params.id,
              order: 999,
            })
          );
        }
        const results = await Promise.allSettled(ops);
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length > 0) {
          toast.warning("Modul yeniləndi, lakin kurs tapşırığı uğursuz oldu");
        } else {
          toast.success("Modul uğurla yeniləndi");
        }
      } else {
        toast.success("Modul uğurla yeniləndi");
      }

      router.push("/dashboard/modules");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xəta baş verdi");
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
    <ModuleForm
      mode="edit"
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
