"use client";

import { STATIC_PAGE_META_KEYS } from "@/data/page-meta-keys";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Textarea,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useEffect, useState } from "react";
import {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { MdQuiz } from "react-icons/md";

export interface FaqFormInputs {
  question: { az: string; en: string };
  answer: { az: string; en: string };
  pages: string[];
  order: number;
}

interface FaqFormProps {
  mode: "create" | "edit";
  onSubmit: (data: FaqFormInputs) => Promise<void>;
  register: UseFormRegister<FaqFormInputs>;
  errors: FieldErrors<FaqFormInputs>;
  isSubmitting: boolean;
  handleSubmit: UseFormHandleSubmit<FaqFormInputs>;
  router: AppRouterInstance;
  setValue: UseFormSetValue<FaqFormInputs>;
  watch: UseFormWatch<FaqFormInputs>;
}

const inputClassNames = {
  input: "bg-default-100/80",
  inputWrapper: "bg-default-100/80",
};

export default function FaqForm({
  mode,
  onSubmit,
  register,
  errors,
  isSubmitting,
  handleSubmit,
  router,
  setValue,
  watch,
}: FaqFormProps) {
  const [courseOptions, setCourseOptions] = useState<
    { slug: string; label: string; published: boolean }[]
  >([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        /** Admin siyahısı üçün həm aktiv, həm də deaktiv kurslar görünməlidir. */
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/courses?limit=1000&page=1&sortOrder=desc&includeUnpublished=true`,
          { cache: "no-store", credentials: "include" }
        );
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        const mapped = items
          .map((item: any) => {
            const slug = item?.slug?.az || item?.slug?.en;
            const label = item?.title?.az || item?.title?.en || slug;
            if (!slug || !label) return null;
            return {
              slug: String(slug),
              label: String(label),
              published: Boolean(item?.published),
            };
          })
          .filter(Boolean) as {
            slug: string;
            label: string;
            published: boolean;
          }[];
        setCourseOptions(mapped);
      } catch {
        setCourseOptions([]);
      }
    };
    loadCourses();
  }, []);

  const selectedPages = watch("pages") || [];

  const togglePage = (key: string) => {
    const current = selectedPages;
    if (current.includes(key)) {
      setValue(
        "pages",
        current.filter((p) => p !== key),
        { shouldDirty: true }
      );
    } else {
      setValue("pages", [...current, key], { shouldDirty: true });
    }
  };

  const staticOptions = STATIC_PAGE_META_KEYS.filter(
    (x) =>
      x.key === "home" ||
      x.key === "about-us" ||
      x.key === "courses"
  );

  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-[#1F2937]">
              <MdQuiz className="text-jsyellow" size={26} />
              {mode === "create" ? "Yeni FAQ" : "FAQ redaktəsi"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-default-500">
              Sual və cavab AZ və EN doldurulmalıdır. Bir neçə səhifə seçə
              bilərsiniz.
            </p>
          </div>
          <Button
            variant="flat"
            className="text-jsyellow"
            onPress={() => router.push("/dashboard/faq")}
          >
            Geri
          </Button>
        </div>

        <form
          onSubmit={handleSubmit(async (data) => {
            await onSubmit({
              ...data,
              pages: data.pages || [],
              order: Number(data.order) || 0,
            });
          })}
          className="flex flex-col gap-6"
        >
          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_11rem] md:items-start md:gap-8">
              <div className="space-y-4">
                <div className="rounded-xl border border-default-200 bg-default-50/40 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-default-500">
                    Statik səhifələr
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {staticOptions.map((opt) => (
                      <Checkbox
                        key={opt.key}
                        isSelected={selectedPages.includes(opt.key)}
                        onValueChange={() => togglePage(opt.key)}
                        size="sm"
                        classNames={{
                          label: "text-sm",
                        }}
                      >
                        {opt.label}
                      </Checkbox>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-default-200 bg-default-50/40 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-default-500">
                    Kurs səhifələri
                  </p>
                  {courseOptions.length === 0 ? (
                    <p className="text-xs text-default-400">
                      Heç bir kurs tapılmadı.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      <Checkbox
                        isSelected={selectedPages.includes("course")}
                        onValueChange={() => togglePage("course")}
                        size="sm"
                        classNames={{
                          label: "text-sm font-medium",
                        }}
                      >
                        Bütün kurs səhifələri (ümumi)
                      </Checkbox>
                      {courseOptions.map((course) => {
                        const key = `course:${course.slug}`;
                        return (
                          <Checkbox
                            key={key}
                            isSelected={selectedPages.includes(key)}
                            onValueChange={() => togglePage(key)}
                            size="sm"
                            classNames={{
                              label: "text-sm",
                            }}
                          >
                            <span className="inline-flex items-center gap-2">
                              <span>{course.label}</span>
                              <span
                                className={`text-[10px] font-semibold uppercase tracking-wide rounded-full px-1.5 py-0.5 ${
                                  course.published
                                    ? "bg-success-100 text-success-600"
                                    : "bg-warning-100 text-warning-600"
                                }`}
                              >
                                {course.published ? "Aktiv" : "Deaktiv"}
                              </span>
                            </span>
                          </Checkbox>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedPages.length > 0 && (
                  <p className="text-xs text-default-500">
                    Seçilmiş: {selectedPages.length} səhifə
                  </p>
                )}
              </div>

              <Input
                {...register("order", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Minimum 0" },
                })}
                type="number"
                label="Sıra"
                placeholder="0"
                variant="bordered"
                size="sm"
                classNames={inputClassNames}
                description="Kiçik rəqəm əvvəldə."
              />
            </div>
          </Card>

          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">
              Suallar
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <Input
                {...register("question.az", {
                  required: "Sual (AZ) mütləqdir",
                })}
                label="Sual (AZ)"
                placeholder="Azərbaycan dilində sual"
                variant="bordered"
                size="sm"
                classNames={inputClassNames}
                isInvalid={!!errors.question?.az}
                errorMessage={errors.question?.az?.message}
              />
              <Input
                {...register("question.en", {
                  required: "Question (EN) is required",
                })}
                label="Sual (EN)"
                placeholder="Question in English"
                variant="bordered"
                size="sm"
                classNames={inputClassNames}
                isInvalid={!!errors.question?.en}
                errorMessage={errors.question?.en?.message}
              />
            </div>
          </Card>

          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">
              Cavablar
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <Textarea
                {...register("answer.az", {
                  required: "Cavab (AZ) mütləqdir",
                })}
                label="Cavab (AZ)"
                placeholder="Azərbaycan dilində cavab"
                variant="bordered"
                minRows={4}
                classNames={inputClassNames}
                isInvalid={!!errors.answer?.az}
                errorMessage={errors.answer?.az?.message}
              />
              <Textarea
                {...register("answer.en", {
                  required: "Answer (EN) is required",
                })}
                label="Cavab (EN)"
                placeholder="Answer in English"
                variant="bordered"
                minRows={4}
                classNames={inputClassNames}
                isInvalid={!!errors.answer?.en}
                errorMessage={errors.answer?.en?.message}
              />
            </div>
          </Card>

          <div className="flex justify-end gap-3 border-t border-default-200 pt-6">
            <Button
              variant="flat"
              type="button"
              onPress={() => router.push("/dashboard/faq")}
            >
              Ləğv et
            </Button>
            <Button
              type="submit"
              color="primary"
              className="bg-jsyellow text-white"
              isLoading={isSubmitting}
            >
              {mode === "create" ? "Yarat" : "Yadda saxla"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
