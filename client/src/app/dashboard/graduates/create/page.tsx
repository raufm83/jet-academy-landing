"use client";

import GraduateForm, {
  GraduateFormInputs,
} from "@/components/views/dashboard/graduate/graduate-form";
import api from "@/utils/api/axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CreateGraduatePage() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GraduateFormInputs>({
    defaultValues: {
      name: { az: "", en: "" },
      story: { az: "", en: "" },
      mediaType: "image",
      mediaUrl: "",
      courseId: "",
      isActive: true,
      order: 0,
    },
  });

  const onSubmit = async (data: GraduateFormInputs, imageFile?: File) => {
    try {
      const formData = new FormData();
      formData.append("name[az]", data.name.az);
      formData.append("name[en]", data.name.en);
      formData.append("story[az]", data.story.az);
      formData.append("story[en]", data.story.en);
      formData.append("mediaType", data.mediaType);
      if (data.courseId) formData.append("courseId", data.courseId);
      formData.append("isActive", String(data.isActive));
      formData.append("order", String(data.order));

      if (data.mediaType === "youtube") {
        formData.append("mediaUrl", data.mediaUrl || "");
      } else if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await api.post("/graduates", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201 || res.status === 200) {
        toast.success("Məzun yaradıldı");
        router.push("/dashboard/graduates");
        router.refresh();
      }
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Xəta baş verdi";
      toast.error(typeof msg === "string" ? msg : "Xəta baş verdi");
      console.error(error);
    }
  };

  return (
    <GraduateForm
      mode="create"
      onSubmit={onSubmit}
      register={register}
      control={control}
      errors={errors}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      router={router}
      setValue={setValue}
      watch={watch}
    />
  );
}
