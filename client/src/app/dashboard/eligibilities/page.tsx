"use client";
import { Course, Eligibility } from "@/types/course";
import api from "@/utils/api/axios";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { MdAdd, MdDelete, MdEdit, MdSearch } from "react-icons/md";
import { toast } from "sonner";

interface EligibilitesResponse {
  items: Eligibility[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

const ALL_VALUE = "all";
const UNASSIGNED_VALUE = "unassigned";

export default function EligibilitiesPage() {
  const router = useRouter();
  const [eligibilities, setEligibilities] = useState<Eligibility[]>([]);
  const [totalEligibilities, setTotalEligibilities] = useState(0);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEligibility, setSelectedEligibility] =
    useState<Eligibility | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseFilter, setCourseFilter] = useState<string>(ALL_VALUE);
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(
          "/courses/brief?limit=200&page=1&includeUnpublished=true&sortOrder=desc",
          { withCredentials: true },
        );
        setCourses(data?.items || []);
      } catch {
        setCourses([]);
      }
    })();
  }, []);

  const fetchEligibilities = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(rowsPerPage),
      });
      if (courseFilter && courseFilter !== ALL_VALUE) {
        params.set("courseId", courseFilter);
      }
      if (search) {
        params.set("search", search);
      }
      const { data } = await api.get<EligibilitesResponse>(
        `/course-eligibility?${params.toString()}`,
      );
      setEligibilities(data.items);
      setTotalEligibilities(data.meta.total);
    } catch (error) {
      toast.error("Tələb yüklənə bilmədi");
      console.error("Tələbin yükləmə xətası:", error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, courseFilter, search]);

  useEffect(() => {
    setPage(1);
  }, [courseFilter, search]);

  useEffect(() => {
    fetchEligibilities();
  }, [fetchEligibilities]);

  const courseOptions = useMemo(
    () => [
      { key: ALL_VALUE, label: "Bütün kurslar" },
      { key: UNASSIGNED_VALUE, label: "Təyin edilməyib" },
      ...courses.map((c) => ({ key: c.id, label: c.title?.az || c.title?.en || c.id })),
    ],
    [courses],
  );

  const handleDelete = async (eligibility: Eligibility) => {
    setSelectedEligibility(eligibility);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!selectedEligibility) return;

    try {
      await api.delete(`/course-eligibility/${selectedEligibility.id}`);
      toast.success("Tələb uğurla silindi");
      fetchEligibilities();
    } catch (error) {
      toast.error("Tələbi silmək mümkün olmadı");
      console.error("Tələbi silmə xətası:", error);
    } finally {
      onClose();
      setSelectedEligibility(null);
    }
  };

  const columns = [
    { name: "BAŞLIQ", uid: "title" },
    { name: "TƏSVİR", uid: "description" },
    { name: "YARADILMA TARİXİ", uid: "createdAt" },
    { name: "ƏMƏLİYYATLAR", uid: "actions" },
  ];

  const renderCell = (eligibility: Eligibility, columnKey: string) => {
    switch (columnKey) {
      case "title":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{eligibility.title.az}</p>
          </div>
        );
      case "description":
        return (
          <p className="text-small">
            {eligibility.description.az.length > 100
              ? `${eligibility.description.az.substring(0, 100)}...`
              : eligibility.description.az}
          </p>
        );
      case "category":
        return <p className="text-small">{eligibility.title.az}</p>;
      case "createdAt":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">
              {new Date(eligibility.createdAt).toLocaleDateString("az-AZ")}
            </p>
            <p className="text-bold text-tiny text-default-400">
              {new Date(eligibility.createdAt).toLocaleTimeString("az-AZ")}
            </p>
          </div>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Tooltip content="Düzəliş et">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/eligibilities/edit/${eligibility.id}`)
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
                onClick={() => handleDelete(eligibility)}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Tələblər</h1>
            <p className="text-gray-500">Tələbləri idarə edin</p>
          </div>
          <Button
            color="primary"
            className="bg-jsyellow text-white"
            startContent={<MdAdd size={24} />}
            onClick={() => router.push("/dashboard/eligibilities/create")}
          >
            Yeni Tələb
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <Select
            label="Kurs filtri"
            size="sm"
            variant="bordered"
            className="md:max-w-xs"
            selectedKeys={[courseFilter]}
            onChange={(e) => setCourseFilter(e.target.value || ALL_VALUE)}
          >
            {courseOptions.map((opt) => (
              <SelectItem key={opt.key} value={opt.key}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>
          <Input
            size="sm"
            variant="bordered"
            placeholder="Başlığa görə axtar..."
            startContent={<MdSearch className="text-gray-400" size={18} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="md:max-w-sm"
          />
        </div>

        <Table
          aria-label="Tələbə rəyləri cədvəli"
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="warning"
                page={page}
                total={Math.ceil(totalEligibilities / rowsPerPage)}
                onChange={(page) => setPage(page)}
              />
            </div>
          }
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={
                  column.uid === "actions"
                    ? "center"
                    : "start"
                }
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={eligibilities}
            loadingContent={<div>Yüklənir...</div>}
            loadingState={loading ? "loading" : "idle"}
          >
            {(eligibility) => (
              <TableRow key={eligibility.id}>
                {columns.map((column) => (
                  <TableCell key={column.uid}>
                    {renderCell(eligibility, column.uid)}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Layihəni Sil</ModalHeader>
                <ModalBody>
                  <p>
                    &quot;{selectedEligibility?.title.az}&quot; layihəsini
                    silmək istədiyinizə əminsiniz?
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
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
