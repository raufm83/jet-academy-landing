"use client";

import BlogCategoryForm, {
  BlogCategoryFormInputs,
} from "@/components/views/dashboard/blog-category/blog-category-form";
import api from "@/utils/api/axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CreateBlogCategoryPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BlogCategoryFormInputs>({
    defaultValues: { name: { az: "", en: "" }, sortOrder: undefined },
  });

  const onSubmit = async (formData: BlogCategoryFormInputs) => {
    try {
      const payload: Record<string, unknown> = {
        "name[az]": formData.name.az.trim(),
        "name[en]": formData.name.en.trim(),
      };
      if (
        formData.sortOrder !== undefined &&
        !Number.isNaN(formData.sortOrder as number)
      ) {
        payload.sortOrder = formData.sortOrder;
      }

      await api.post("/blog-categories", payload);
      toast.success("Kateqoriya yaradıldı");
      router.push("/dashboard/blog-categories");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Xəta baş verdi. Yenidən cəhd edin"
      );
    }
  };

  return (
    <BlogCategoryForm
      mode="create"
      onSubmit={onSubmit}
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      router={router}
    />
  );
}
