import { Course, Module } from "@/types/course";
import api from "@/utils/api/axios";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  Tooltip,
} from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { MdArrowUpward, MdArrowDownward, MdSearch, MdClose } from "react-icons/md";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
  onUpdate: () => void;
  course: Course;
}

export default function ModulesModal({
  isOpen,
  onClose,
  courseId,
  onUpdate,
  course,
}: Props) {
  const [modules, setModules] = useState<Module[]>([]);
  const [localCourseModules, setLocalCourseModules] = useState(course?.modules || []);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const courseModules = localCourseModules;

  /** Modalı bağlayanda axtarış filtrini sıfırlayırıq ki, yenidən açılanda təmiz başlasın. */
  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  useEffect(() => {
    setLocalCourseModules(course?.modules || []);
  }, [course?.modules, isOpen]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredModules = useMemo(() => {
    if (!normalizedSearch) return modules;
    return modules.filter((m) => {
      const titleAz = (m.title?.az || "").toLowerCase();
      const titleEn = (m.title?.en || "").toLowerCase();
      const descAz = (m.description?.az || "").toLowerCase();
      const descEn = (m.description?.en || "").toLowerCase();
      return (
        titleAz.includes(normalizedSearch) ||
        titleEn.includes(normalizedSearch) ||
        descAz.includes(normalizedSearch) ||
        descEn.includes(normalizedSearch)
      );
    });
  }, [modules, normalizedSearch]);

  useEffect(() => {
    const fetchModules = async () => {
      if (!isOpen || !courseId) return;
      try {
        setLoading(true);
        const { data } = await api.get("/course-modules?limit=1000");
        setModules(data.items);
      } catch (error) {
        console.error("Modullar yüklənmədi:", error);
        toast.error("Modullar yüklənə bilmədi");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [isOpen, courseId]);

  const handleAssign = async (moduleId: string) => {
    try {
      await api.post(`/course-modules/assign/${courseId}`, {
        moduleId,
        order: courseModules.length,
      });
      toast.success("Modul əlavə edildi");
      onClose();
      onUpdate();
    } catch (error) {
      console.error("Modul əlavə edilmədi:", error);
      toast.error("Əməliyyat uğursuz oldu");
    }
  };

  const handleUnassign = async (moduleId: string) => {
    try {
      await api.delete(`/course-modules/assign/${courseId}/${moduleId}`);
      toast.success("Modul silindi");
      onClose();
      onUpdate();
    } catch (error) {
      console.error("Modul silinmədi:", error);
      toast.error("Əməliyyat uğursuz oldu");
    }
  };

  const handleMove = async (moduleId: string, direction: "up" | "down") => {
    const currentModule = courseModules.find((m) => m.moduleId === moduleId);
    if (!currentModule) return;

    const newOrder =
      direction === "up" ? currentModule.order - 1 : currentModule.order + 1;

    try {
      await api.patch(
        `/course-modules/assign/${courseId}/${moduleId}/order/${newOrder}`
      );
      setLocalCourseModules((prev: any[]) =>
        prev
          .map((item) => {
            if (item.moduleId === moduleId) {
              return { ...item, order: newOrder };
            }
            if (direction === "up" && item.order >= newOrder && item.order < currentModule.order) {
              return { ...item, order: item.order + 1 };
            }
            if (direction === "down" && item.order <= newOrder && item.order > currentModule.order) {
              return { ...item, order: item.order - 1 };
            }
            return item;
          })
          .sort((a, b) => a.order - b.order)
      );
      toast.success("Sıralama yeniləndi");
    } catch (error) {
      console.error("Sıralama yenilənmədi:", error);
      toast.error("Əməliyyat uğursuz oldu");
    }
  };

  const handleToggle = (moduleId: string, isSelected: boolean) => {
    if (isSelected) {
      handleAssign(moduleId);
    } else {
      handleUnassign(moduleId);
    }
  };

  const renderModule = (module: Module) => {
    const isAssigned = courseModules.some((m) => m.moduleId === module.id);
    const assignedModule = courseModules.find(
      (m) => m.moduleId === module.id
    );

    return (
      <div
        key={module.id}
        className="flex items-center gap-4 p-2 rounded-lg hover:bg-default-100"
      >
        <Checkbox
          isSelected={isAssigned}
          onValueChange={(isSelected) => handleToggle(module.id, isSelected)}
        />
        <div className="flex-grow">
          <p className="font-medium">{module.title.az}</p>
          <p className="text-small text-default-500">{module.description.az}</p>
        </div>
        {isAssigned && (
          <div className="flex flex-col gap-1">
            <Tooltip content="Yuxarı">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                isDisabled={assignedModule?.order === 0}
                onClick={() => handleMove(module.id, "up")}
              >
                <MdArrowUpward className="text-default-400" size={20} />
              </Button>
            </Tooltip>
            <span className="text-tiny text-center text-default-400">
              Sıra: {(assignedModule?.order || 0) + 1}
            </span>
            <Tooltip content="Aşağı">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                isDisabled={assignedModule?.order === courseModules.length - 1}
                onClick={() => handleMove(module.id, "down")}
              >
                <MdArrowDownward className="text-default-400" size={20} />
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" backdrop="blur">
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Kurs Modulları</h2>
            <p className="text-small text-default-500">
              {course?.title?.az} kursu üçün modulları seçin
            </p>
          </ModalHeader>
          <ModalBody>
            <Input
              value={search}
              onValueChange={setSearch}
              placeholder="Modul başlığı və ya təsviri üzrə axtarış..."
              size="sm"
              variant="bordered"
              startContent={<MdSearch className="text-default-400" size={20} />}
              endContent={
                search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Axtarışı təmizlə"
                    className="text-default-400 hover:text-default-600"
                  >
                    <MdClose size={18} />
                  </button>
                ) : null
              }
              classNames={{ inputWrapper: "bg-default-50" }}
            />
            <ScrollShadow className="max-h-[500px]">
              <div className="flex flex-col gap-3">
                {loading ? (
                  <p>Yüklənir...</p>
                ) : filteredModules.length === 0 ? (
                  <p className="py-6 text-center text-sm text-default-500">
                    {normalizedSearch
                      ? "Axtarışa uyğun modul tapılmadı"
                      : "Heç bir modul yoxdur"}
                  </p>
                ) : (
                  [...filteredModules]
                    .sort((a, b) => {
                      const aOrder =
                        courseModules.find((m) => m.moduleId === a.id)
                          ?.order ?? Number.MAX_SAFE_INTEGER;
                      const bOrder =
                        courseModules.find((m) => m.moduleId === b.id)
                          ?.order ?? Number.MAX_SAFE_INTEGER;
                      return aOrder - bOrder;
                    })
                    .map(renderModule)
                )}
              </div>
            </ScrollShadow>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Bağla
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}