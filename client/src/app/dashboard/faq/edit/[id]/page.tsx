"use client";

import FaqForm, {
  FaqFormInputs,
} from "@/components/views/dashboard/faq/faq-form";
import api from "@/utils/api/axios";
import type { FaqItem } from "@/types/faq";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditFaqPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const originalRef = useRef<FaqFormInputs | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FaqFormInputs>();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get<FaqItem>(`/faq/${id}`);

        // Backward compat: old records may have `page` (string) instead of `pages` (array)
        let pages: string[] = [];
        if (Array.isArray(data.pages)) {
          pages = data.pages;
        } else if (typeof (data as any).page === "string" && (data as any).page) {
          pages = [(data as any).page];
        }

        const next: FaqFormInputs = {
          question: {
            az: data.question.az,
            en: data.question.en ?? "",
          },
          answer: {
            az: data.answer.az,
            en: data.answer.en ?? "",
          },
          pages,
          order: data.order,
        };
        originalRef.current = next;
        reset(next);
      } catch (e) {
        console.error(e);
        toast.error("FAQ tapılmadı");
        router.push("/dashboard/faq");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, reset, router]);

  const onSubmit = async (data: FaqFormInputs) => {
    const original = originalRef.current;
    if (!original) return;

    const payload: Partial<{
      question: FaqFormInputs["question"];
      answer: FaqFormInputs["answer"];
      pages: string[];
      order: number;
    }> = {};

    if (
      original.question.az !== data.question.az ||
      original.question.en !== data.question.en
    ) {
      payload.question = { ...data.question };
    }
    if (
      original.answer.az !== data.answer.az ||
      original.answer.en !== data.answer.en
    ) {
      payload.answer = { ...data.answer };
    }

    const pagesChanged =
      original.pages.length !== data.pages.length ||
      original.pages.some((p, i) => data.pages[i] !== p) ||
      data.pages.some((p, i) => original.pages[i] !== p);
    if (pagesChanged) payload.pages = data.pages;

    if (original.order !== data.order) payload.order = data.order;

    if (Object.keys(payload).length === 0) {
      toast.info("Dəyişiklik yoxdur");
      router.push("/dashboard/faq");
      return;
    }
    try {
      await api.patch(`/faq/${id}`, payload);
      toast.success("Yeniləndi");
      router.push("/dashboard/faq");
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
    <FaqForm
      mode="edit"
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
