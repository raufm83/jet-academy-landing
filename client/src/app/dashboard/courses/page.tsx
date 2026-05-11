"use client";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Button,
  Pagination,
  Tooltip,
  useDisclosure,
  Chip,
  Skeleton,
  Spinner,
} from "@nextui-org/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MdAdd, MdEdit, MdSave, MdSettings, MdViewModule, MdShield } from "react-icons/md";
import { toast } from "sonner";
import api from "@/utils/api/axios";
import { formatCourseDurationMonths } from "@/utils/course-helpers";
import { Course } from "@/types/course";
import Link from "next/link";
import Image from "next/image";
const ModulesModal = dynamic(() => import("@/components/views/dashboard/modules/modules-modal"), { ssr: false });
const EligibilityModal = dynamic(() => import("@/components/views/dashboard/eligibility/eligibility-modal"), { ssr: false });
const TeachersModal = dynamic(() => import("@/components/views/dashboard/courses/teachers-modal"), { ssr: false });

interface CoursesResponse {
  items: Course[];
  meta: { total: number; page: number; limit: number; totalPages?: number };
}
interface TeacherRole {
  id: string;
  title: string;
}

/** Admin siyahısı: DB sırası MongoDB-da səhv ola bilər; bütün sətirləri götürüb order ilə sıralayırıq. */
const ADMIN_COURSES_LIST_LIMIT = 3000;

