"use client";

import GraduateForm, {
  GraduateFormInputs,
} from "@/components/views/dashboard/graduate/graduate-form";
import api from "@/utils/api/axios";
import type { Graduate } from "@/types/graduate";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function getImageUrl(raw?: string): string {
  if (!raw) return "";
  const sanitizeBase = (value?: string) =>
    (value || "")
      .replace(/\/$/, "")
      .replace(/\/api\/?$/, "")
      .replace(/\/uploads-acad\/?$/, "")
      .replace(/\/uploads\/?$/, "");
  const base =
    sanitizeBase(process.env.NEXT_PUBLIC_CDN_URL) ||
    sanitizeBase(process.env.NEXT_PUBLIC_API_URL);
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const normalizedPath = raw.replace(/^\/+/, "");
  if (normalizedPath.startsWith("uploads/")) {
    return base ? `${base}/${normalizedPath}` : `/${normalizedPath}`;
  }
  return base
    ? `${base}/uploads/${normalizedPath}`
    : `/uploads/${normalizedPath}`;
}

export default function EditGraduatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");
  const originalRef = useRef<Graduate | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GraduateFormInputs>();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get<Graduate>(`/graduates/manage/${id}`);
        originalRef.current = data;

        if (data.mediaType === "image" && data.mediaUrl) {
          setExistingImageUrl(getImageUrl(data.mediaUrl));
        }

        reset({
          name: { az: data.name.az, en: data.name.en ?? "" },
          story: { az: data.story.az, en: data.story.en ?? "" },
          mediaType: data.mediaType as "image" | "youtube",
          mediaUrl: data.mediaType === "youtube" ? data.mediaUrl : "",
          courseId: data.courseId || "",
          isActive: data.isActive,
          order: data.order,
        });
      } catch (e) {
        console.error(e);
        toast.error("Məzun tapılmadı");
        router.push("/dashboard/graduates");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, reset, router]);

  const onSubmit = async (data: GraduateFormInputs, imageFile?: File) => {
    try {
      const formData = new FormData();
      formData.append("name[az]", data.name.az);
      formData.append("name[en]", data.name.en);
      formData.append("story[az]", data.story.az);
      formData.append("story[en]", data.story.en);
      formData.append("mediaType", data.mediaType);
      formData.append("courseId", data.courseId || "");
      formData.append("isActive", String(data.isActive));
      formData.append("order", String(data.order));

      if (data.mediaType === "youtube") {
        formData.append("mediaUrl", data.mediaUrl || "");
      } else if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.patch(`/graduates/manage/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Yeniləndi");
      router.push("/dashboard/graduates");
      router.refresh();
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Xəta baş verdi";
      toast.error(typeof msg === "string" ? msg : "Xəta baş verdi");
      console.error(error);
    }
  };

  if (loading || !originalRef.current) {
    return (
      <div className="flex min-h-[30vh] w-full items-center justify-center p-4">
        <p className="text-sm text-default-500">Yüklənir...</p>
      </div>
    );
  }

  return (
    <GraduateForm
      mode="edit"
      onSubmit={onSubmit}
      register={register}
      control={control}
      errors={errors}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      router={router}
      setValue={setValue}
      watch={watch}
      existingImageUrl={existingImageUrl}
    />
  );
}
