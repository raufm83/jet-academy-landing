"use client";

import FaqForm, {
  FaqFormInputs,
} from "@/components/views/dashboard/faq/faq-form";
import api from "@/utils/api/axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CreateFaqPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FaqFormInputs>({
    defaultValues: {
      question: { az: "", en: "" },
      answer: { az: "", en: "" },
      pages: [],
      order: 0,
    },
  });

  const onSubmit = async (data: FaqFormInputs) => {
    try {
      const res = await api.post("/faq", {
        question: data.question,
        answer: data.answer,
        pages: data.pages,
        order: Number.isFinite(data.order) ? data.order : 0,
      });
      if (res.status === 201 || res.status === 200) {
        toast.success("FAQ yaradıldı");
        router.push("/dashboard/faq");
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
    <FaqForm
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