function sortCoursesByOrderDesc(items: Course[]): Course[] {
  return [...items].sort((a, b) => {
    const oa = Number(a.order ?? 0);
    const ob = Number(b.order ?? 0);
    if (ob !== oa) return ob - oa;
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
}

export default function CoursesPage() {
  const router = useRouter();

  const [allCoursesSorted, setAllCoursesSorted] = useState<Course[]>([]);
  const [teacherRoles, setTeacherRoles] = useState<TeacherRole[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);

  const { isOpen: isTeachersOpen, onOpen: onTeachersOpen, onClose: onTeachersClose } = useDisclosure();
  const { isOpen: isEligibilityOpen, onOpen: onEligibilityOpen, onClose: onEligibilityClose } = useDisclosure();
  const { isOpen: isModulesOpen, onOpen: onModulesOpen, onClose: onModulesClose } = useDisclosure();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTeacherRole, setSelectedTeacherRole] = useState<TeacherRole | null>(null);
  const [selectedCourseForEligibility, setSelectedCourseForEligibility] = useState<Course | null>(null);
  const [selectedCourseForModules, setSelectedCourseForModules] = useState<Course | null>(null);

  const [serverZeroIndexed, setServerZeroIndexed] = useState<boolean | null>(null);
  const firstDetectDoneRef = useRef(false);
  const isInitialMount = useRef(true);

  const backoff = async <T,>(fn: () => Promise<T>, tries = 3, base = 400): Promise<T> => {
    let lastErr: any;
    for (let i = 0; i < tries; i++) {
      try {
        return await fn();
      } catch (e) {
        lastErr = e;
        await new Promise(r => setTimeout(r, base * Math.pow(2, i)));
      }
    }
    throw lastErr;
  };

  const fetchTeacherRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const { data } = await backoff(() => api.get("/course-teacher", { withCredentials: true }));
      setTeacherRoles(data?.items || []);
    } catch {
      setTeacherRoles([]);
      toast.error("Müəllim rolları yüklənmədi");
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const effectiveApiPage = useCallback((uiPage: number) => {
    if (serverZeroIndexed === null) return uiPage;
    return serverZeroIndexed ? uiPage - 1 : uiPage;
  }, [serverZeroIndexed]);

  const detectIndexing = (uiPage: number, metaPageFromServer?: number) => {
    if (firstDetectDoneRef.current) return;
    if (typeof metaPageFromServer !== "number") return;
    const zero = metaPageFromServer === 0 || metaPageFromServer === uiPage - 1;
    setServerZeroIndexed(zero);
    firstDetectDoneRef.current = true;
  };

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);

      const apiPage = effectiveApiPage(1);

      const { data } = await backoff(() =>
        api.get<CoursesResponse>(
          `/courses?page=${apiPage}&limit=${ADMIN_COURSES_LIST_LIMIT}&includeUnpublished=true&sortOrder=desc`,
          { withCredentials: true }
        )
      );

      detectIndexing(1, data?.meta?.page);

      const sorted = sortCoursesByOrderDesc(data?.items || []);
      setAllCoursesSorted(sorted);
      const total = data?.meta?.total ?? sorted.length;
      setTotalCourses(total);
      setTotalPages(Math.max(1, Math.ceil(total / rowsPerPage)));
      const lastPage = Math.max(1, Math.ceil(total / rowsPerPage));
      setPage((p) => Math.min(p, lastPage));
    } catch {
      setAllCoursesSorted([]);
      setTotalCourses(0);
      setTotalPages(null);
      toast.error("Kurslar yüklənə bilmədi");
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, effectiveApiPage]);

  const courses = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return allCoursesSorted.slice(start, start + rowsPerPage);
  }, [allCoursesSorted, page, rowsPerPage]);

  // Close modals and reset selections when page changes
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Reset all selected items first to prevent modal from opening with stale data
    setSelectedCourse(null);
    setSelectedTeacherRole(null);
    setSelectedCourseForEligibility(null);
    setSelectedCourseForModules(null);
    
    // Close all modals when page changes
    onTeachersClose();
    onEligibilityClose();
    onModulesClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // Only depend on page change

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchTeacherRoles();
  }, [fetchTeacherRoles]);

  const handleTeachers = (course: Course, role: TeacherRole) => {
    if (loading) return; // Prevent opening modal while loading
    if (!course?.id || !role?.id) {
      toast.error("Kurs və ya müəllim rolu seçilməyib");
      return;
    }
    // Set state first, then open modal to ensure data is available
    setSelectedCourse(course);
    setSelectedTeacherRole(role);
    onTeachersOpen();
  };
  
  const handleTeachersClose = () => {
    onTeachersClose();
    // Reset selected items when modal closes
    setSelectedCourse(null);
    setSelectedTeacherRole(null);
  };

  const handleEligibilityModal = (course: Course) => {
    if (loading) return; // Prevent opening modal while loading
    setSelectedCourseForEligibility(course);
    onEligibilityOpen();
  };
  
  const handleModulesModal = (course: Course) => {
    if (loading) return; // Prevent opening modal while loading
    setSelectedCourseForModules(course);
    onModulesOpen();
  };
  
  const handleEligibilityClose = () => {
    onEligibilityClose();
    setSelectedCourseForEligibility(null);
  };
  
  const handleModulesClose = () => {
    onModulesClose();
    setSelectedCourseForModules(null);
  };

  /** String saxlanır ki, cədvəldə rəqəm yazarkən ara vəziyyətlər (məs. "1" → "12") pozulmasın. */
  const [orderDrafts, setOrderDrafts] = useState<Record<string, string | undefined>>(
    {},
  );
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

  const handleOrderChange = (courseId: string, value: string) => {
    const normalized = value.replace(/\D/g, "");
    setOrderDrafts((prev) => ({
      ...prev,
      [courseId]: normalized,
    }));
  };

  const parseOrderDraft = (s: string | undefined, fallback: number) => {
    if (s === undefined) return fallback;
    if (s === "") return 0;
    const n = parseInt(s, 10);
    return Number.isNaN(n) ? fallback : n;
  };

  const handleOrderSave = async (courseId: string, currentOrder: number) => {
    const draft = orderDrafts[courseId];
    const nextOrder = parseOrderDraft(draft, currentOrder);
    if (nextOrder === currentOrder) return;
    try {
      setSavingOrderId(courseId);
      await api.patch(
        "/courses/reorder/bulk",
        { items: [{ id: courseId, order: nextOrder }] },
        { withCredentials: true },
      );
      toast.success("Sıralama yeniləndi");
      await fetchCourses();
      setOrderDrafts((prev) => {
        const next = { ...prev };
        delete next[courseId];
        return next;
      });
    } catch {
      toast.error("Sıralama yenilənə bilmədi");
    } finally {
      setSavingOrderId(null);
    }
  };

  const columns = useMemo(
    () => [
      { name: "SIRA", uid: "order" },
      { name: "BAŞLIQ", uid: "title" },
      { name: "TƏSVİR", uid: "description" },
      { name: "MÜDDƏT", uid: "duration" },
      { name: "STATUS", uid: "published" },
      { name: "MODULLAR VƏ TƏLƏBLƏR", uid: "eligibility" },
      { name: "MÜƏLLİMLƏR", uid: "teachers" },
      { name: "YARADILMA TARİXİ", uid: "createdAt" },
      { name: "ƏMƏLİYYATLAR", uid: "actions" },
    ],
    []
  );

  const renderCell = (course: Course, columnKey: string) => {
    switch (columnKey) {
      case "order": {
        const currentOrder = Number(course.order ?? 0);
        const draft = orderDrafts[course.id];
        const inputValue = draft !== undefined ? draft : String(currentOrder);
        const parsed = parseOrderDraft(draft, currentOrder);
        const isDirty = draft !== undefined && parsed !== currentOrder;
        const isSaving = savingOrderId === course.id;
        return (
          <div className="flex max-w-[120px] items-center gap-1">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={inputValue}
              onChange={(e) => handleOrderChange(course.id, e.target.value)}
              className="h-8 w-16 min-w-0 rounded-medium border border-default-200 bg-default-100 px-1 text-center text-sm text-foreground focus:border-warning focus:outline-none focus:ring-1 focus:ring-warning"
              aria-label="Sıralama"
            />
            <Tooltip content={isDirty ? "Sıranı yadda saxla" : "Dəyişiklik yoxdur"}>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color={isDirty ? "warning" : "default"}
                isLoading={isSaving}
                isDisabled={!isDirty || isSaving}
                onClick={() => handleOrderSave(course.id, currentOrder)}
              >
                <MdSave size={16} />
              </Button>
            </Tooltip>
          </div>
        );
      }
      case "title":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{course.title.az}</p>
            <p className="text-tiny text-default-400">{course.title.en}</p>
          </div>
        );
      case "description":
        return (
          <div className="flex flex-col">
            <p className="text-small">
              {course.description.az.length > 100
                ? `${course.description.az.substring(0, 100)}...`
                : course.description.az}
            </p>
            <Link href={`/az/tedris-saheleri/${course.slug.az}`} target="_blank" rel="noopener noreferrer">
              <p className="text-primary text-tiny">Ətraflı</p>
            </Link>
          </div>
        );
      case "duration":
        return (
          <p className="text-small">
            {formatCourseDurationMonths(Number(course.duration))} ay
          </p>
        );
      case "published":
        return (
          <Chip className="capitalize" color={course.published ? "success" : "warning"} size="sm" variant="flat">
            {course.published ? "Aktiv" : "Deaktiv"}
          </Chip>
        );
      case "teachers":
        return rolesLoading ? (
          <Spinner size="sm" color="warning" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {teacherRoles?.map((role) => (
              <Button
                key={role.id}
                size="sm"
                variant="flat"
                onClick={() => handleTeachers(course, role)}
                startContent={""}
              >
                <Image
                src={'/logos/icon.png'}
                alt="icon"
                width={20}
                height={20}
                className="mr-1 rounded-full"
                />
                {role.title}
              </Button>
            ))}
          </div>
        );
      case "eligibility":
        return (
          <div className="flex flex-wrap gap-1 items-center">
            <div className="flex flex-col">
              <p className="text-small">Modullar: {course.modules?.length || 0}</p>
              <p className="text-small">Tələblər: {course.eligibility?.length || 0}</p>
            </div>
            <div className="flex gap-1">
              <Tooltip content="Modulları idarə et">
                <Button isIconOnly variant="light" size="sm" onClick={() => handleModulesModal(course)}>
                  <MdViewModule className="text-default-400" size={20} />
                </Button>
              </Tooltip>
              <Tooltip content="Tələbləri idarə et">
                <Button isIconOnly variant="light" size="sm" onClick={() => handleEligibilityModal(course)}>
                  <MdSettings className="text-default-400" size={20} />
                </Button>
              </Tooltip>
            </div>
          </div>
        );
      case "createdAt":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{new Date(course.createdAt).toLocaleDateString("az-AZ")}</p>
            <p className="text-bold text-tiny text-default-400">{new Date(course.createdAt).toLocaleTimeString("az-AZ")}</p>
          </div>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Tooltip content="Düzəliş et">
              <Button isIconOnly variant="light" size="sm" onClick={() => router.push(`/dashboard/courses/edit/${course.id}`)}>
                <MdEdit className="text-default-400" size={20} />
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Kurslar</h1>
            <p className="text-gray-500">Kursları idarə edin</p>
          </div>
          <div className="flex gap-2 items-center">
            <Link href="/dashboard/eligibilities">
              <Button color="primary" className="bg-jsyellow text-white" startContent={<MdShield size={24} />}>
                Tələblər
              </Button>
            </Link>
            <Link href="/dashboard/modules">
              <Button color="primary" className="bg-jsyellow text-white" startContent={<MdViewModule size={24} />}>
                Modullar
              </Button>
            </Link>
            <Button
              color="primary"
              className="bg-jsyellow text-white"
              startContent={<MdAdd size={24} />}
              onClick={() => router.push("/dashboard/courses/create")}
            >
              Yeni Kurs
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto rounded-xl border border-default-200 bg-content1 shadow-sm">
              <table
                className="w-full min-w-[960px] border-collapse text-small"
                aria-label="Kurslar cədvəli"
              >
                <thead>
                  <tr className="border-b border-default-200 bg-default-100">
                    {columns.map((column) => (
                      <th
                        key={column.uid}
                        scope="col"
                        className={
                          column.uid === "actions"
                            ? "px-3 py-3 text-center font-semibold text-foreground-600"
                            : "px-3 py-3 text-left font-semibold text-foreground-600"
                        }
                      >
                        {column.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-default-100 transition-colors last:border-b-0 hover:bg-default-50/80"
                    >
                      {columns.map((column) => (
                        <td
                          key={column.uid}
                          className={
                            column.uid === "actions"
                              ? "px-3 py-3 align-middle text-center"
                              : "px-3 py-3 align-middle"
                          }
                        >
                          {renderCell(course, column.uid)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="warning"
                page={page}
                total={totalPages ?? Math.max(1, Math.ceil(totalCourses / rowsPerPage))}
                onChange={(p) => setPage(p)}
              />
            </div>
          </div>
        )}

        {isModulesOpen && selectedCourseForModules && !loading && (
          <ModulesModal
            isOpen={isModulesOpen}
            onClose={handleModulesClose}
            courseId={selectedCourseForModules.id}
            course={selectedCourseForModules}
            onUpdate={fetchCourses}
          />
        )}

        {isTeachersOpen && 
         selectedCourse && 
         selectedTeacherRole && 
         selectedCourse.id && 
         selectedTeacherRole.id && 
         !loading && (
          <TeachersModal
            isOpen={isTeachersOpen}
            onClose={handleTeachersClose}
            teacherRoleId={selectedTeacherRole.id}
            courseId={selectedCourse.id}
            course={selectedCourse}
            onUpdate={fetchCourses}
          />
        )}

        {isEligibilityOpen && selectedCourseForEligibility && !loading && (
          <EligibilityModal
            isOpen={isEligibilityOpen}
            onClose={handleEligibilityClose}
            courseId={selectedCourseForEligibility.id}
            course={selectedCourseForEligibility}
            onUpdate={fetchCourses}
          />
        )}
      </motion.div>
    </div>
  );
}
