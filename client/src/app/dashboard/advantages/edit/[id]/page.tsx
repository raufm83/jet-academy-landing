"use client";

import api from "@/utils/api/axios";
import { Button, Input, Textarea } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MdArrowBack } from "react-icons/md";
import { use } from "react";

export default function EditAdvantagePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: { az: "", ru: "" },
    description: { az: "", ru: "" },
    order: 0,
  });

  useEffect(() => {
    const fetchAdvantage = async () => {
      try {
        const res = await api.get(`/advantage/${id}`);
        const data = res.data;
        setFormData({
          title: { az: data.title?.az || "", ru: data.title?.ru || "" },
          description: { az: data.description?.az || "", ru: data.description?.ru || "" },
          order: data.order || 0,
        });
      } catch (error) {
        toast.error("Məlumatı yükləmək mümkün olmadı");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchAdvantage();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.patch(`/advantage/${id}`, {
        ...formData,
        order: Number(formData.order),
      });
      toast.success("Uğurla yeniləndi");
      router.push("/dashboard/advantages");
    } catch (error) {
      toast.error("Yenilənmə zamanı xəta baş verdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Yüklənir...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <Button
          isIconOnly
          variant="light"
          onPress={() => router.back()}
        >
          <MdArrowBack className="text-xl" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Fərqimiz Yenilə</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Başlıq (AZ)"
              value={formData.title.az}
              onChange={(e) => setFormData({ ...formData, title: { ...formData.title, az: e.target.value } })}
              isRequired
            />
            <Input
              label="Başlıq (RU)"
              value={formData.title.ru}
              onChange={(e) => setFormData({ ...formData, title: { ...formData.title, ru: e.target.value } })}
              isRequired
            />
            <Textarea
              label="Təsvir (AZ)"
              value={formData.description.az}
              onChange={(e) => setFormData({ ...formData, description: { ...formData.description, az: e.target.value } })}
              isRequired
              className="col-span-2"
            />
            <Textarea
              label="Təsvir (RU)"
              value={formData.description.ru}
              onChange={(e) => setFormData({ ...formData, description: { ...formData.description, ru: e.target.value } })}
              isRequired
              className="col-span-2"
            />
            <Input
              type="number"
              label="Sıra"
              value={formData.order.toString()}
              onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="flat" onPress={() => router.back()}>
              Ləğv et
            </Button>
            <Button color="primary" type="submit" isLoading={isSubmitting}>
              Yadda saxla
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
