"use client";
import PostForm from "@/components/views/dashboard/post/post-form";
import { EventStatus, PostType, Role } from "@/types/enums";
import { PostFormInputs } from "@/types/post";
import { POST_IMAGE_MAX_FILE_BYTES } from "@/data/post-image-spec";
import api from "@/utils/api/axios";
import { getAxiosErrorMessage } from "@/utils/api/error-message";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { slugifyText } from "@/utils/slugify";

export default function CreatePostPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthor = (session?.user as any)?.role === Role.AUTHOR;
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PostFormInputs>({
    defaultValues: {
      title: { az: "", en: "" },
      content: { az: "", en: "" },
      slug: { az: "", en: "" },
      imageUrl: "",
      imageAlt: { az: "", en: "" },
      tags: { az: [], en: [] },
      postType: PostType.BLOG,
      published: false,
      eventDate: undefined,
      eventStatus: undefined,
      offerStartDate: undefined,
      offerEndDate: undefined,
      blogCategoryId: "",
    },
  });

  const fileInputRefAz = useRef<HTMLInputElement>(null);
  const fileInputRefEn = useRef<HTMLInputElement>(null);
  const [previewUrlAz, setPreviewUrlAz] = useState<string | null>(null);
  const [previewUrlEn, setPreviewUrlEn] = useState<string | null>(null);

  const handleFileChangeAz = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > POST_IMAGE_MAX_FILE_BYTES) {
        toast.error(
          `Şəklin ölçüsü ${POST_IMAGE_MAX_FILE_BYTES / (1024 * 1024)} MB-dan böyük ola bilməz`
        );
        event.target.value = "";
        return;
      }
      setValue("imageAz", file);
      setPreviewUrlAz(URL.createObjectURL(file));
    }
  };
  const handleFileChangeEn = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > POST_IMAGE_MAX_FILE_BYTES) {
        toast.error(
          `Şəklin ölçüsü ${POST_IMAGE_MAX_FILE_BYTES / (1024 * 1024)} MB-dan böyük ola bilməz`
        );
        event.target.value = "";
        return;
      }
      setValue("imageEn", file);
      setPreviewUrlEn(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: PostFormInputs) => {
    clearErrors("root");
    try {
      const formData = new FormData();

      formData.append("title[az]", data.title.az);
      formData.append("title[en]", data.title.en ?? "");
      formData.append("content[az]", data.content.az);
      formData.append("content[en]", data.content.en ?? "");
      formData.append("slug[az]", slugifyText(data.slug.az || ""));
      formData.append(
        "slug[en]",
        slugifyText((data.slug.en ?? data.slug.az ?? "").trim())
      );
      formData.append("imageAlt[az]", data.imageAlt?.az || "");
      formData.append("imageAlt[en]", data.imageAlt?.en || "");

      formData.append("published", String(data.published));
      formData.append("postType", isAuthor ? PostType.BLOG : data.postType);

      formData.append(
        "tags",
        JSON.stringify(data.tags ?? { az: [], en: [] })
      );

      const effectivePostType = isAuthor ? PostType.BLOG : data.postType;
      if (effectivePostType === PostType.BLOG && data.blogCategoryId?.trim()) {
        formData.append(
          "blogCategoryId",
          data.blogCategoryId.trim()
        );
      }

      if (data.postType === PostType.EVENT) {
        if (data.eventDate) formData.append("eventDate", data.eventDate);
        formData.append("eventStatus", data.eventStatus || EventStatus.UPCOMING);
      }

      if (data.postType === PostType.OFFERS) {
        if (data.offerStartDate) formData.append("offerStartDate", data.offerStartDate);
        if (data.offerEndDate) formData.append("offerEndDate", data.offerEndDate);
      }

      const imageAz =
        data.imageAz instanceof File ? data.imageAz : data.imageAz?.[0];
      const imageEn =
        data.imageEn instanceof File ? data.imageEn : data.imageEn?.[0];
      if (imageAz) formData.append("imageAz", imageAz);
      if (imageEn) formData.append("imageEn", imageEn);
      if (!imageAz && !imageEn && data.image) {
        const imageFile =
          data.image instanceof File
            ? data.image
            : data.image[0] instanceof File
              ? data.image[0]
              : null;
        if (imageFile) formData.append("image", imageFile);
      }
      if (data.imageUrl && typeof data.imageUrl === "string" && data.imageUrl.trim() !== "") {
        formData.append("imageUrl", data.imageUrl);
      }

      const response = await api.post("/posts", formData);

      if (response.status === 201) {
        toast.success("Post uğurla yaradıldı");
        router.push("/dashboard/posts");
        router.refresh();
      }
    } catch (error: unknown) {
      console.error("Yaratma xətası:", error);
      const msg = getAxiosErrorMessage(error);
      setError("root", { type: "server", message: msg });
      toast.error(msg);
    }
  };

  return (
    <PostForm
      mode="create"
      onSubmit={onSubmit}
      register={register}
      control={control}
      errors={errors}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      router={router}
      watch={watch}
      setValue={setValue}
      fileInputRefAz={fileInputRefAz}
      fileInputRefEn={fileInputRefEn}
      handleFileChangeAz={handleFileChangeAz}
      handleFileChangeEn={handleFileChangeEn}
      previewUrlAz={previewUrlAz}
      previewUrlEn={previewUrlEn}
      isAuthor={isAuthor}
    />
  );
}
