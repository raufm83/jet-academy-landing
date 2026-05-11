"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "@/utils/api/axios";
import VacancyForm, {
  VacancyFormInputs,
} from "@/components/views/dashboard/vacancy/vacancy-form";
import type { Vacancy } from "@/types/vacancy";

export default function EditVacancyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VacancyFormInputs>();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await api.get<Vacancy>(`/vacancies/manage/${id}`);
        const rawTags = data.tags;
        let bilingualTags: { az: string[]; en: string[] } = { az: [], en: [] };
        if (rawTags && typeof rawTags === "object" && !Array.isArray(rawTags)) {
          bilingualTags = {
            az: Array.isArray((rawTags as any).az) ? (rawTags as any).az : [],
            en: Array.isArray((rawTags as any).en) ? (rawTags as any).en : [],
          };
        } else if (Array.isArray(rawTags)) {
          bilingualTags = { az: rawTags, en: rawTags };
        }
        reset({
          title: {
            az: data.title.az,
            en: data.title.en ?? "",
          },
          description: {
            az: data.description.az,
            en: data.description.en ?? "",
          },
          requirements: {
            az: data.requirements?.az ?? "",
            en: data.requirements?.en ?? "",
          },
          workConditions: {
            az: data.workConditions?.az ?? "",
            en: data.workConditions?.en ?? "",
          },
          slug: {
            az: data.slug.az,
            en: data.slug.en ?? "",
          },
          jobLevel: {
            az: data.jobLevel?.az ?? "",
            en: data.jobLevel?.en ?? "",
          },
          tags: bilingualTags,
          employmentType: data.employmentType ?? "",
          deadline: data.deadline ? String(data.deadline).slice(0, 10) : "",
          isActive: data.isActive,
          order: data.order ?? 0,
        });
      } catch {
        toast.error("Vakansiya yüklənə bilmədi");
        router.push("/dashboard/vacancies");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id, reset, router]);

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
        slug: {
          az: data.slug.az.trim(),
          en: data.slug.en.trim(),
        },
      };
      if (data.requirements?.az?.trim() || data.requirements?.en?.trim()) {
        body.requirements = data.requirements;
      } else {
        body.requirements = { az: "", en: "" };
      }
      if (data.workConditions?.az?.trim() || data.workConditions?.en?.trim()) {
        body.workConditions = data.workConditions;
      } else {
        body.workConditions = { az: "", en: "" };
      }
      const jlAz = data.jobLevel?.az?.trim();
      const jlEn = data.jobLevel?.en?.trim();
      if (jlAz || jlEn) {
        body.jobLevel = { az: jlAz ?? "", en: jlEn ?? "" };
      } else {
        body.jobLevel = { az: "", en: "" };
      }
      body.tags = data.tags ?? { az: [], en: [] };
      body.employmentType = data.employmentType?.trim() || null;
      body.deadline = data.deadline?.trim() || null;
      await api.patch(`/vacancies/manage/${id}`, body);
      toast.success("Vakansiya yeniləndi");
      router.push("/dashboard/vacancies");
      router.refresh();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message ?? "Xəta baş verdi");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-default-500">Yüklənir...</div>
    );
  }

  return (
    <VacancyForm
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
    />
  );
}
