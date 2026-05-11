"use client";

import { STATIC_PAGE_META_KEYS } from "@/data/page-meta-keys";
import api from "@/utils/api/axios";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
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
import { MdAdd, MdDelete, MdEdit, MdQuiz } from "react-icons/md";
import type { FaqRow } from "@/types/faq";
import { toast } from "sonner";

interface FaqListResponse {
  items: FaqRow[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

function labelForPageKey(key: string) {
  return STATIC_PAGE_META_KEYS.find((x) => x.key === key)?.label ?? key;
}

export default function FaqDashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<FaqRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState<FaqRow | null>(null);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<FaqListResponse>(
        `/faq?page=${page}&limit=${rowsPerPage}`
      );
      setItems(data.items);
      setTotal(data.meta.total);
    } catch (e) {
      toast.error("FAQ siyahısı yüklənə bilmədi");
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
      await api.delete(`/faq/${selected.id}`);
      toast.success("FAQ silindi");
      onClose();
      setSelected(null);
      fetchList();
    } catch (e) {
      toast.error("Silinmədi");
      console.error(e);
    }
  };

  const columns = [
    { name: "SIRA", uid: "order" },
    { name: "SUAL (AZ)", uid: "questionAz" },
    { name: "SUAL (EN)", uid: "questionEn" },
    { name: "SƏHİFƏ", uid: "page" },
    { name: "ƏMƏLİYYATLAR", uid: "actions" },
  ];

  const renderCell = (row: FaqRow, columnKey: string) => {
    switch (columnKey) {
      case "order":
        return <span className="text-small text-default-500">{row.order}</span>;
      case "questionAz":
        return (
          <p className="text-small line-clamp-2 max-w-[14rem] leading-snug">{row.question.az}</p>
        );
      case "questionEn":
        return (
          <p className="text-small text-default-400 line-clamp-2 max-w-[14rem] leading-snug">
            {row.question.en || "—"}
          </p>
        );
      case "page": {
        const pages: string[] = Array.isArray(row.pages)
          ? row.pages
          : typeof (row as any).page === "string" && (row as any).page
            ? [(row as any).page]
            : [];
        if (pages.length === 0) {
          return <span className="text-tiny text-default-400">—</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {pages.map((p) => (
              <span
                key={p}
                className="text-tiny rounded-md bg-default-100 px-2 py-0.5 font-medium text-default-600"
              >
                {labelForPageKey(p)}
              </span>
            ))}
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
                onPress={() => router.push(`/dashboard/faq/edit/${row.id}`)}
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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-primary">
              <MdQuiz />
              FAQ
            </h1>
            <p className="text-sm text-default-500">
              Tez-tez verilən suallar — AZ və EN.
            </p>
          </div>
          <Button
            color="primary"
            startContent={<MdAdd size={20} />}
            onPress={() => router.push("/dashboard/faq/create")}
          >
            Yeni FAQ
          </Button>
        </div>

        <Table
          aria-label="FAQ cədvəli"
          classNames={{
            wrapper: "shadow-none",
            thead: "[&>tr]:h-9 [&>tr]:bg-default-100",
            th: "bg-transparent px-3 py-2 text-tiny font-semibold uppercase text-default-600",
            td: "max-w-0 px-3 py-2 text-small border-b border-default-100",
            tr: "h-px",
          }}
          bottomContent={
            <div className="flex w-full justify-center py-3">
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
                  align={column.uid === "actions" ? "center" : "start"}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={items}
              loadingContent={<div>Yüklənir...</div>}
              loadingState={loading ? "loading" : "idle"}
              emptyContent="Heç bir FAQ tapılmadı"
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
                <ModalHeader>FAQ silinsin?</ModalHeader>
                <ModalBody>
                  <p>
                    &quot;{selected?.question.az}&quot; silinəcək. Geri qaytarıla
                    bilməz.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onModalClose}>
                    Ləğv et
                  </Button>
                  <Button color="danger" onPress={confirmDelete}>
                    Sil
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
