"use client";

import api from "@/utils/api/axios";
import type { BlogCategory } from "@/types/blog-category";
import { useCallback, useEffect, useState } from "react";
import { Button, Tooltip, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/react";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function BlogCategoriesDashboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [target, setTarget] = useState<BlogCategory | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<BlogCategory[]>(`/blog-categories`);
      setRows(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Siyahı yüklənə bilmədi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmRemove = async () => {
    if (!target) return;
    try {
      await api.delete(`/blog-categories/${target.id}`);
      toast.success("Silindi");
      onClose();
      setTarget(null);
      load();
    } catch {
      toast.error("Silinmədi");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold">Bloq kateqoriyaları</h1>
          <p className="text-gray-600 text-small">
            Ön tərəfdə /bloq səhifəsində filtr kimi görünür. Post seçimi admin post formundadır.
          </p>
        </div>
        <Button
          className="bg-jsyellow text-white"
          startContent={<MdAdd />}
          onPress={() => router.push("/dashboard/blog-categories/create")}
        >
          Yeni kateqoriya
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-24">Yüklənir...</div>
      ) : rows.length === 0 ? (
        <p className="text-center text-gray-500 py-24">Kateqoriya yoxdur.</p>
      ) : (
        <div className="space-y-2 max-w-4xl mx-auto">
          {rows.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-default-100"
            >
              <div className="flex-1">
                <p className="font-medium">{cat.name.az}</p>
                <p className="text-small text-gray-500">{cat.name.en}</p>
              </div>
              <span className="text-small text-gray-400 w-24 text-right">
                {cat._count?.posts ?? "—"} post
              </span>
              <span className="text-small text-gray-400 w-12">{cat.sortOrder}</span>
              <Tooltip content="Redaktə et">
                <Button
                  isIconOnly
                  variant="flat"
                  onPress={() =>
                    router.push(`/dashboard/blog-categories/edit/${cat.id}`)
                  }
                  aria-label="Redaktə"
                >
                  <MdEdit />
                </Button>
              </Tooltip>
              <Tooltip content="Sil">
                <Button
                  isIconOnly
                  variant="flat"
                  color="danger"
                  aria-label="Sil"
                  onPress={() => {
                    setTarget(cat);
                    onOpen();
                  }}
                >
                  <MdDelete />
                </Button>
              </Tooltip>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Kateqoriyanı silin?</ModalHeader>
          <ModalBody>
            Əlaqəli bloq yazıları kateqoriyasız qalacaq.
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Ləğv et
            </Button>
            <Button color="danger" onPress={() => confirmRemove()}>
              Sil
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
