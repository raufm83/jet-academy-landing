"use client";
import { slugifyText } from "@/utils/slugify";
import {
  Button,
  Card,
  Input,
  Switch,
} from "@nextui-org/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  MdAccessTime,
  MdDescription,
  MdImage,
  MdLink,
  MdPeople,
  MdStar,
  MdTag,
  MdTitle,
} from "react-icons/md";
import "react-quill/dist/quill.snow.css";
import BilingualTagInput, {
  TagPair,
  toPairs,
  fromPairs,
} from "@/components/views/dashboard/shared/bilingual-tag-input";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["link"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "link",
  "color",
  "background",
];

export default function CourseForm({
  mode,
  onSubmit,
  register,
  errors,
  isSubmitting,
  handleSubmit,
  router,
  watch,
  setValue,
  initialValues,
}: any) {
  const [tagPairs, setTagPairs] = useState<TagPair[]>(
    toPairs({ az: initialValues?.newTags?.az || [], en: initialValues?.newTags?.en || [] }),
  );

  const [descriptionAz, setDescriptionAz] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [shortDescriptionAz, setShortDescriptionAz] = useState("");
  const [shortDescriptionEn, setShortDescriptionEn] = useState("");

  const [, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (mode === "edit" && initialValues) {
      const watchedDescAz = watch("description.az");
      const watchedDescEn = watch("description.en");
      const watchedShortDescAz = watch("shortDescription.az");
      const watchedShortDescEn = watch("shortDescription.en");

      if (watchedDescAz) setDescriptionAz(watchedDescAz);
      if (watchedDescEn) setDescriptionEn(watchedDescEn);
      if (watchedShortDescAz) setShortDescriptionAz(watchedShortDescAz);
      if (watchedShortDescEn) setShortDescriptionEn(watchedShortDescEn);

      if (initialValues?.imageUrl) {
        setImagePreview(initialValues.imageUrl);
      }
    }
  }, [mode, watch, initialValues]);

  useEffect(() => {
    if (initialValues) {
      setTagPairs(toPairs({ az: initialValues.newTags?.az || [], en: initialValues.newTags?.en || [] }));
    }
  }, [initialValues]);

  const isPublished = watch("published", false);

  const handleTitleChange = (lang: string, value: string) => {
    const slugValue = slugifyText(value);
    setValue(`slug.${lang}`, slugValue);
  };

  const handleDescriptionChange = (lang: string, value: string) => {
    setValue(`description.${lang}`, value);
    if (lang === "az") {
      setDescriptionAz(value);
    } else {
      setDescriptionEn(value);
    }
  };

  const handleShortDescriptionChange = (lang: string, value: string) => {
    setValue(`shortDescription.${lang}`, value);
    if (lang === "az") {
      setShortDescriptionAz(value);
    } else {
      setShortDescriptionEn(value);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setValue("image", file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    setValue("image", null);

    const fileInput = document.getElementById(
      "course-image"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleTagsChange = (pairs: TagPair[]) => {
    setTagPairs(pairs);
    const { az, en } = fromPairs(pairs);
    setValue("newTags.az", az);
    setValue("newTags.en", en);
  };

  return (
    <div className="p-6 min-h-screen w-full flex items-center justify-center">
      <div className="w-full">
        <Card className="w-full max-w-4xl p-6 bg-white shadow-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black">
              {mode === "create" ? "Yeni Kurs Yarat" : "Kursa Düzəliş Et"}
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            encType="multipart/form-data"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MdImage className="text-gray-400" />
                <label className="text-sm font-medium">Kurs Şəkli</label>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MdDescription className="text-gray-400" />
                    Qısa Təsvir (AZ)
                  </label>
                  <Input
                    type="text"
                    variant="bordered"
                    placeholder="Texnologiya dünyasına ilk addımını at!"
                    value={shortDescriptionAz}
                    onChange={(e) =>
                      handleShortDescriptionChange("az", e.target.value)
                    }
                    isDisabled={isSubmitting}
                    classNames={{
                      input: "bg-transparent",
                      inputWrapper: [
                        "bg-white border-2 hover:border-primary focus:border-primary",
                      ],
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MdDescription className="text-gray-400" />
                    Brief description (EN)
                  </label>
                  <Input
                    type="text"
                    variant="bordered"
                    placeholder="Сделай первый шаг в мир технологий!"
                    value={shortDescriptionEn}
                    onChange={(e) =>
                      handleShortDescriptionChange("en", e.target.value)
                    }
                    isDisabled={isSubmitting}
                    classNames={{
                      input: "bg-transparent",
                      inputWrapper: [
                        "bg-white border-2 hover:border-primary focus:border-primary",
                      ],
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Rəng Teması
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Arxa Plan Rəngi
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        className="w-14 h-14 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-primary transition-colors"
                        value={watch("backgroundColor") || "#FEF3C7"}
                        onChange={(e) => setValue("backgroundColor", e.target.value, { shouldDirty: true })}
                      />
                      <Input
                        type="text"
                        variant="bordered"
                        placeholder="#FEF3C7"
                        {...register("backgroundColor")}
                        classNames={{
                          input: "bg-transparent font-mono text-sm",
                          inputWrapper: [
                            "bg-white border-2 hover:border-primary focus:border-primary",
                          ],
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Kənar Rəngi
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        className="w-14 h-14 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-primary transition-colors"
                        value={watch("borderColor") || "#F59E0B"}
                        onChange={(e) => setValue("borderColor", e.target.value, { shouldDirty: true })}
                      />
                      <Input
                        type="text"
                        variant="bordered"
                        placeholder="#F59E0B"
                        {...register("borderColor")}
                        classNames={{
                          input: "bg-transparent font-mono text-sm",
                          inputWrapper: [
                            "bg-white border-2 hover:border-primary focus:border-primary",
                          ],
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Mətn Rəngi
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        className="w-14 h-14 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-primary transition-colors"
                        value={watch("textColor") || "#1F2937"}
                        onChange={(e) => setValue("textColor", e.target.value, { shouldDirty: true })}
                      />
                      <Input
                        type="text"
                        variant="bordered"
                        placeholder="#1F2937"
                        {...register("textColor")}
                        classNames={{
                          input: "bg-transparent font-mono text-sm",
                          inputWrapper: [
                            "bg-white border-2 hover:border-primary focus:border-primary",
                          ],
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {imagePreview ? (
                  <div className="relative">
                    <div className="relative w-[200px] h-48 rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Course preview"
                        fill
                        className="object-cover"
                        unoptimized={true}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white min-w-0 w-8 h-8 p-0"
                      size="sm"
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MdImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="course-image" className="cursor-pointer">
                        <span className="text-primary hover:text-primary/80">
                          Şəkil seçin
                        </span>
                        <span className="text-gray-500">
                          {" "}
                          və ya buraya atın
                        </span>
                      </label>
                      <input
                        id="course-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF (max. 5MB)
                    </p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input
                   type="text"
                   label="Şəkil Alt Mətni (AZ)"
                   variant="bordered"
                   startContent={<MdDescription className="text-gray-400" />}
                   isDisabled={isSubmitting}
                   {...register("imageAlt.az")}
                   classNames={{
                     input: "bg-transparent",
                     inputWrapper: [
                       "bg-white border-2 hover:border-primary focus:border-primary",
                     ],
                   }}
                 />
                 <Input
                   type="text"
                   label="Image Alt Text (EN)"
                   variant="bordered"
                   startContent={<MdDescription className="text-gray-400" />}
                   isDisabled={isSubmitting}
                   {...register("imageAlt.en")}
                   classNames={{
                     input: "bg-transparent",
                     inputWrapper: [
                       "bg-white border-2 hover:border-primary focus:border-primary",
                     ],
                   }}
                 />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  label="Başlıq (AZ)"
                  variant="bordered"
                  startContent={<MdTitle className="text-gray-400" />}
                  isDisabled={isSubmitting}
                  {...register("title.az", {
                    required: "Başlıq tələb olunur",
                    onChange: (e: any) =>
                      handleTitleChange("az", e.target.value),
                  })}
                  isInvalid={!!errors.title?.az}
                  errorMessage={errors.title?.az?.message}
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: [
                      "bg-white border-2 hover:border-primary focus:border-primary",
                    ],
                  }}
                />

                <Input
                  type="text"
                  label="Slug (AZ)"
                  variant="bordered"
                  startContent={<MdLink className="text-gray-400" />}
                  isDisabled={true}
                  {...register("slug.az")}
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: ["bg-white border-2"],
                  }}
                />
              </div>

              <div className="space-y-2">
                <Input
                  type="text"
                  label="Heading (EN)"
                  variant="bordered"
                  startContent={<MdTitle className="text-gray-400" />}
                  isDisabled={isSubmitting}
                  {...register("title.en", {
                    required: "Title is required",
                    onChange: (e: any) =>
                      handleTitleChange("en", e.target.value),
                  })}
                  isInvalid={!!errors.title?.en}
                  errorMessage={errors.title?.en?.message}
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: [
                      "bg-white border-2 hover:border-primary focus:border-primary",
                    ],
                  }}
                />

                <Input
                  type="text"
                  label="Slug (EN)"
                  variant="bordered"
                  startContent={<MdLink className="text-gray-400" />}
                  isDisabled={true}
                  {...register("slug.en")}
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: ["bg-white border-2"],
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MdDescription className="text-gray-400" />
                  Təsvir (AZ)
                </label>
                <div className="h-64">
                  <ReactQuill
                    theme="snow"
                    value={descriptionAz}
                    onChange={(value) => handleDescriptionChange("az", value)}
                    modules={modules}
                    formats={formats}
                    className="h-48 bg-white"
                    readOnly={isSubmitting}
                  />
                </div>
                {errors.description?.az && (
                  <p className="text-danger text-sm">
                    {errors.description.az.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MdDescription className="text-gray-400" />
                  Description (EN)
                </label>
                <div className="h-64">
                  <ReactQuill
                    theme="snow"
                    value={descriptionEn}
                    onChange={(value) => handleDescriptionChange("en", value)}
                    modules={modules}
                    formats={formats}
                    className="h-48 bg-white"
                    readOnly={isSubmitting}
                  />
                </div>
                {errors.description?.en && (
                  <p className="text-danger text-sm">
                    {errors.description.en.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                step="any"
                label="Müddət (ay)"
                variant="bordered"
                startContent={<MdAccessTime className="text-gray-400" />}
                placeholder="məs: 12 və ya 1.5"
                isDisabled={isSubmitting}
                {...register("duration", {
                  required: "Müddət tələb olunur",
                  valueAsNumber: true,
                  validate: (value: number) => {
                    if (isNaN(value) || value <= 0) {
                      return "Müddət müsbət rəqəm olmalıdır";
                    }
                    return true;
                  },
                })}
                isInvalid={!!errors.duration}
                errorMessage={errors.duration?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-primary focus:border-primary",
                  ],
                }}
              />

              <Input
                type="text"
                label="Yaş Aralığı"
                variant="bordered"
                startContent={<MdPeople className="text-gray-400" />}
                placeholder="məs: 9-15"
                isDisabled={isSubmitting}
                {...register("ageRange")}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-primary focus:border-primary",
                  ],
                }}
              />
            </div>

            {/* <div className="space-y-4">
              <div className="space-y-2">
                <Select
                  label="Səviyyə (AZ)"
                  variant="bordered"
                  startContent={
                    <MdSignalCellular4Bar className="text-gray-400" />
                  }
                  isDisabled={isSubmitting}
                  defaultSelectedKeys={[watch("level.az") || "Başlanğıc"]}
                  {...register("level.az", {
                    required: "Səviyyə tələb olunur",
                  })}
                  isInvalid={!!errors.level?.az}
                  errorMessage={errors.level?.az?.message}
                  classNames={{
                    trigger:
                      "bg-white border-2 hover:border-primary focus:border-primary",
                    value: "bg-transparent",
                  }}
                >
                  {levels.map((level) => (
                    <SelectItem key={level.value.az} value={level.value.az}>
                      {level.value.az}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Select
                  label="Level (EN)"
                  variant="bordered"
                  startContent={
                    <MdSignalCellular4Bar className="text-gray-400" />
                  }
                  isDisabled={isSubmitting}
                  defaultSelectedKeys={[watch("level.en") || "Beginner"]}
                  {...register("level.en", {
                    required: "Level required",
                  })}
                  isInvalid={!!errors.level?.en}
                  errorMessage={errors.level?.en?.message}
                  classNames={{
                    trigger:
                      "bg-white border-2 hover:border-primary focus:border-primary",
                    value: "bg-transparent",
                  }}
                >
                  {levels.map((level) => (
                    <SelectItem key={level.value.en} value={level.value.en}>
                      {level.value.en}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Dərs sayı (həftəlik)"
                variant="bordered"
                startContent={<MdAccessTime className="text-gray-400" />}
                placeholder="məs: 3"
                isDisabled={isSubmitting}
                {...register("lessonPerWeek", {
                  required: "say tələb olunur",
                  valueAsNumber: true,
                  validate: (value: number) => {
                    if (isNaN(value) || value <= 0) {
                      return "say müsbət rəqəm olmalıdır";
                    }
                    return true;
                  },
                })}
                isInvalid={!!errors.lessonPerWeek}
                errorMessage={errors.lessonPerWeek?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-primary focus:border-primary",
                  ],
                }}
              />

              <Input
                type="number"
                label="Sıralama (kiçik = öndə)"
                variant="bordered"
                startContent={<MdAccessTime className="text-gray-400" />}
                placeholder="məs: 0"
                isDisabled={isSubmitting}
                {...register("order", {
                  valueAsNumber: true,
                })}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-primary focus:border-primary",
                  ],
                }}
              />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                label="İkon"
                variant="bordered"
                startContent={<MdStar className="text-gray-400" />}
                isDisabled={isSubmitting}
                {...register("icon", {
                  required: "İkon tələb olunur",
                })}
                isInvalid={!!errors.icon}
                errorMessage={errors.icon?.message}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: [
                    "bg-white border-2 hover:border-primary focus:border-primary",
                  ],
                }}
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium flex items-center gap-2">
                <MdTag className="text-gray-400" />
                Teqlər
              </label>
              <BilingualTagInput
                tags={tagPairs}
                onChange={handleTagsChange}
                isDisabled={isSubmitting}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-small font-medium">Status</span>
                <span className="text-tiny text-default-400">
                  Kurs{" "}
                  {isPublished ? "dərc ediləcək" : "qaralama kimi saxlanılacaq"}
                </span>
              </div>
              <Switch
                isSelected={isPublished}
                size="lg"
                color="warning"
                onValueChange={(val) => setValue("published", val, { shouldDirty: true })}
              >
                {isPublished ? "Dərc edilib" : "Qaralama"}
              </Switch>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => router.back()}
                variant="light"
                className="text-gray-600"
                size="lg"
              >
                Ləğv et
              </Button>
              <Button
                type="submit"
                className="bg-jsyellow text-white hover:bg-jsyellow/90 disabled:opacity-50"
                size="lg"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {mode === "create"
                  ? isSubmitting
                    ? "Yaradılır..."
                    : "Yarat"
                  : isSubmitting
                  ? "Yenilənir..."
                  : "Yenilə"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
