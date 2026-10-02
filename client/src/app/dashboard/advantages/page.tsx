"use client";

import api from "@/utils/api/axios";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Switch,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import { toast } from "sonner";

export default function AdvantagesPage() {
  const [advantages, setAdvantages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

  const fetchAdvantages = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/advantage");
      setAdvantages(res.data || []);
    } catch (error) {
      toast.error("Fərqimiz məlumatlarını yükləmək mümkün olmadı");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvantages();
  }, [fetchAdvantages]);

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await api.delete(`/advantage/${selectedId}`);
      toast.success("Uğurla silindi");
      fetchAdvantages();
    } catch (error) {
      toast.error("Silmə zamanı xəta baş verdi");
    } finally {
      setSelectedId(null);
      onOpenChange();
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await api.patch(`/advantage/${id}`, { isActive: !current });
      toast.success("Status yeniləndi");
      fetchAdvantages();
    } catch (error) {
      toast.error("Status yenilənərkən xəta baş verdi");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fərqimiz</h1>
          <p className="text-gray-500 text-sm mt-1">
            "Fərqimiz nədir" bölməsinin məlumatlarını idarə edin
          </p>
        </div>
        <Button
          color="primary"
          startContent={<MdAdd className="text-xl" />}
          onPress={() => router.push("/dashboard/advantages/create")}
          className="font-medium"
        >
          Yeni Yarat
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <Table aria-label="Advantages table">
          <TableHeader>
            <TableColumn>Sıra</TableColumn>
            <TableColumn>Başlıq (AZ)</TableColumn>
            <TableColumn>Status</TableColumn>
            <TableColumn align="center">Əməliyyatlar</TableColumn>
          </TableHeader>
          <TableBody
            items={advantages}
            emptyContent={
              isLoading ? "Yüklənir..." : "Məlumat tapılmadı"
            }
          >
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>{item.order}</TableCell>
                <TableCell>
                  <div className="max-w-md truncate">{item.title?.az}</div>
                </TableCell>
                <TableCell>
                  <Switch
                    isSelected={item.isActive}
                    onValueChange={() => handleToggleActive(item.id, item.isActive)}
                    size="sm"
                    color="success"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Tooltip content="Düzəliş et">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => router.push(`/dashboard/advantages/edit/${item.id}`)}
                      >
                        <MdEdit className="text-lg text-blue-500" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Sil" color="danger">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => {
                          setSelectedId(item.id);
                          onOpen();
                        }}
                      >
                        <MdDelete className="text-lg" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Silməni təsdiqləyin</ModalHeader>
              <ModalBody>
                <p>Bu elementi silmək istədiyinizə əminsiniz?</p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>İmtina</Button>
                <Button color="danger" onPress={() => { handleDelete(); onClose(); }}>Sil</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
