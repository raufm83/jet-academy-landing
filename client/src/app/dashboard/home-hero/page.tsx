"use client";

import api from "@/utils/api/axios";
import { getDefaultHeroCmsContent, getDefaultHeroImageAlt } from "@/data/default-hero-cms";
import { resolveOptimizedImageUrl } from "@/utils/optimized-image-url";
import { hasVisibleHtml } from "@/utils/multilingual-html";
import { Button, Card, Input } from "@nextui-org/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <p className="text-default-500 text-sm py-8 text-center border border-default-200 rounded-lg">
      Redaktor yüklənir...
    </p>
  ),
});

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["link"],
    ["clean"],
  ],
};

const quillFormats = [
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

type Locales = { az: string; en: string };

const emptyLocales = (): Locales => ({ az: "", en: "" });

function pickLocales(raw: unknown): Locales {
  if (!raw || typeof raw !== "object") return emptyLocales();
  const o = raw as Record<string, unknown>;
  return {
    az: String(o.az ?? ""),
    en: String(o.en ?? ""),
  };
}

function mergeHeroFormWithStaticDefaults(
  rawContent: Locales,
  rawAlt: Locales
): { content: Locales; imageAlt: Locales } {
  const dc = getDefaultHeroCmsContent();
  const da = getDefaultHeroImageAlt();
  return {
    content: {
      az: hasVisibleHtml(rawContent.az) ? rawContent.az : dc.az,
      en: hasVisibleHtml(rawContent.en) ? rawContent.en : dc.en,
    },
    imageAlt: {
      az: rawAlt.az.trim() ? rawAlt.az : da.az,
      en: rawAlt.en.trim() ? rawAlt.en : da.en,
    },
  };
}

export default function HomeHeroEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState<Locales>(emptyLocales);
  const [imageAlt, setImageAlt] = useState<Locales>(emptyLocales);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const previewSrc = useMemo(() => {
    if (imageUrl && imageUrl.trim()) {
      return resolveOptimizedImageUrl(imageUrl, "generic");
    }
    return "/boy.webp";
  }, [imageUrl]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await api.get("/home-hero");
      const merged = mergeHeroFormWithStaticDefaults(
        pickLocales(data.contentHtml),
        pickLocales(data.imageAlt)
      );
      setContent(merged.content);
      setImageAlt(merged.imageAlt);
      setImageUrl(data.imageUrl ?? null);
    } catch (e) {
      console.error(e);
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string }; status?: number } })
              .response?.data?.message
          : null;
      const status =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { status?: number } }).response?.status
          : undefined;
      const hint =
        status === 404 || status === 500
          ? " API-də sxem üçün `npx prisma db push` işlədin."
          : "";
      setLoadError(
        (msg ? String(msg) : "Hero məlumatları yüklənmədi.") + hint
      );
      toast.error("Hero məlumatları yüklənmədi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async () => {
    setSaving(true);
    try {
      await api.patch("/home-hero", {
        contentHtml: content,
        imageAlt,
      });
      toast.success("Saxlanıldı");
      router.refresh();
    } catch (e: unknown) {
      console.error(e);
      toast.error("Saxlanılmadı — yenidən cəhd edin");
    } finally {
      setSaving(false);
    }
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await api.post("/home-hero/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(data.imageUrl ?? null);
      toast.success("Şəkil yeniləndi");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Şəkil yüklənmədi");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-default-500 text-center">Yüklənir...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-center">Ana səhifə Hero</h1>
        <Card className="p-6 border border-danger-200 bg-danger-50/30">
          <p className="text-danger-700 mb-4">{loadError}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button color="primary" onPress={() => load()}>
              Yenidən cəhd et
            </Button>
            <Button variant="bordered" onPress={() => router.push("/dashboard/")}>
              İdarə paneli
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Ana səhifə Hero
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Ümumi mətn redaktoru ilə məzmunu redaktə edin (AZ və EN). Yalnız mətn
          dəyişəndə şəkil faylı seçməyin — köhnə şəkil saxlanılır. Rus dilində
          sayt EN məzmununu (yoxdursa AZ) göstərir.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="relative w-[min(100%,320px)] aspect-[4/5] max-h-[400px] rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
          <Image
            src={previewSrc}
            alt="Hero önizləmə"
            fill
            className="object-cover"
            sizes="320px"
            priority
            unoptimized={
              previewSrc.startsWith("http") || previewSrc.startsWith("//")
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        <Card className="p-4 md:p-5 shadow-sm border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">
            Məzmun (AZ)
          </h2>
          <div className="hero-admin-quill rounded-md border border-gray-300 bg-white overflow-hidden [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50 [&_.ql-container]:min-h-[240px]">
            <ReactQuill
              theme="snow"
              value={content.az}
              onChange={(v) => setContent((s) => ({ ...s, az: v }))}
              modules={quillModules}
              formats={quillFormats}
            />
          </div>
          <Input
            className="mt-4"
            label="Şəkil alt mətn (AZ)"
            value={imageAlt.az}
            onValueChange={(v) => setImageAlt((s) => ({ ...s, az: v }))}
            variant="bordered"
            classNames={{ inputWrapper: "border-gray-300" }}
          />
        </Card>

        <Card className="p-4 md:p-5 shadow-sm border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">
            Content (EN)
          </h2>
          <div className="hero-admin-quill rounded-md border border-gray-300 bg-white overflow-hidden [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50 [&_.ql-container]:min-h-[240px]">
            <ReactQuill
              theme="snow"
              value={content.en}
              onChange={(v) => setContent((s) => ({ ...s, en: v }))}
              modules={quillModules}
              formats={quillFormats}
            />
          </div>
          <Input
            className="mt-4"
            label="Image alt (EN)"
            value={imageAlt.en}
            onValueChange={(v) => setImageAlt((s) => ({ ...s, en: v }))}
            variant="bordered"
            classNames={{ inputWrapper: "border-gray-300" }}
          />
        </Card>
      </div>

      <Card className="p-4 md:p-5 shadow-sm border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800 mb-2">
          Hero şəkli — ilk yaradılanda və ya dəyişmək istədikdə seçin (yalnız
          mətn üçün boş buraxın)
        </h2>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-50"
          disabled={uploading}
          onChange={onImageChange}
        />
        <p className="text-xs text-gray-500 mt-2">
          JPG, PNG, WebP, GIF — serverdə WebP-ə çevrilir (maks. 2 MB).
        </p>
      </Card>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="bordered" onPress={() => router.push("/dashboard/")}>
          Geri
        </Button>
        <Button color="primary" isLoading={saving} onPress={onSave}>
          Saxla
        </Button>
      </div>
    </div>
  );
}
