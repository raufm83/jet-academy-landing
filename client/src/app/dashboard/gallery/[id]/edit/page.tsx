"use client";

import GalleryForm from "@/components/views/dashboard/gallery/gallery-form";
import { GalleryFormInputs } from "@/types/gallery";
import api from "@/utils/api/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export default function EditGalleryItemPage() {
  const router = useRouter();
  const params = useParams();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GalleryFormInputs>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryItem = async () => {
      try {
        const { data } = await api.get(`/gallery/${params.id}`);
        // Pre-fill form
        reset({
          title: {
            az: data.title?.az || "",
            en: data.title?.en || "",
          },
          imageAlt: {
            az: data.imageAlt?.az || "",
            en: data.imageAlt?.en || "",
          },
        });
        // We can't pre-fill file input, but we can potentially show preview if we pass it to form
        // For now, let's just assume the form handles preview via a prop or we might need to update GalleryForm to accept initialImage
        // Since GalleryForm uses `setValue('image', ...)` on change, and expects `File`, we might need to adjust it or pass the URL differently.
        // Looking at GalleryForm: it has `previewUrl` state but no prop for initial image.
        // I will need to update GalleryForm to accept an initialImageUrl or similar.
      } catch (error) {
        console.error("Şəkil məlumatları yüklənə bilmədi:", error);
        toast.error("Şəkil məlumatlarını gətirmək mümkün olmadı");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchGalleryItem();
    }
  }, [params.id, reset]);

  const onSubmit = async (data: GalleryFormInputs) => {
    try {
      const formData = new FormData();
      if (data.title) {
        formData.append("title[az]", data.title.az);
        formData.append("title[en]", data.title.en);
      }

      if (data.imageAlt) {
        formData.append("imageAlt[az]", data.imageAlt.az || "");
        formData.append("imageAlt[en]", data.imageAlt.en || "");
      }

      // Only append image if a new one is selected
      if (data.image && data.image[0] instanceof File) {
        formData.append("image", data.image[0]);
      }

      const response = await api.patch(`/gallery/${params.id}`, formData);

      if (response.status === 200) {
        toast.success("Şəkil uğurla yeniləndi");
        router.push("/dashboard/gallery");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Yenilənmə xətası:", error);
      toast.error(
        error.response?.data?.message || "Xəta baş verdi. Yenidən cəhd edin"
      );
    }
  };

  if (loading) return <div>Yüklənir...</div>;

  return (
    <GalleryForm
      mode="edit"
      onSubmit={onSubmit}
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      router={router}
      setValue={setValue}
      // Note: We might need to pass initial data for preview here if GalleryForm supports it
    />
  );
}
