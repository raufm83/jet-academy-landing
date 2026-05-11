"use client";

import GlossaryForm from "@/components/views/dashboard/glossary/glossary-form";
import api from "@/utils/api/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface GlossaryFormInputs {
  id?: string;
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
  id: undefined,
  categoryId: data.categoryId || undefined,
  relatedTerms: data.relatedTerms || [],
});

export default function EditGlossaryPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<GlossaryFormInputs | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GlossaryFormInputs>();

  useEffect(() => {
    const fetchTerm = async () => {
      try {
        const { data } = await api.get(`/glossary/${params.id}`);
        const values: GlossaryFormInputs = {
          id: data.id,
          term: data.term || { az: "", en: "" },
          definition: data.definition || { az: "", en: "" },
          slug: data.slug || { az: "", en: "" },
          categoryId: data.categoryId || "",
          relatedTerms: data.relatedTerms || [],
          published: Boolean(data.published),
        };

        setInitialValues(values);
        reset(values);
      } catch (error) {
        console.error("Termin məlumatlarını yükləmə xətası:", error);
        toast.error("Termin məlumatları yüklənə bilmədi");
        router.push("/dashboard/glossary");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerm();
  }, [params.id, reset, router]);

  const onSubmit = async (formData: GlossaryFormInputs) => {
    try {
      const response = await api.patch(
        `/glossary/${params.id}`,
        cleanGlossaryPayload(formData)
      );

      if (response.status === 200) {
        toast.success("Termin uğurla yeniləndi");
        router.push("/dashboard/glossary");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Termin yeniləmə xətası:", error);
      toast.error(
        error.response?.data?.message || "Xəta baş verdi. Yenidən cəhd edin"
      );
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
    <GlossaryForm
      mode="edit"
      initialValues={initialValues}
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
