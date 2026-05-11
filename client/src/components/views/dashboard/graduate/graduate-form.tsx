"use client";

import {
  Button,
  Card,
  Input,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { MdCloudUpload, MdSchool } from "react-icons/md";
import api from "@/utils/api/axios";

interface CourseOption {
  id: string;
  title: { az?: string; en?: string };
}

export interface GraduateFormInputs {
  name: { az: string; en: string };
  story: { az: string; en: string };
  mediaType: "image" | "youtube";
  mediaUrl: string;
  courseId: string;
  isActive: boolean;
  order: number;
}

interface GraduateFormProps {
  mode: "create" | "edit";
  onSubmit: (data: GraduateFormInputs, imageFile?: File) => Promise<void>;
  register: UseFormRegister<GraduateFormInputs>;
  control: Control<GraduateFormInputs>;
  errors: FieldErrors<GraduateFormInputs>;
  isSubmitting: boolean;
  handleSubmit: UseFormHandleSubmit<GraduateFormInputs>;
  router: AppRouterInstance;
  setValue: UseFormSetValue<GraduateFormInputs>;
  watch: UseFormWatch<GraduateFormInputs>;
  existingImageUrl?: string;
}

const inputClassNames = {
  input: "bg-default-100/80",
  inputWrapper: "bg-default-100/80",
};

export default function GraduateForm({
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
  existingImageUrl,
}: GraduateFormProps) {
  const mediaType = watch("mediaType");
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  useEffect(() => {
    api
      .get("/courses?limit=100&sortOrder=desc")
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
        setCourses(items);
      })
      .catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const wrapSubmit = handleSubmit(async (data) => {
    await onSubmit(
      { ...data, order: Number(data.order) || 0 },
      imageFile || undefined
    );
  });

  const showPreview = previewUrl || existingImageUrl;

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
              <MdSchool className="text-jsyellow" size={28} />
              {mode === "create"
                ? "Yeni məzun hekayəsi"
                : "Məzun hekayəsi redaktəsi"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-default-500">
              Məzunun adı və hekayəsi hər iki dil üçün doldurulmalıdır.
            </p>
          </div>
          <Button
            variant="flat"
            className="text-jsyellow"
            onPress={() => router.push("/dashboard/graduates")}
          >
            Geri
          </Button>
        </div>

        <form onSubmit={wrapSubmit} className="flex flex-col gap-8">
          {/* Name */}
          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">
              Məzunun adı
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <Input
                {...register("name.az", { required: "Ad (AZ) mütləqdir" })}
                label="Ad (AZ)"
                placeholder="Məs: Əli Əliyev"
                variant="bordered"
                classNames={inputClassNames}
                isInvalid={!!errors.name?.az}
                errorMessage={errors.name?.az?.message}
              />
              <Input
                {...register("name.en", { required: "Name (EN) is required" })}
                label="Name (EN)"
                placeholder="e.g. Ali Aliyev"
                variant="bordered"
                classNames={inputClassNames}
                isInvalid={!!errors.name?.en}
                errorMessage={errors.name?.en?.message}
              />
            </div>
          </Card>

          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">
              Əlavə məlumat
            </h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              <Textarea
                {...register("story.az", {
                  required: "Hekayə (AZ) mütləqdir",
                })}
                label="Hekayə (AZ)"
                placeholder="Əlavə məlumat"
                variant="bordered"
                minRows={5}
                classNames={inputClassNames}
                isInvalid={!!errors.story?.az}
                errorMessage={errors.story?.az?.message}
              />
              <Textarea
                {...register("story.en", {
                  required: "Story (EN) is required",
                })}
                label="Story (EN)"
                placeholder="Graduate's success story"
                variant="bordered"
                minRows={5}
                classNames={inputClassNames}
                isInvalid={!!errors.story?.en}
                errorMessage={errors.story?.en?.message}
              />
            </div>
          </Card>

          {/* Course */}
          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">
              Məzun olduğu kurs
            </h2>
            <Controller
              name="courseId"
              control={control}
              render={({ field }) => (
                <Select
                  label="Kurs seçin"
                  variant="bordered"
                  placeholder="Kurs seçin (istəyə bağlı)"
                  selectedKeys={field.value ? new Set([field.value]) : new Set()}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string | undefined;
                    field.onChange(selected || "");
                  }}
                  classNames={{
                    trigger: "bg-default-100/80",
                    value: "bg-default-100/80",
                  }}
                >
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title?.az || c.title?.en || c.id}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
            {watch("courseId") && (
              <Button
                size="sm"
                variant="light"
                className="mt-2 text-danger"
                onPress={() => setValue("courseId", "")}
              >
                Kursu sil
              </Button>
            )}
          </Card>

          {/* Media */}
          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#1F2937]">
              Media
            </h2>

            <div className="mb-4 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setValue("mediaType", "image")}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  mediaType === "image"
                    ? "border-jsyellow bg-jsyellow/10 text-jsyellow"
                    : "border-default-200 text-default-500 hover:border-default-300"
                }`}
              >
                Şəkil yüklə
              </button>
              <button
                type="button"
                onClick={() => setValue("mediaType", "youtube")}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  mediaType === "youtube"
                    ? "border-jsyellow bg-jsyellow/10 text-jsyellow"
                    : "border-default-200 text-default-500 hover:border-default-300"
                }`}
              >
                YouTube video
              </button>
            </div>

            {mediaType === "youtube" ? (
              <Input
                {...register("mediaUrl")}
                label="YouTube URL"
                placeholder="https://www.youtube.com/watch?v=..."
                variant="bordered"
                classNames={inputClassNames}
              />
            ) : (
              <div className="space-y-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="bordered"
                  startContent={<MdCloudUpload size={20} />}
                  onPress={() => fileRef.current?.click()}
                >
                  Şəkil seç
                </Button>
                {showPreview && (
                  <div className="relative h-48 w-48 overflow-hidden rounded-lg border border-default-200">
                    <Image
                      src={previewUrl || existingImageUrl || ""}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized={!!previewUrl}
                    />
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Settings */}
          <Card className="border border-default-200 p-5 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start md:gap-8">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-[#374151]"
                  htmlFor="graduate-active-switch"
                >
                  Görünürlük
                </label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="graduate-active-switch"
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
              onPress={() => router.push("/dashboard/graduates")}
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
