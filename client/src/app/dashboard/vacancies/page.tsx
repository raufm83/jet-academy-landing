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
import { MdAdd, MdDelete, MdEdit, MdWorkOutline } from "react-icons/md";
import type { Vacancy, VacancyListResponse } from "@/types/vacancy";
import { toast } from "sonner";

function sortVacanciesByOrder(items: Vacancy[]): Vacancy[] {
  return [...items].sort((a, b) => {
    const orderDiff = Number(b.order ?? 0) - Number(a.order ?? 0);
    if (orderDiff !== 0) return orderDiff;

    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

export default function VacanciesDashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<Vacancy[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState<Vacancy | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<VacancyListResponse>(
        `/vacancies/manage?page=${page}&limit=${rowsPerPage}`
      );
      setItems(sortVacanciesByOrder(data.items));
      setTotal(data.meta.total);
    } catch (e) {
      toast.error("Vakansiya siyahısı yüklənə bilmədi");
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
      await api.delete(`/vacancies/manage/${selected.id}`);
      toast.success("Vakansiya silindi");
      onClose();
      setSelected(null);
      fetchList();
    } catch (e) {
      toast.error("Silinmədi");
      console.error(e);
    }
  };

  const toggleStatus = async (row: Vacancy, next: boolean) => {
    try {
      await api.patch(`/vacancies/manage/${row.id}`, { isActive: next });
      toast.success(next ? "Aktiv edildi" : "Deaktiv edildi");
      fetchList();
    } catch (e) {
      toast.error("Status yenilənmədi");
      console.error(e);
    }
  };

  const columns = [
    { name: "BAŞLIQ (AZ / EN)", uid: "title" },
    { name: "SLUG", uid: "slug" },
    { name: "SIRA", uid: "order" },
    { name: "DEADLINE", uid: "deadline" },
    { name: "STATUS", uid: "status" },
    { name: "ƏMƏLİYYATLAR", uid: "actions" },
  ];

  const renderCell = (row: Vacancy, columnKey: string) => {
    switch (columnKey) {
      case "title":
        return (
          <div className="max-w-md">
            <p className="text-small font-medium">{row.title.az}</p>
            <p className="text-tiny text-default-400 truncate">
              {row.title.en || "—"}
            </p>
          </div>
        );
      case "slug":
        return <span className="text-tiny text-default-400 font-mono">{row.slug.az}</span>;
      case "order":
        return <span className="text-small">{row.order}</span>;
      case "deadline": {
        if (!row.deadline) {
          return <span className="text-tiny text-default-400">—</span>;
        }
        const dl = new Date(row.deadline);
        if (Number.isNaN(dl.getTime())) {
          return <span className="text-tiny text-default-400">—</span>;
        }
        const now = new Date();
        const isExpired = dl < now;
        const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const dateStr = dl.toLocaleDateString("az-AZ");
        return (
          <div className="flex flex-col gap-0.5">
            <span className={`text-tiny font-medium ${isExpired ? "text-danger" : "text-default-600"}`}>
              {dateStr}
            </span>
            {isExpired ? (
              <span className="text-tiny font-semibold text-danger">Müddəti bitib</span>
            ) : diffDays <= 7 ? (
              <span className="text-tiny font-medium text-warning">{diffDays} gün qalıb</span>
            ) : null}
          </div>
        );
      }
      case "status": {
        const deadlineDate = row.deadline ? new Date(row.deadline) : null;
        const expired = deadlineDate && !Number.isNaN(deadlineDate.getTime()) && deadlineDate < new Date();
        return (
          <div className="flex flex-col items-center gap-1">
            <Switch
              size="sm"
              isSelected={row.isActive}
              onValueChange={(v) => toggleStatus(row, v)}
              aria-label="Aktiv"
              isDisabled={!!expired}
            />
            {expired && (
              <span className="text-[10px] font-semibold text-danger">Vaxtı bitib</span>
            )}
          </div>
        );
      }
      case "actions":
        return (
          <div className="flex items-center gap-1 justify-center">
            <Tooltip content="Redaktə">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => router.push(`/dashboard/vacancies/edit/${row.id}`)}
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
              <MdWorkOutline />
              Vakansiyalar
            </h1>
            <p className="text-default-500 text-sm">
              Karyera imkanlarını buradan idarə edin.
            </p>
          </div>
          <Button
            color="primary"
            startContent={<MdAdd size={22} />}
            onPress={() => router.push("/dashboard/vacancies/create")}
          >
            Yeni Vakansiya
          </Button>
        </div>

        <Table
          aria-label="Vakansiyalar cədvəli"
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
                align={column.uid === "actions" || column.uid === "status" ? "center" : "start"}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={items}
            loadingContent={<div>Yüklənir...</div>}
            loadingState={loading ? "loading" : "idle"}
            emptyContent="Heç bir vakansiya tapılmadı"
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
                <ModalHeader>Vakansiya silinsin?</ModalHeader>
                <ModalBody>
                  <p>
                    &quot;{selected?.title.az}&quot; silinəcək. Bu əməliyyat geri qaytarıla bilməz.
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
