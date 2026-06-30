"use client";
import CourseForm from "@/components/views/dashboard/courses/course-form";
import { CourseFormInputs } from "@/types/course";
import api from "@/utils/api/axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CreateCoursePage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormInputs>({
    defaultValues: {
      title: { az: "", en: "" },
      description: { az: "", en: "" },
      slug: { az: "", en: "" },
      level: { az: "Başlanğıc", en: "Начинающий" },
      duration: 0,
      published: false,
      ageRange: "",
      icon: "FaStar",
      lessonPerWeek: 3,
      order: 0,
      newTags: { az: [], en: [] },
    },
  });

  const onSubmit = async (data: CourseFormInputs) => {
    try {
      const formData = new FormData();

      formData.append("title[az]", data.title.az);
      formData.append("title[en]", data.title.en);
      formData.append("description[az]", data.description.az);
      formData.append("description[en]", data.description.en);
      formData.append("slug[az]", data.slug.az);
      formData.append("slug[en]", data.slug.en);
      formData.append("level[az]", data.level.az);
      formData.append("level[en]", data.level.en);
      formData.append("lessonPerWeek", Number(data.lessonPerWeek).toString());

      if (data.newTags?.az && data.newTags.az.length > 0) {
        data.newTags.az.forEach((tag, index) => {
          formData.append(`newTags[az][${index}]`, tag);
        });
      }
      if (data.newTags?.en && data.newTags.en.length > 0) {
        data.newTags.en.forEach((tag, index) => {
          formData.append(`newTags[en][${index}]`, tag);
        });
      }

      formData.append("duration", Number(data.duration).toString());
      formData.append("published", data.published.toString());
      formData.append("icon", data.icon || "FaStar");
      
      if (data.ageRange) {
        formData.append("ageRange", data.ageRange);
      }

      if (typeof data.order === "number" && !Number.isNaN(data.order)) {
        formData.append("order", String(data.order));
      }
      
      if (typeof data.totalHours === "number" && !Number.isNaN(data.totalHours)) {
        formData.append("totalHours", String(data.totalHours));
      }

      if (typeof data.durationMonths === "number" && !Number.isNaN(data.durationMonths)) {
        formData.append("durationMonths", String(data.durationMonths));
      }

      if (data.backgroundColor) formData.append("backgroundColor", data.backgroundColor);
      if (data.borderColor) formData.append("borderColor", data.borderColor);
      if (data.textColor) formData.append("textColor", data.textColor);

      if (data.shortDescription?.az) formData.append("shortDescription[az]", data.shortDescription.az);
      if (data.shortDescription?.en) formData.append("shortDescription[en]", data.shortDescription.en);

      if (data.imageAlt?.az) formData.append("imageAlt[az]", data.imageAlt.az);
      if (data.imageAlt?.en) formData.append("imageAlt[en]", data.imageAlt.en);

      if (data.metaTitle?.az) formData.append("metaTitle[az]", data.metaTitle.az);
      if (data.metaTitle?.en) formData.append("metaTitle[en]", data.metaTitle.en);
      if (data.metaDescription?.az) formData.append("metaDescription[az]", data.metaDescription.az);
      if (data.metaDescription?.en) formData.append("metaDescription[en]", data.metaDescription.en);
      if (data.metaKeywords?.az) formData.append("metaKeywords[az]", data.metaKeywords.az);
      if (data.metaKeywords?.en) formData.append("metaKeywords[en]", data.metaKeywords.en);


if (data.image) {
  const imageFile = data.image instanceof FileList ? data.image[0] : data.image;
  if (imageFile) {
    formData.append("image", imageFile);
  }
}

      const response = await api.post("/courses", formData);

      if (response.status === 201) {
        toast.success("Kurs uğurla yaradıldı");
        router.push("/dashboard/courses");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Yaratma xətası:", error);
      toast.error(
        error.response?.data?.message || "Xəta baş verdi. Yenidən cəhd edin"
      );
    }
  };

  return (
    <CourseForm
      mode="create"
      onSubmit={onSubmit}
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      router={router}
      watch={watch}
      setValue={setValue}
    />
  );
}