"use client";

import api from "@/utils/api/axios";
import { resolveOptimizedImageUrl } from "@/utils/optimized-image-url";
import { Button, Card, Input, Textarea } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Locales = { az: string; en: string };

const empty = (): Locales => ({ az: "", en: "" });

function pickLocales(raw: unknown): Locales {
  if (!raw || typeof raw !== "object") return empty();
  const o = raw as Record<string, unknown>;
  return { az: String(o.az ?? ""), en: String(o.en ?? "") };
}

export default function AboutPageEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIntro, setUploadingIntro] = useState(false);
  const [uploadingMv, setUploadingMv] = useState(false);

  const [introTitle, setIntroTitle] = useState<Locales>(empty);
  const [introD1, setIntroD1] = useState<Locales>(empty);
  const [introD2, setIntroD2] = useState<Locales>(empty);
  const [introD3, setIntroD3] = useState<Locales>(empty);
  const [introImageAlt, setIntroImageAlt] = useState<Locales>(empty);
  const [introImageUrl, setIntroImageUrl] = useState<string | null>(null);

  const [missionSectionTitle, setMissionSectionTitle] = useState<Locales>(
    empty
  );
  const [missionTitle, setMissionTitle] = useState<Locales>(empty);
  const [missionDescription, setMissionDescription] = useState<Locales>(
    empty
  );
  const [visionTitle, setVisionTitle] = useState<Locales>(empty);
  const [visionDescription, setVisionDescription] = useState<Locales>(empty);
  const [mvImageAlt, setMvImageAlt] = useState<Locales>(empty);
  const [mvImageUrl, setMvImageUrl] = useState<string | null>(null);

  const introPreview = useMemo(
    () =>
      introImageUrl?.trim()
        ? resolveOptimizedImageUrl(introImageUrl, "generic")
        : "/images/about/intro.webp",
    [introImageUrl]
  );

  const mvPreview = useMemo(
    () =>
      mvImageUrl?.trim()
        ? resolveOptimizedImageUrl(mvImageUrl, "generic")
        : "/images/about/mission-vision.webp",
    [mvImageUrl]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/about-page");
      setIntroTitle(pickLocales(data.introTitle));
      setIntroD1(pickLocales(data.introDescription1));
      setIntroD2(pickLocales(data.introDescription2));
      setIntroD3(pickLocales(data.introDescription3));
      setIntroImageAlt(pickLocales(data.introImageAlt));
      setIntroImageUrl(data.introImageUrl ?? null);

      setMissionSectionTitle(pickLocales(data.missionSectionTitle));
      setMissionTitle(pickLocales(data.missionTitle));
      setMissionDescription(pickLocales(data.missionDescription));
      setVisionTitle(pickLocales(data.visionTitle));
      setVisionDescription(pickLocales(data.visionDescription));
      setMvImageAlt(pickLocales(data.missionVisionImageAlt));
      setMvImageUrl(data.missionVisionImageUrl ?? null);
    } catch (e) {
      console.error(e);
      toast.error("Məlumatlar yüklənmədi");
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
      await api.patch("/about-page", {
        introTitle,
        introDescription1: introD1,
        introDescription2: introD2,
        introDescription3: introD3,
        introImageAlt,
        missionSectionTitle,
        missionTitle,
        missionDescription,
        visionTitle,
        visionDescription,
        missionVisionImageAlt: mvImageAlt,
      });
      toast.success("Saxlanıldı");
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error("Saxlanılmadı");
    } finally {
      setSaving(false);
    }
  };

  const onIntroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingIntro(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await api.post("/about-page/intro-image", fd, {
        timeout: 60000,
      });
      setIntroImageUrl(data.introImageUrl ?? null);
      toast.success("Intro şəkli yeniləndi");
    } catch (err) {
      console.error(err);
      toast.error("Şəkil yüklənmədi");
    } finally {
      setUploadingIntro(false);
    }
  };

  const onMvImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingMv(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const { data } = await api.post("/about-page/mission-vision-image", fd, {
        timeout: 60000,
      });
      setMvImageUrl(data.missionVisionImageUrl ?? null);
      toast.success("Missiya/vizyon şəkli yeniləndi");
    } catch (err) {
      console.error(err);
      toast.error("Şəkil yüklənmədi");
    } finally {
      setUploadingMv(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-default-500 text-center">Yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-16 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          Haqqımızda (CMS)
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto">
          Intro və missiya/vizyon mətnləri (AZ, EN) və şəkillər. Boş sütunlar
          saytda tərcümə faylından göstərilir. RU üçün EN (yoxdursa AZ)
          istifadə olunur.
        </p>
      </div>

      <Card className="p-5 border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Intro bölməsi</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">AZ</p>
            <Input
              label="Başlıq"
              value={introTitle.az}
              onValueChange={(v) =>
                setIntroTitle((s) => ({ ...s, az: v }))
              }
              variant="bordered"
            />
            <Textarea
              label="Abzas 1"
              minRows={3}
              value={introD1.az}
              onValueChange={(v) => setIntroD1((s) => ({ ...s, az: v }))}
              variant="bordered"
            />
            <Textarea
              label="Abzas 2"
              minRows={3}
              value={introD2.az}
              onValueChange={(v) => setIntroD2((s) => ({ ...s, az: v }))}
              variant="bordered"
            />
            <Textarea
              label="Abzas 3"
              minRows={3}
              value={introD3.az}
              onValueChange={(v) => setIntroD3((s) => ({ ...s, az: v }))}
              variant="bordered"
            />
            <Input
              label="Şəkil alt (AZ)"
              value={introImageAlt.az}
              onValueChange={(v) =>
                setIntroImageAlt((s) => ({ ...s, az: v }))
              }
              variant="bordered"
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">EN</p>
            <Input
              label="Title"
              value={introTitle.en}
              onValueChange={(v) =>
                setIntroTitle((s) => ({ ...s, en: v }))
              }
              variant="bordered"
            />
            <Textarea
              label="Paragraph 1"
              minRows={3}
              value={introD1.en}
              onValueChange={(v) => setIntroD1((s) => ({ ...s, en: v }))}
              variant="bordered"
            />
            <Textarea
              label="Paragraph 2"
              minRows={3}
              value={introD2.en}
              onValueChange={(v) => setIntroD2((s) => ({ ...s, en: v }))}
              variant="bordered"
            />
            <Textarea
              label="Paragraph 3"
              minRows={3}
              value={introD3.en}
              onValueChange={(v) => setIntroD3((s) => ({ ...s, en: v }))}
              variant="bordered"
            />
            <Input
              label="Image alt (EN)"
              value={introImageAlt.en}
              onValueChange={(v) =>
                setIntroImageAlt((s) => ({ ...s, en: v }))
              }
              variant="bordered"
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden border bg-gray-50">
            <Image
              src={introPreview}
              alt="Intro"
              fill
              className="object-cover"
              sizes="(max-width:768px)100vw,400px"
              unoptimized={
                introPreview.startsWith("http") ||
                introPreview.startsWith("//")
              }
            />
          </div>
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploadingIntro}
              className="block w-full text-sm"
              onChange={onIntroImage}
            />
            <p className="text-xs text-gray-500 mt-2">
              Intro şəkli — serverdə WebP (yalnız dəyişəndə seçin)
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5 border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Missiya və vizyon
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3 md:col-span-2">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Bölmə başlığı (AZ)"
                value={missionSectionTitle.az}
                onValueChange={(v) =>
                  setMissionSectionTitle((s) => ({ ...s, az: v }))
                }
                variant="bordered"
              />
              <Input
                label="Section title (EN)"
                value={missionSectionTitle.en}
                onValueChange={(v) =>
                  setMissionSectionTitle((s) => ({ ...s, en: v }))
                }
                variant="bordered"
              />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Missiya AZ</p>
            <Input
              label="Başlıq"
              value={missionTitle.az}
              onValueChange={(v) =>
                setMissionTitle((s) => ({ ...s, az: v }))
              }
              variant="bordered"
            />
            <Textarea
              label="Mətn"
              minRows={4}
              value={missionDescription.az}
              onValueChange={(v) =>
                setMissionDescription((s) => ({ ...s, az: v }))
              }
              variant="bordered"
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Mission EN</p>
            <Input
              label="Title"
              value={missionTitle.en}
              onValueChange={(v) =>
                setMissionTitle((s) => ({ ...s, en: v }))
              }
              variant="bordered"
            />
            <Textarea
              label="Text"
              minRows={4}
              value={missionDescription.en}
              onValueChange={(v) =>
                setMissionDescription((s) => ({ ...s, en: v }))
              }
              variant="bordered"
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Vizyon AZ</p>
            <Input
              label="Başlıq"
              value={visionTitle.az}
              onValueChange={(v) =>
                setVisionTitle((s) => ({ ...s, az: v }))
              }
              variant="bordered"
            />
            <Textarea
              label="Mətn"
              minRows={4}
              value={visionDescription.az}
              onValueChange={(v) =>
                setVisionDescription((s) => ({ ...s, az: v }))
              }
              variant="bordered"
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Vision EN</p>
            <Input
              label="Title"
              value={visionTitle.en}
              onValueChange={(v) =>
                setVisionTitle((s) => ({ ...s, en: v }))
              }
              variant="bordered"
            />
            <Textarea
              label="Text"
              minRows={4}
              value={visionDescription.en}
              onValueChange={(v) =>
                setVisionDescription((s) => ({ ...s, en: v }))
              }
              variant="bordered"
            />
          </div>
          <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
            <Input
              label="Şəkil alt (AZ)"
              value={mvImageAlt.az}
              onValueChange={(v) =>
                setMvImageAlt((s) => ({ ...s, az: v }))
              }
              variant="bordered"
            />
            <Input
              label="Image alt (EN)"
              value={mvImageAlt.en}
              onValueChange={(v) =>
                setMvImageAlt((s) => ({ ...s, en: v }))
              }
              variant="bordered"
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden border bg-gray-50">
            <Image
              src={mvPreview}
              alt="Missiya/vizyon"
              fill
              className="object-cover"
              sizes="(max-width:768px)100vw,400px"
              unoptimized={
                mvPreview.startsWith("http") || mvPreview.startsWith("//")
              }
            />
          </div>
          <div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={uploadingMv}
              className="block w-full text-sm"
              onChange={onMvImage}
            />
            <p className="text-xs text-gray-500 mt-2">
              Missiya/vizyon şəkli — WebP
            </p>
          </div>
        </div>
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
