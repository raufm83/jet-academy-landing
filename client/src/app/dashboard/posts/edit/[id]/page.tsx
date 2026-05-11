"use client";
import { useEffect, useState, useRef } from "react";
import PostForm from "@/components/views/dashboard/post/post-form";
import { PostType, Role } from "@/types/enums";
import { Post, PostFormInputs } from "@/types/post";
import { POST_IMAGE_MAX_FILE_BYTES } from "@/data/post-image-spec";
import api from "@/utils/api/axios";
import { getAxiosErrorMessage } from "@/utils/api/error-message";
import { getPostTagFormValues } from "@/utils/helpers/post";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { slugifyText } from "@/utils/slugify";

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const fileInputRefAz = useRef<HTMLInputElement>(null);
  const fileInputRefEn = useRef<HTMLInputElement>(null);
  const [previewUrlAz, setPreviewUrlAz] = useState<string | null>(null);
  const [previewUrlEn, setPreviewUrlEn] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
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
    },
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<Post>(`/posts/${params.id}`);

        const imageUrl = data.imageUrl
          ? typeof data.imageUrl === "string"
            ? { az: data.imageUrl, en: data.imageUrl }
            : { az: data.imageUrl?.az ?? "", en: data.imageUrl?.en ?? "" }
          : { az: "", en: "" };

        reset({
          title: data.title,
          content: data.content,
          slug: data.slug,
          imageUrl: typeof data.imageUrl === "object" ? undefined : data.imageUrl || "",
          imageAlt: {
            az: data.imageAlt?.az || "",
            en: data.imageAlt?.en || "",
          },
          tags: getPostTagFormValues(data.tags),
          postType: data.postType,
          published: data.published,
          eventDate: data.eventDate
            ? typeof data.eventDate === "string"
              ? data.eventDate
              : new Date(data.eventDate).toISOString()
            : undefined,
          eventStatus: data.eventStatus,
          offerStartDate: data.offerStartDate
            ? typeof data.offerStartDate === "string"
              ? data.offerStartDate
              : new Date(data.offerStartDate).toISOString()
            : undefined,
          offerEndDate: data.offerEndDate
            ? typeof data.offerEndDate === "string"
              ? data.offerEndDate
              : new Date(data.offerEndDate).toISOString()
            : undefined,
        });

        const base = (process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/?$/, "").replace(/\/+$/, "");
        if (imageUrl.az) setPreviewUrlAz(base ? `${base}/${imageUrl.az.replace(/^\//, "")}` : imageUrl.az);
        if (imageUrl.en) setPreviewUrlEn(base ? `${base}/${imageUrl.en.replace(/^\//, "")}` : imageUrl.en);
      } catch (error) {
        console.error("Post yüklənmədi:", error);
        toast.error("Post yüklənə bilmədi");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id, reset]);

  const handleFileChangeAz = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > POST_IMAGE_MAX_FILE_BYTES) {
        toast.error(`Şəklin ölçüsü ${POST_IMAGE_MAX_FILE_BYTES / (1024 * 1024)} MB-dan böyük ola bilməz`);
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
        toast.error(`Şəklin ölçüsü ${POST_IMAGE_MAX_FILE_BYTES / (1024 * 1024)} MB-dan böyük ola bilməz`);
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
      formData.append(
        "postType",
        (session?.user as any)?.role === Role.AUTHOR ? PostType.BLOG : data.postType
      );

      formData.append(
        "tags",
        JSON.stringify(data.tags ?? { az: [], en: [] })
      );

      if (data.postType === PostType.EVENT) {
        if (data.eventDate) formData.append("eventDate", typeof data.eventDate === "string" ? data.eventDate : new Date(data.eventDate).toISOString());
        if (data.eventStatus) formData.append("eventStatus", data.eventStatus);
      }

      if (data.postType === PostType.OFFERS) {
        if (data.offerStartDate) formData.append("offerStartDate", typeof data.offerStartDate === "string" ? data.offerStartDate : new Date(data.offerStartDate).toISOString());
        if (data.offerEndDate) formData.append("offerEndDate", typeof data.offerEndDate === "string" ? data.offerEndDate : new Date(data.offerEndDate).toISOString());
      }

      const imageAz =
        data.imageAz instanceof File ? data.imageAz : data.imageAz?.[0];
      const imageEn =
        data.imageEn instanceof File ? data.imageEn : data.imageEn?.[0];
      if (imageAz) formData.append("imageAz", imageAz);
      if (imageEn) formData.append("imageEn", imageEn);
      if (!imageAz && !imageEn && data.image) {
        const imageFile =
          data.image instanceof File ? data.image : data.image?.[0];
        if (imageFile) formData.append("image", imageFile);
      }

      const response = await api.patch(`/posts/${params.id}`, formData);

      if (response.status === 200) {
        toast.success("Post uğurla yeniləndi");
        router.push("/dashboard/posts");
        router.refresh();
      }
    } catch (error: unknown) {
      console.error("Yeniləmə xətası:", error);
      const msg = getAxiosErrorMessage(error);
      setError("root", { type: "server", message: msg });
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse">Yüklənir...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-2xl font-bold">Post tapılmadı</h1>
        <button
          className="mt-4 px-4 py-2 bg-jsyellow text-white rounded-md"
          onClick={() => router.push("/dashboard/posts")}
        >
          Geri qayıt
        </button>
      </div>
    );
  }

  return (
    <PostForm
      mode="edit"
      onSubmit={onSubmit}
      register={register}
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
      control={control}
      isAuthor={(session?.user as any)?.role === Role.AUTHOR}
    />
  );
}
