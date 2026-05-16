"use client";

import BlogCategoryForm, {
  BlogCategoryFormInputs,
} from "@/components/views/dashboard/blog-category/blog-category-form";
import api from "@/utils/api/axios";
import type { BlogCategory } from "@/types/blog-category";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditBlogCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [original, setOriginal] = useState<BlogCategory | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlogCategoryFormInputs>({
    defaultValues: { name: { az: "", en: "" }, sortOrder: 0 },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get<BlogCategory>(
          `/blog-categories/${params.id}`
        );
        setOriginal(data);
        reset({
          name: { az: data.name.az ?? "", en: data.name.en ?? "" },
          sortOrder: data.sortOrder ?? 0,
        });
      } catch {
        toast.error("Kateqoriya tapılmadı");
        router.push("/dashboard/blog-categories");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id, reset, router]);

  const onSubmit = async (formData: BlogCategoryFormInputs) => {
    if (!original) return;
    try {
      const patch: Record<string, unknown> = {};
      if (original.name.az !== formData.name.az) {
        patch["name[az]"] = formData.name.az.trim();
      }
      if (original.name.en !== formData.name.en) {
        patch["name[en]"] = formData.name.en.trim();
      }
      if (original.sortOrder !== formData.sortOrder) {
        patch.sortOrder = formData.sortOrder;
      }
      if (Object.keys(patch).length === 0) {
        toast.info("Heç bir dəyişiklik yoxdur");
        router.push("/dashboard/blog-categories");
        return;
      }
      await api.patch(`/blog-categories/${params.id}`, patch);
      toast.success("Yadda saxlanıldı");
      router.push("/dashboard/blog-categories");
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Yenilənmə mümkün olmadı");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center min-h-screen items-center">
        Yüklənir...
      </div>
    );
  }

  return (
    <BlogCategoryForm
      mode="edit"
      onSubmit={onSubmit}
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      router={router}
    />
  );
}
