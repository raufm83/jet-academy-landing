"use client";
import {
  POST_CARD_IMAGE_ASPECT,
  POST_CARD_IMAGE_RECOMMENDED_PX,
  POST_COVER_IMAGE_ASPECT,
  POST_COVER_IMAGE_RECOMMENDED_PX,
  POST_IMAGE_ALLOWED_EXTENSIONS,
  POST_IMAGE_MAX_FILE_MB,
} from "@/data/post-image-spec";
import { EventStatus, PostType } from "@/types/enums";
import { slugifyText } from "@/utils/slugify";
import {
  Button,
  Card,
  DatePicker,
  Input,
  Select,
  SelectItem,
  Switch,
} from "@nextui-org/react";
import { parseAbsoluteToLocal } from "@internationalized/date";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uploadContentImage } from "@/utils/api/post";
import api from "@/utils/api/axios";
import {
  getContentImageAbsoluteUrl,
  getPostTagFormValues,
} from "@/utils/helpers/post";
import {
  MdAccessTime,
  MdCalendarMonth,
  MdCategory,
  MdDescription,
  MdLink,
  MdTag,
  MdTitle,
} from "react-icons/md";
import BilingualTagInput, {
  TagPair,
  toPairs,
  fromPairs,
} from "@/components/views/dashboard/shared/bilingual-tag-input";
import { toast } from "sonner";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const TOOLBAR_CONTAINERS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ color: [] }, { background: [] }],
  ["link", "image"],
  ["clean"],
];

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
  "image",
];



const formatISOForInput = (isoString: any) => {
  if (!isoString) return "";

  return isoString.replace("Z", "").replace(/(\+|-)\d\d:\d\d$/, "");
};

