"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "@/utils/api/axios";
import VacancyForm, {
  VacancyFormInputs,
} from "@/components/views/dashboard/vacancy/vacancy-form";

export default function CreateVacancyPage() {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VacancyFormInputs>({
    defaultValues: {
      title: { az: "", en: "" },
      description: { az: "", en: "" },
      requirements: { az: "", en: "" },
      workConditions: { az: "", en: "" },
      slug: { az: "", en: "" },
      jobLevel: { az: "", en: "" },
      tags: { az: [], en: [] },
      employmentType: "",
      deadline: "",
      isActive: true,
      order: 0,
    },
  });

  const onSubmit = async (data: VacancyFormInputs) => {
    const descPlain = (data.description?.az || "")
      .replace(/<[^>]+>/g, " ")
      .trim();
    const descEnPlain = (data.description?.en || "")
      .replace(/<[^>]+>/g, " ")
      .trim();
    if (!descPlain || !descEnPlain) {
      toast.error("Təsvir hər iki dil üçün məcburidir.");
      return;
    }
    try {
      const body: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        isActive: data.isActive,
        order: data.order,
      };
      if (data.requirements?.az?.trim() || data.requirements?.en?.trim()) {
        body.requirements = data.requirements;
      }
      if (data.workConditions?.az?.trim() || data.workConditions?.en?.trim()) {
        body.workConditions = data.workConditions;
      }
      if (data.slug?.az?.trim() || data.slug?.en?.trim()) {
        body.slug = {
          az: data.slug.az.trim(),
          en: data.slug.en.trim(),
        };
      }
      const jlAz = data.jobLevel?.az?.trim();
      const jlEn = data.jobLevel?.en?.trim();
      if (jlAz || jlEn) {
        body.jobLevel = { az: jlAz ?? "", en: jlEn ?? "" };
      }
      if (data.tags?.az?.length || data.tags?.en?.length) {
        body.tags = data.tags;
      }
      if (data.employmentType?.trim()) {
        body.employmentType = data.employmentType.trim();
      }
      if (data.deadline?.trim()) {
        body.deadline = data.deadline.trim();
      }
      await api.post("/vacancies", body);
      toast.success("Vakansiya yaradıldı");
      router.push("/dashboard/vacancies");
      router.refresh();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Xəta baş verdi");
      console.error(error);
    }
  };

  return (
    <VacancyForm
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
