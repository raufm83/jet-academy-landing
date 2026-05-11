"use client";

import {
  Button,
  Card,
  Input,
  Select,
  SelectItem,
  Switch,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useState, useEffect } from "react";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p className="text-sm text-default-500">Yüklənir...</p>,
});

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "clean"],
  ],
};

import {
  Control,
  Controller,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { MdWorkOutline } from "react-icons/md";
import BilingualTagInput, {
  TagPair,
  toPairs,
  fromPairs,
} from "@/components/views/dashboard/shared/bilingual-tag-input";

export interface VacancyFormInputs {
  title: { az: string; en: string };
  description: { az: string; en: string };
  requirements: { az: string; en: string };
  workConditions: { az: string; en: string };
  slug: { az: string; en: string };
  jobLevel: { az: string; en: string };
  tags: { az: string[]; en: string[] };
  employmentType: string;
  deadline?: string;
  isActive: boolean;
  order: number;
}

interface VacancyFormProps {
  mode: "create" | "edit";
  onSubmit: (data: VacancyFormInputs) => Promise<void>;
  register: UseFormRegister<VacancyFormInputs>;
  control: Control<VacancyFormInputs>;
  errors: FieldErrors<VacancyFormInputs>;
  isSubmitting: boolean;
  handleSubmit: UseFormHandleSubmit<VacancyFormInputs>;
  router: AppRouterInstance;
  setValue: UseFormSetValue<VacancyFormInputs>;
  watch: UseFormWatch<VacancyFormInputs>;
}

const inputClassNames = {
  input: "bg-default-100/80",
  inputWrapper: "bg-default-100/80",
};

export default function VacancyForm({
  mode,
  onSubmit,
  register,
  control,
  errors,
  isSubmitting,
  handleSubmit,
  router,
  setValue,
  watch,
}: VacancyFormProps) {
  const employmentOptions = [
    { key: "Full-Time", label: "Full-Time" },
    { key: "Half-Time", label: "Half-Time" },
    { key: "Remote", label: "Remote" },
    { key: "Freelance", label: "Freelance" },
  ];
  const experienceOptions = [
    { key: "none", az: "Tələb olunmur", en: "Not required" },
    { key: "1 il", az: "1 il", en: "1 year" },
    { key: "1 - 3 il", az: "1 - 3 il", en: "1 - 3 years" },
    { key: "3 - 5 il", az: "3 - 5 il", en: "3 - 5 years" },
    { key: "5 ildən yuxarı", az: "5 ildən yuxarı", en: "5+ years" },
  ];
  const [tagPairs, setTagPairs] = useState<TagPair[]>(() => {
    const raw = watch("tags");
    if (!raw) return [];
    return toPairs({ az: raw.az || [], en: raw.en || [] });
  });
  const [descAz, setDescAz] = useState("");
  const [descEn, setDescEn] = useState("");
  const [reqAz, setReqAz] = useState("");
  const [reqEn, setReqEn] = useState("");
  const [wcAz, setWcAz] = useState("");
  const [wcEn, setWcEn] = useState("");

  const descAzW = watch("description.az");
  const descEnW = watch("description.en");
  const reqAzW = watch("requirements.az");
  const reqEnW = watch("requirements.en");
  const wcAzW = watch("workConditions.az");
  const wcEnW = watch("workConditions.en");

  useEffect(() => {
    setDescAz(descAzW || "");
    setDescEn(descEnW || "");
  }, [descAzW, descEnW]);

  useEffect(() => {
    setReqAz(reqAzW || "");
    setReqEn(reqEnW || "");
  }, [reqAzW, reqEnW]);

  useEffect(() => {
    setWcAz(wcAzW || "");
    setWcEn(wcEnW || "");
  }, [wcAzW, wcEnW]);

  const watchedTags = watch("tags");
  useEffect(() => {
    if (watchedTags) {
      setTagPairs(toPairs({ az: watchedTags.az || [], en: watchedTags.en || [] }));
    }
  }, [watchedTags]);

  const handleTagsChange = (pairs: TagPair[]) => {
    setTagPairs(pairs);
    const bilingual = fromPairs(pairs);
    setValue("tags", bilingual, { shouldDirty: true });
  };

  const handleDescChange = (lang: "az" | "en", value: string) => {
    setValue(`description.${lang}`, value, { shouldDirty: true });
    if (lang === "az") setDescAz(value);
    else setDescEn(value);
  };

  const handleReqChange = (lang: "az" | "en", value: string) => {
    setValue(`requirements.${lang}`, value, { shouldDirty: true });
    if (lang === "az") setReqAz(value);
    else setReqEn(value);
  };

  const handleWcChange = (lang: "az" | "en", value: string) => {
    setValue(`workConditions.${lang}`, value, { shouldDirty: true });
    if (lang === "az") setWcAz(value);
    else setWcEn(value);
  };

  const wrapSubmit = handleSubmit(async (data) => {
    await onSubmit({
      ...data,
      order: Number(data.order) || 0,
    });
  });

  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-[#1F2937]">
              <MdWorkOutline className="text-jsyellow" size={28} />
              {mode === "create" ? "Yeni vakansiya" : "Vakansiya redaktəsi"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-default-500">
              Başlıq və təsvir hər iki dil üçün. Slug boş qalsa, başlıqdan avtomatik
              yaradılır.
            </p>
          </div>
          <Button
            variant="flat"
            className="text-jsyellow"
            onPress={() => router.push("/dashboard/vacancies")}
          >
            Geri
          </Button>
        </div>

        <form onSubmit={wrapSubmit} className="flex flex-col gap-8">
          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <Input
                {...register("title.az", { required: "Başlıq (AZ) mütləqdir" })}
                label="Vakansiya adı (AZ)"
                placeholder="Məs: Frontend Developer"
                variant="bordered"
                classNames={inputClassNames}
                isInvalid={!!errors.title?.az}
                errorMessage={errors.title?.az?.message}
              />
              <Input
                {...register("title.en", { required: "Title (EN) is required" })}
                label="Job title (EN)"
                placeholder="e.g. Frontend Developer"
                variant="bordered"
                classNames={inputClassNames}
                isInvalid={!!errors.title?.en}
                errorMessage={errors.title?.en?.message}
              />
            </div>
          </Card>

          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">İş haqqında məlumat</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#374151]">
                  İş haqqında məlumat (AZ)
                </label>
                <div className="min-h-[200px] rounded-medium border border-default-200 bg-default-100/50 p-1 [&_.ql-editor]:min-h-[140px]">
                  <ReactQuill
                    theme="snow"
                    value={descAz}
                    onChange={(val) => handleDescChange("az", val)}
                    modules={modules}
                  />
                </div>
                {errors.description?.az && (
                  <p className="text-tiny text-danger">{errors.description.az.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#374151]">
                  About job (EN)
                </label>
                <div className="min-h-[200px] rounded-medium border border-default-200 bg-default-100/50 p-1 [&_.ql-editor]:min-h-[140px]">
                  <ReactQuill
                    theme="snow"
                    value={descEn}
                    onChange={(val) => handleDescChange("en", val)}
                    modules={modules}
                  />
                </div>
                {errors.description?.en && (
                  <p className="text-tiny text-danger">{errors.description.en.message}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Namizədə tələblər</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#374151]">
                  Namizədə tələblər (AZ)
                </label>
                <div className="min-h-[200px] rounded-medium border border-default-200 bg-default-100/50 p-1 [&_.ql-editor]:min-h-[140px]">
                  <ReactQuill
                    theme="snow"
                    value={reqAz}
                    onChange={(val) => handleReqChange("az", val)}
                    modules={modules}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#374151]">
                  Requirements for candidate (EN)
                </label>
                <div className="min-h-[200px] rounded-medium border border-default-200 bg-default-100/50 p-1 [&_.ql-editor]:min-h-[140px]">
                  <ReactQuill
                    theme="snow"
                    value={reqEn}
                    onChange={(val) => handleReqChange("en", val)}
                    modules={modules}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">İş şəraiti</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#374151]">
                  İş şəraiti (AZ)
                </label>
                <div className="min-h-[200px] rounded-medium border border-default-200 bg-default-100/50 p-1 [&_.ql-editor]:min-h-[140px]">
                  <ReactQuill
                    theme="snow"
                    value={wcAz}
                    onChange={(val) => handleWcChange("az", val)}
                    modules={modules}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#374151]">
                  Work conditions (EN)
                </label>
                <div className="min-h-[200px] rounded-medium border border-default-200 bg-default-100/50 p-1 [&_.ql-editor]:min-h-[140px]">
                  <ReactQuill
                    theme="snow"
                    value={wcEn}
                    onChange={(val) => handleWcChange("en", val)}
                    modules={modules}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">Teqlər</h2>
            <BilingualTagInput
              tags={tagPairs}
              onChange={handleTagsChange}
              isDisabled={isSubmitting}
            />
          </Card>

          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">
              Slug (istəyə bağlı)
            </h2>
            <p className="mb-4 text-sm text-default-500">
              Boşdursa başlıqdan yaradılır.
            </p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <Input
                {...register("slug.az")}
                label="Slug (AZ)"
                placeholder="frontend-developer"
                variant="bordered"
                classNames={inputClassNames}
              />
              <Input
                {...register("slug.en")}
                label="Slug (EN)"
                placeholder="frontend-developer"
                variant="bordered"
                classNames={inputClassNames}
              />
            </div>
          </Card>

          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <Controller
                name="employmentType"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Rejim"
                    placeholder="Rejim seçin"
                    selectedKeys={field.value ? [field.value] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      field.onChange(selected || "");
                    }}
                    variant="bordered"
                    classNames={{ trigger: "min-h-10" }}
                  >
                    {employmentOptions.map((opt) => (
                      <SelectItem key={opt.key} textValue={opt.label}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
              <Controller
                name="jobLevel.az"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Təcrübə"
                    placeholder="Təcrübə seçin"
                    selectedKeys={(() => {
                      const match = experienceOptions.find((x) => x.az === field.value);
                      return match ? [match.key] : [];
                    })()}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      const opt = experienceOptions.find((x) => x.key === selected);
                      setValue("jobLevel.az", opt?.az ?? "", { shouldDirty: true });
                      setValue("jobLevel.en", opt?.en ?? "", { shouldDirty: true });
                    }}
                    variant="bordered"
                    classNames={{ trigger: "min-h-10" }}
                  >
                    {experienceOptions.map((opt) => (
                      <SelectItem key={opt.key} textValue={opt.az}>
                        {opt.az}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
              <Input
                {...register("deadline")}
                label="Deadline (Bitmə tarixi)"
                type="date"
                variant="bordered"
                classNames={inputClassNames}
                className="md:col-span-2"
              />
            </div>
          </Card>

          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start md:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#374151]" htmlFor="vacancy-active-switch">
                  Görünürlük
                </label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="vacancy-active-switch"
                      isSelected={!!field.value}
                      onValueChange={field.onChange}
                      color="primary"
                      classNames={{
                        base: "max-w-full",
                        label: "text-sm font-medium text-[#374151]",
                      }}
                    >
                      Aktiv — saytda görünsün
                    </Switch>
                  )}
                />
              </div>
              <div className="w-full max-w-xs">
                <Input
                  {...register("order", { valueAsNumber: true })}
                  type="number"
                  label="Sıra"
                  variant="bordered"
                  classNames={inputClassNames}
                  description="Kiçik rəqəm siyahıda əvvəl görünür."
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3 border-t border-default-200 pt-6">
            <Button
              variant="flat"
              type="button"
              onPress={() => router.push("/dashboard/vacancies")}
            >
              Ləğv et
            </Button>
            <Button type="submit" color="primary" className="bg-jsyellow text-white" isLoading={isSubmitting}>
              {mode === "create" ? "Yarat" : "Yadda saxla"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