export default function PostForm({
  mode,
  onSubmit,
  register,
  errors,
  isSubmitting,
  handleSubmit,
  router,
  watch,
  setValue,
  fileInputRefAz,
  fileInputRefEn,
  handleFileChangeAz,
  handleFileChangeEn,
  previewUrlAz,
  previewUrlEn,
  isAuthor = false,
}: any) {
  const autoSlugRef = useRef<{ az: string; en: string }>({ az: "", en: "" });
  const [contentAz, setContentAz] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [tagPairs, setTagPairs] = useState<TagPair[]>([]);
  const [blogCategories, setBlogCategories] = useState<
    Array<{ id: string; name: { az: string; en: string } }>
  >([]);

  // Wrapper div refs — used to locate the .ql-container in the DOM via querySelector,
  // which lets us call Quill.find() without relying on next/dynamic ref forwarding.
  const quillWrapperAzRef = useRef<HTMLDivElement>(null);
  const quillWrapperEnRef = useRef<HTMLDivElement>(null);
  // Stores the real Quill editor instance once it is discovered.
  const quillEditorAz = useRef<any>(null);
  const quillEditorEn = useRef<any>(null);
  const contentImageInputAzRef = useRef<HTMLInputElement>(null);
  const contentImageInputEnRef = useRef<HTMLInputElement>(null);

  // In Quill v1, toolbar handlers are invoked with `this` bound to the Quill
  // editor instance (handler.call(this.quill, value) in Quill's toolbar source).
  // We exploit this to capture the instance the moment the user clicks the
  // image button — before the file dialog opens — so insertContentImage always
  // has a valid quill reference regardless of next/dynamic ref forwarding.
  const modulesAz = useMemo(
    () => ({
      toolbar: {
        container: TOOLBAR_CONTAINERS,
        handlers: {
          image: function (this: any) {
            if (this && typeof this.insertEmbed === "function") {
              quillEditorAz.current = this;
            }
            contentImageInputAzRef.current?.click();
          },
        },
      },
    }),
    []
  );

  const modulesEn = useMemo(
    () => ({
      toolbar: {
        container: TOOLBAR_CONTAINERS,
        handlers: {
          image: function (this: any) {
            if (this && typeof this.insertEmbed === "function") {
              quillEditorEn.current = this;
            }
            contentImageInputEnRef.current?.click();
          },
        },
      },
    }),
    []
  );

  const postType = watch("postType", PostType.BLOG);
  const isOffer = !isAuthor && postType === PostType.OFFERS;
  const isPublished = watch("published", false);

  const blogCatSelectItems = useMemo(
    () => [
      { id: "__none__", title: "Kateqoriya seçilməyib" },
      ...blogCategories.map((c) => ({
        id: c.id,
        title: c.name?.az || c.name?.en || c.id,
      })),
    ],
    [blogCategories]
  );

  useEffect(() => {
    let cancel = false;
    api
      .get<Array<{ id: string; name: { az: string; en: string } }>>(
        "/blog-categories"
      )
      .then(({ data }) => {
        if (!cancel && Array.isArray(data)) setBlogCategories(data);
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);

  const insertContentImage = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, lang: "az" | "en") => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !file.type.startsWith("image/")) return;

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Şəklin ölçüsü 2MB-dan böyük ola bilməz");
        return;
      }

      // The toolbar handler always sets quillEditorXx.current before the file
      // dialog opens, so by the time onChange fires we already have the instance.
      const quill = lang === "az" ? quillEditorAz.current : quillEditorEn.current;

      if (!quill || typeof quill.insertEmbed !== "function") {
        toast.error("Şəkil yükləmək üçün əvvəlcə toolbar-dakı şəkil düyməsinə klikləyin.");
        return;
      }

      const url = await uploadContentImage(file);
      if (!url || url.startsWith("blob:") || url.startsWith("data:")) {
        toast.error("Şəkil yüklənə bilmədi");
        return;
      }
      const displayUrl = getContentImageAbsoluteUrl(url) || url;
      const range = quill.getSelection(true);
      const index = range != null ? range.index : (quill.getLength?.() ?? 0);
      quill.insertEmbed(index, "image", displayUrl);
      quill.setSelection(index + 1);
    },
    []
  );

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const cleanupFns: Array<() => void> = [];

    // Build paste/drop handlers that run before Quill's own handlers (capture
    // phase on .ql-container) so Quill never gets to insert a base64 data-URI.
    const buildHandlers = (quill: any) => {
      const container = quill.root.parentElement ?? quill.root;

      const pasteHandler = (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        const file = items
          ? Array.from(items).find((i) => i.type.startsWith("image/"))?.getAsFile()
          : null;
        if (!file) return;
        e.preventDefault();
        e.stopPropagation();
        if (file.size > 2 * 1024 * 1024) {
          toast.error("Şəklin ölçüsü 2MB-dan böyük ola bilməz");
          return;
        }
        uploadContentImage(file).then((url) => {
          if (!url || url.startsWith("blob:") || url.startsWith("data:")) {
            toast.error("Şəkil yüklənə bilmədi");
            return;
          }
          const displayUrl = getContentImageAbsoluteUrl(url) || url;
          const r = quill.getSelection(true) ?? { index: quill.getLength(), length: 0 };
          quill.insertEmbed(r.index, "image", displayUrl);
          quill.setSelection(r.index + 1);
        });
      };

      const dropHandler = (e: DragEvent) => {
        const files = e.dataTransfer?.files;
        if (!files || files.length === 0) return;
        const file = Array.from(files).find((f) => f.type.startsWith("image/"));
        if (!file) return;
        e.preventDefault();
        e.stopPropagation();
        if (file.size > 2 * 1024 * 1024) {
          toast.error("Şəklin ölçüsü 2MB-dan böyük ola bilməz");
          return;
        }
        const index = quill.getLength();
        uploadContentImage(file).then((url) => {
          if (!url || url.startsWith("blob:") || url.startsWith("data:")) {
            toast.error("Şəkil yüklənə bilmədi");
            return;
          }
          const displayUrl = getContentImageAbsoluteUrl(url) || url;
          quill.insertEmbed(index, "image", displayUrl);
          quill.setSelection(index + 1);
        });
      };

      const dragOverHandler = (e: DragEvent) => {
        if (e.dataTransfer?.types.includes("Files")) e.preventDefault();
      };

      container.addEventListener("paste", pasteHandler, { capture: true });
      container.addEventListener("drop", dropHandler, { capture: true });
      quill.root.addEventListener("dragover", dragOverHandler);

      return () => {
        container.removeEventListener("paste", pasteHandler, true);
        container.removeEventListener("drop", dropHandler, true);
        quill.root.removeEventListener("dragover", dragOverHandler);
      };
    };

    // Use Quill.find(containerElement) — the official Quill v1 static method that
    // looks up the Quill instance by DOM node from Quill's internal WeakMap.
    // This works regardless of whether next/dynamic forwards the React ref.
    const tryFindAndAttach = (
      QuillLib: any,
      wrapperRef: React.RefObject<HTMLDivElement>,
      editorRef: React.MutableRefObject<any>,
    ): boolean => {
      if (!wrapperRef.current) return false;
      const qlContainer = wrapperRef.current.querySelector(".ql-container");
      if (!qlContainer) return false;
      const quill = typeof QuillLib?.find === "function" ? QuillLib.find(qlContainer) : null;
      if (!quill?.root) return false;
      editorRef.current = quill;
      const cleanup = buildHandlers(quill);
      cleanupFns.push(cleanup);
      return true;
    };

    // Dynamically import quill (already bundled by react-quill; the module is
    // shared, so Quill.find() sees the same WeakMap react-quill writes to).
    import("quill")
      .then(({ default: QuillLib }) => {
        if (!mounted) return;

        let doneAz = false;
        let doneEn = false;

        const tryAttach = () => {
          if (!mounted) return;
          if (!doneAz) doneAz = tryFindAndAttach(QuillLib, quillWrapperAzRef, quillEditorAz);
          if (!doneEn) doneEn = tryFindAndAttach(QuillLib, quillWrapperEnRef, quillEditorEn);
          if (doneAz && doneEn && intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
          }
        };

        tryAttach();
        if (!doneAz || !doneEn) {
          intervalId = setInterval(tryAttach, 200);
        }
      })
      .catch(() => {
        // Quill.find() unavailable — paste/drop fallback via base64 suppression
        // is handled by attaching directly once quillEditorXx is set by the
        // toolbar handler.
      });

    return () => {
      mounted = false;
      if (intervalId !== null) clearInterval(intervalId);
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  useEffect(() => {
    if (mode === "edit") {
      const watchedContentAz = watch("content.az");
      const watchedContentEn = watch("content.en");
      const watchedTags = watch("tags");
      const watchedEventDate = watch("eventDate");
      const watchedOfferStartDate = watch("offerStartDate");
      const watchedOfferEndDate = watch("offerEndDate");
      const watchedSlugAz = watch("slug.az");
      const watchedSlugEn = watch("slug.en");

      if (watchedContentAz) setContentAz(watchedContentAz);
      if (watchedContentEn) setContentEn(watchedContentEn);
      if (watchedTags) setTagPairs(toPairs(getPostTagFormValues(watchedTags)));

      // Keep full ISO string for Event Date to work with parseAbsoluteToLocal
      if (watchedEventDate) {
        setValue("eventDate", watchedEventDate); 
      }

      if (watchedOfferStartDate) {
        setValue("offerStartDate", formatISOForInput(watchedOfferStartDate));
      }

      if (watchedOfferEndDate) {
        setValue("offerEndDate", formatISOForInput(watchedOfferEndDate));
      }

      if (!watchedSlugAz && watch("title.az")) {
        setValue("slug.az", slugifyText(watch("title.az")));
      }

      if (!watchedSlugEn && watch("title.en")) {
        setValue("slug.en", slugifyText(watch("title.en")));
      }
    }
  }, [mode, watch, setValue]);

  useEffect(() => {
    autoSlugRef.current = {
      az: slugifyText(watch("title.az") || ""),
      en: slugifyText(watch("title.en") || ""),
    };
  }, [watch, mode]);

  const handleTitleChange = (lang: "az" | "en", value: string) => {
    const slugValue = slugifyText(value);
    const currentSlug = (watch(`slug.${lang}`) || "").trim();

    if (!currentSlug || currentSlug === autoSlugRef.current[lang]) {
      setValue(`slug.${lang}`, slugValue, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    autoSlugRef.current[lang as "az" | "en"] = slugValue;
  };

  const handleSlugChange = (lang: "az" | "en", value: string) => {
    setValue(`slug.${lang}`, slugifyText(value), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleContentChange = (lang: string, value: string) => {
    setValue(`content.${lang}`, value);
    if (lang === "az") {
      setContentAz(value);
    } else {
      setContentEn(value);
    }

    const currentSlug = watch(`slug.${lang}`);
    if (!currentSlug) {
      const title = watch(`title.${lang}`);
      if (title) {
        setValue(`slug.${lang}`, slugifyText(title));
      }
    }
  };

  const handleTagsChange = (pairs: TagPair[]) => {
    setTagPairs(pairs);
    setValue("tags", fromPairs(pairs));
  };

  const onFormSubmit = (data: any) => {
    const ensureValidISO = (dateVal: string) => {
      if (!dateVal) return undefined;
      try {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
          return d.toISOString(); 
        }
      } catch (e) {
         console.error("ISO conversion error", e);
      }
      return undefined;
    };

    const newData = {
      ...data,
      ...(data.eventDate && { eventDate: ensureValidISO(data.eventDate) }),
      ...(data.offerStartDate && { offerStartDate: ensureValidISO(data.offerStartDate) }),
      ...(data.offerEndDate && { offerEndDate: ensureValidISO(data.offerEndDate) }),
    };
    
    onSubmit(newData);
  };

  return (
    <div className="p-6 min-h-screen w-full flex items-center justify-center">
      <div className="w-full">
        <Card className="w-full max-w-4xl p-6 bg-white shadow-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black">
              {mode === "create" ? "Yeni Post Yarat" : "Posta Düzəliş Et"}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
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
                  isDisabled={isSubmitting}
                  {...register("slug.az", {
                    onChange: (e: any) => handleSlugChange("az", e.target.value),
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
                  label="Title (EN)"
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
                  isDisabled={isSubmitting}
                  {...register("slug.en", {
                    onChange: (e: any) => handleSlugChange("en", e.target.value),
                  })}
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
                <label className="text-sm font-medium flex items-center gap-2">
                  <MdDescription className="text-gray-400" />
                  Məzmun (AZ)
                </label>
                <input
                  id="content-image-az"
                  type="file"
                  accept="image/*"
                  ref={contentImageInputAzRef}
                  onChange={(e) => insertContentImage(e, "az")}
                  className="absolute opacity-0 w-0 h-0 overflow-hidden pointer-events-none"
                  aria-hidden
                  tabIndex={-1}
                />
                <div className="h-64" ref={quillWrapperAzRef}>
                  <ReactQuill
                    theme="snow"
                    value={contentAz}
                    onChange={(value) => handleContentChange("az", value)}
                    modules={modulesAz}
                    formats={formats}
                    className="h-48 bg-white"
                    readOnly={isSubmitting}
                  />
                </div>
                {errors.content?.az && (
                  <p className="text-danger text-sm">
                    {errors.content.az.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MdDescription className="text-gray-400" />
                  Content (EN)
                </label>
                <input
                  id="content-image-en"
                  type="file"
                  accept="image/*"
                  ref={contentImageInputEnRef}
                  onChange={(e) => insertContentImage(e, "en")}
                  className="absolute opacity-0 w-0 h-0 overflow-hidden pointer-events-none"
                  aria-hidden
                  tabIndex={-1}
                />
                <div className="h-64" ref={quillWrapperEnRef}>
                  <ReactQuill
                    theme="snow"
                    value={contentEn}
                    onChange={(value) => handleContentChange("en", value)}
                    modules={modulesEn}
                    formats={formats}
                    className="h-48 bg-white"
                    readOnly={isSubmitting}
                  />
                </div>
                {errors.content?.en && (
                  <p className="text-danger text-sm">
                    {errors.content.en.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Şəkillər (AZ / EN)</p>
              <p className="text-tiny text-default-500 leading-relaxed">
                Tövsiyə ölçü: kart {POST_CARD_IMAGE_RECOMMENDED_PX.width}×
                {POST_CARD_IMAGE_RECOMMENDED_PX.height} px ({POST_CARD_IMAGE_ASPECT}), məqalə üz şəkli{" "}
                {POST_COVER_IMAGE_RECOMMENDED_PX.width}×{POST_COVER_IMAGE_RECOMMENDED_PX.height} px (
                {POST_COVER_IMAGE_ASPECT}). Fayl ən çox {POST_IMAGE_MAX_FILE_MB} MB; format:{" "}
                {POST_IMAGE_ALLOWED_EXTENSIONS}. Server şəkli kəsmədən saxlayır (WebP).
              </p>
              {errors.root?.message && (
                <p className="text-sm text-danger font-medium" role="alert">
                  {String(errors.root.message)}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-default-500">Şəkil (AZ)</label>
                  <input
                    type="file"
                    name="imageAz"
                    accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
                    ref={fileInputRefAz}
                    onChange={handleFileChangeAz}
                    disabled={isSubmitting}
                    className="block w-full text-sm text-default-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-default-200 file:text-sm file:font-medium file:bg-default-100 file:text-default-700 hover:file:bg-default-200 file:cursor-pointer cursor-pointer disabled:opacity-50"
                  />
                  <p className="text-tiny text-default-400">
                    Maks. {POST_IMAGE_MAX_FILE_MB} MB · {POST_IMAGE_ALLOWED_EXTENSIONS}
                  </p>
                  {previewUrlAz && (
                    <div className="relative w-full aspect-[4/3] mt-2 rounded-lg overflow-hidden border bg-default-100">
                      <Image
                        src={previewUrlAz}
                        alt="Preview AZ"
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-contain object-center"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-default-500">Image (EN)</label>
                  <input
                    type="file"
                    name="imageEn"
                    accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
                    ref={fileInputRefEn}
                    onChange={handleFileChangeEn}
                    disabled={isSubmitting}
                    className="block w-full text-sm text-default-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-default-200 file:text-sm file:font-medium file:bg-default-100 file:text-default-700 hover:file:bg-default-200 file:cursor-pointer cursor-pointer disabled:opacity-50"
                  />
                  <p className="text-tiny text-default-400">
                    Max {POST_IMAGE_MAX_FILE_MB} MB · {POST_IMAGE_ALLOWED_EXTENSIONS}
                  </p>
                  {previewUrlEn && (
                    <div className="relative w-full aspect-[4/3] mt-2 rounded-lg overflow-hidden border bg-default-100">
                      <Image
                        src={previewUrlEn}
                        alt="Preview EN"
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-contain object-center"
                      />
                    </div>
                  )}
                </div>
              </div>
              {(mode === "create" && !previewUrlAz && !previewUrlEn) && (
                <p className="text-tiny text-default-500">
                  Ən azı bir dil üçün şəkil seçin (AZ və ya EN)
                </p>
              )}
            </div>

            <div className="space-y-2">
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
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
              {isAuthor ? (
                <Input
                  label="Post Növü"
                  variant="bordered"
                  startContent={<MdCategory className="text-gray-400" />}
                  value="Bloq"
                  isReadOnly
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: [
                      "bg-white border-2 hover:border-primary focus:border-primary",
                    ],
                  }}
                />
              ) : (
                <Select
                  label="Post Növü"
                  variant="bordered"
                  startContent={<MdCategory className="text-gray-400" />}
                  isDisabled={isSubmitting}
                  defaultSelectedKeys={[watch("postType") || PostType.BLOG]}
                  {...register("postType")}
                  isInvalid={!!errors.postType}
                  errorMessage={errors.postType?.message}
                  classNames={{
                    trigger:
                      "bg-white border-2 hover:border-primary focus:border-primary",
                    value: "bg-transparent",
                  }}
                >
                  <SelectItem key={PostType.BLOG} value={PostType.BLOG}>
                    Bloq
                  </SelectItem>
                  <SelectItem key={PostType.NEWS} value={PostType.NEWS}>
                    Xəbər
                  </SelectItem>
                  <SelectItem key={PostType.EVENT} value={PostType.EVENT}>
                    Tədbir
                  </SelectItem>
                  <SelectItem key={PostType.OFFERS} value={PostType.OFFERS}>
                    Kampaniya
                  </SelectItem>
                </Select>
              )}
            </div>

            {(isAuthor || postType === PostType.BLOG) && (
              <div className="space-y-2">
                <Select
                  label="Bloq kateqoriyası"
                  variant="bordered"
                  items={blogCatSelectItems}
                  disallowEmptySelection
                  selectedKeys={
                    new Set([
                      watch("blogCategoryId")?.trim()
                        ? watch("blogCategoryId")!.trim()
                        : "__none__",
                    ])
                  }
                  onSelectionChange={(keys) => {
                    const keysArr = [...keys];
                    const k = typeof keysArr[0] === "string" ? keysArr[0] : "";
                    setValue(
                      "blogCategoryId",
                      !k || k === "__none__" ? "" : k,
                      { shouldDirty: true, shouldValidate: true }
                    );
                  }}
                  isDisabled={isSubmitting}
                  classNames={{
                    trigger:
                      "bg-white border-2 hover:border-primary focus:border-primary",
                    value: "bg-transparent",
                  }}
                  description="Vacib deyil — boş buraxılsa bloq ümumi siyahıda göstərilir."
                >
                  {(item) => (
                    <SelectItem key={item.id} textValue={item.title}>
                      {item.title}
                    </SelectItem>
                  )}
                </Select>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <DatePicker
                  label={isOffer ? "Deadline Tarixi" : "Tarix və Saat"}
                  variant="bordered"
                  startContent={<MdCalendarMonth className="text-gray-400" />}
                  isDisabled={isSubmitting}
                  granularity={isOffer ? "day" : "minute"}
                  hourCycle={24}
                  value={(() => {
                    // Kampaniya tipi üçün offerEndDate, digərləri üçün eventDate
                    const dateVal = isOffer ? watch("offerEndDate") : watch("eventDate");
                    if (!dateVal) return null;
                    try {
                      if (dateVal.length === 10) {
                        return parseAbsoluteToLocal(`${dateVal}T00:00:00Z`);
                      }
                      if (!dateVal.includes("Z") && !dateVal.includes("+")) {
                        return parseAbsoluteToLocal(`${dateVal}Z`);
                      }
                      return parseAbsoluteToLocal(dateVal);
                    } catch (e) {
                      console.error("Date parse error:", e);
                      return null;
                    }
                  })()}
                  onChange={(date) => {
                    if (!date) return;
                    const dateObj = date.toDate();
                    const now = new Date();

                    if (isOffer) {
                      dateObj.setHours(23, 59, 59, 999);
                      setValue("offerEndDate", dateObj.toISOString());
                    } else {
                      setValue("eventDate", dateObj.toISOString());
                    }

                    if (dateObj <= now) {
                      setValue("published", false, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {isOffer 
                    ? "Kampaniyanın avtomatik bitəcəyi vaxtı seçin." 
                    : "Saat və dəqiqə seçimi də daxil olmaqla."}
                </p>
              </div>

              <div className="space-y-2">
                <Select
                  label="Status"
                  variant="bordered"
                  startContent={<MdAccessTime className="text-gray-400" />}
                  isDisabled={true}
                  selectedKeys={
                    watch("eventStatus") ? new Set([watch("eventStatus")]) : new Set()
                  }
                  {...register("eventStatus")}
                  classNames={{
                    trigger:
                      "bg-gray-100 border-2 border-gray-200 cursor-not-allowed",
                    value: "text-gray-500",
                  }}
                >
                  <SelectItem
                    key={EventStatus.UPCOMING}
                    value={EventStatus.UPCOMING}
                  >
                    Gələcək
                  </SelectItem>
                  <SelectItem
                    key={EventStatus.ONGOING}
                    value={EventStatus.ONGOING}
                  >
                    Davam edir
                  </SelectItem>
                  <SelectItem key={EventStatus.PAST} value={EventStatus.PAST}>
                    Keçmiş
                  </SelectItem>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Status tarixə əsasən avtomatik təyin olunur.
                </p>
              </div>
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
                  Post{" "}
                  {isPublished ? "dərc ediləcək" : "qaralama kimi saxlanılacaq"}
                </span>
              </div>
              <Switch
                isSelected={!!isPublished}
                size="lg"
                color="warning"
                onValueChange={(isSelected) =>
                  setValue("published", isSelected, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                {isPublished ? "Dərc edilib" : "Qaralama"}
              </Switch>
              <input type="hidden" {...register("published")} />
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
