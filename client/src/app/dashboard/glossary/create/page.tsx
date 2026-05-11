"use client";

import GlossaryForm from "@/components/views/dashboard/glossary/glossary-form";
import api from "@/utils/api/axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface GlossaryFormInputs {
  term: {
    az: string;
    en: string;
  };
  definition: {
    az: string;
    en: string;
  };
  slug: {
    az: string;
    en: string;
  };
  categoryId?: string;
  relatedTerms?: string[];
  published?: boolean;
}

const cleanGlossaryPayload = (data: GlossaryFormInputs) => ({
  ...data,
  categoryId: data.categoryId || undefined,
  relatedTerms: data.relatedTerms || [],
});

export default function CreateGlossaryPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GlossaryFormInputs>({
    defaultValues: {
      term: { az: "", en: "" },
      definition: { az: "", en: "" },
      slug: { az: "", en: "" },
      categoryId: "",
      relatedTerms: [],
      published: false,
    },
  });

  const onSubmit = async (formData: GlossaryFormInputs) => {
    try {
      const response = await api.post(
        "/glossary",
        cleanGlossaryPayload(formData)
      );

      if (response.status === 201) {
        toast.success("Termin uğurla yaradıldı");
        router.push("/dashboard/glossary");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Termin yaradılma xətası:", error);
      toast.error(
        error.response?.data?.message || "Xəta baş verdi. Yenidən cəhd edin"
      );
    }
  };

  return (
    <GlossaryForm
      mode="create"
      onSubmit={onSubmit}
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      router={router}
      setValue={setValue}
      watch={watch}
    />
  );
}
