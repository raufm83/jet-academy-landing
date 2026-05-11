"use client";

import api from "@/utils/api/axios";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MdAdd, MdDelete, MdEdit, MdSchool } from "react-icons/md";
import type { Graduate, GraduateListResponse } from "@/types/graduate";
import { toast } from "sonner";

export default function GraduatesDashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<Graduate[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState<Graduate | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<GraduateListResponse>(
        `/graduates/manage?page=${page}&limit=${rowsPerPage}`
      );
      setItems(data.items);
      setTotal(data.meta.total);
    } catch (e) {
      toast.error("Məzun siyahısı yüklənə bilmədi");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const confirmDelete = async () => {
    if (!selected) return;
    try {
      await api.delete(`/graduates/manage/${selected.id}`);
      toast.success("Məzun silindi");
      onClose();
      setSelected(null);
      fetchList();
    } catch (e) {
      toast.error("Silinmədi");
      console.error(e);
    }
  };

  const toggleStatus = async (row: Graduate, next: boolean) => {
    try {
      await api.patch(`/graduates/manage/${row.id}`, { isActive: next });
      toast.success(next ? "Aktiv edildi" : "Deaktiv edildi");
      fetchList();
    } catch (e) {
      toast.error("Status yenilənmədi");
      console.error(e);
    }
  };

  const columns = [
    { name: "AD (AZ / EN)", uid: "name" },
    { name: "MEDİA", uid: "media" },
    { name: "SIRA", uid: "order" },
    { name: "STATUS", uid: "status" },
    { name: "ƏMƏLİYYATLAR", uid: "actions" },
  ];

  const renderCell = (row: Graduate, columnKey: string) => {
    switch (columnKey) {
      case "name":
        return (
          <div className="max-w-md">
            <p className="text-small font-medium">{row.name.az}</p>
            <p className="text-tiny text-default-400 truncate">
              {row.name.en || "—"}
            </p>
          </div>
        );
      case "media":
        return (
          <span className="text-tiny rounded-md bg-default-100 px-2 py-0.5 font-medium text-default-600">
            {row.mediaType === "youtube" ? "YouTube" : "Şəkil"}
          </span>
        );
      case "order":
        return <span className="text-small">{row.order}</span>;
      case "status":
        return (
          <Switch
            size="sm"
            isSelected={row.isActive}
            onValueChange={(v) => toggleStatus(row, v)}
            aria-label="Aktiv"
          />
        );
      case "actions":
        return (
          <div className="flex items-center gap-1 justify-center">
            <Tooltip content="Redaktə">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() =>
                  router.push(`/dashboard/graduates/edit/${row.id}`)
                }
              >
                <MdEdit className="text-default-400" size={20} />
              </Button>
            </Tooltip>
            <Tooltip content="Sil" color="danger">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => {
                  setSelected(row);
                  onOpen();
                }}
              >
                <MdDelete className="text-danger" size={20} />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
              <MdSchool />
              Məzunlar
            </h1>
            <p className="text-default-500 text-sm">
              Məzunların uğur hekayələrini buradan idarə edin.
            </p>
          </div>
          <Button
            color="primary"
            startContent={<MdAdd size={22} />}
            onPress={() => router.push("/dashboard/graduates/create")}
          >
            Yeni Məzun
          </Button>
        </div>

        <Table
          aria-label="Məzunlar cədvəli"
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={Math.max(1, Math.ceil(total / rowsPerPage))}
                onChange={setPage}
              />
            </div>
          }
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={
                  column.uid === "actions" || column.uid === "status"
                    ? "center"
                    : "start"
                }
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={items}
            loadingContent={<div>Yüklənir...</div>}
            loadingState={loading ? "loading" : "idle"}
            emptyContent="Heç bir məzun tapılmadı"
          >
            {(row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.uid}>
                    {renderCell(row, column.uid)}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            {(onModalClose) => (
              <>
                <ModalHeader>Məzun silinsin?</ModalHeader>
                <ModalBody>
                  <p>
                    &quot;{selected?.name.az}&quot; silinəcək. Bu əməliyyat geri
                    qaytarıla bilməz.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onModalClose}>
                    Ləğv et
                  </Button>
                  <Button color="danger" onPress={confirmDelete}>
                    Bəli, sil
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </motion.div>
    </div>
  );
}
