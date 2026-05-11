"use client";
import { Course, Eligibility } from "@/types/course";
import api from "@/utils/api/axios";
import { getIcon } from "@/utils/icon";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
} from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import { MdClose, MdSearch } from "react-icons/md";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
  onUpdate: () => void;
  course: Course;
}

export default function EligibilityModal({
  isOpen,
  onClose,
  courseId,
  onUpdate,
  course,
}: Props) {
  const [eligibilities, setEligibilities] = useState<Eligibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [assignedOrderMap, setAssignedOrderMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !courseId) return;
      try {
        setLoading(true);
        const { data } = await api.get("/course-eligibility?limit=100");
        setEligibilities(data.items);
      } catch (error) {
        console.error("Tələblər yüklənmədi:", error);
        toast.error("Tələblər yüklənə bilmədi");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, courseId]);

  /** Modal bağlananda axtarışı sıfırlayırıq. */
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setAssignedOrderMap({});
    }
  }, [isOpen]);

  useEffect(() => {
    const next: Record<string, number> = {};
    (course?.eligibility || []).forEach((item: any) => {
      if (item?.eligibilityId) {
        next[item.eligibilityId] = Number(item.order ?? 0);
      }
    });
    setAssignedOrderMap(next);
  }, [course?.eligibility, isOpen]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredEligibilities = useMemo(() => {
    if (!normalizedSearch) return eligibilities;
    return eligibilities.filter((e) => {
      const titleAz = (e.title?.az || "").toLowerCase();
      const titleEn = (e.title?.en || "").toLowerCase();
      const descAz = (e.description?.az || "").toLowerCase();
      const descEn = (e.description?.en || "").toLowerCase();
      return (
        titleAz.includes(normalizedSearch) ||
        titleEn.includes(normalizedSearch) ||
        descAz.includes(normalizedSearch) ||
        descEn.includes(normalizedSearch)
      );
    });
  }, [eligibilities, normalizedSearch]);

  const getAssignedEligibility = (eligibilityId: string) =>
    course?.eligibility?.find((e) => e.eligibilityId === eligibilityId);

  const handleCheckboxChange = async (
    eligibilityId: string,
    isSelected: boolean
  ) => {
    try {
      if (isSelected) {
        const nextOrder = course?.eligibility?.length
          ? course.eligibility.length + 1
          : 1;
        await api.post(
          `/course-eligibility/${eligibilityId}/courses/${courseId}`,
          { order: nextOrder }
        );
        setAssignedOrderMap((prev) => ({ ...prev, [eligibilityId]: nextOrder }));
        toast.success("Tələb əlavə edildi");
      } else {
        await api.delete(
          `/course-eligibility/${eligibilityId}/courses/${courseId}`
        );
        setAssignedOrderMap((prev) => {
          const next = { ...prev };
          delete next[eligibilityId];
          return next;
        });
        toast.success("Tələb silindi");
      }
      onUpdate();
      const { data } = await api.get("/course-eligibility?limit=100");
      setEligibilities(data.items);
    } catch (error) {
      console.error("Əməliyyat xətası:", error);
      toast.error("Əməliyyat uğursuz oldu");
    }
  };

  const handleOrderChange = async (eligibilityId: string, value: string) => {
    try {
      await api.patch(
        `/course-eligibility/${eligibilityId}/courses/${courseId}/order`,
        { order: Number(value) || 0 }
      );
      setAssignedOrderMap((prev) => ({
        ...prev,
        [eligibilityId]: Number(value) || 0,
      }));
      toast.success("Tələb sırası yeniləndi");
    } catch (error) {
      console.error("Sıra yenilənmədi:", error);
      toast.error("Sıra yenilənə bilmədi");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">Kurs Tələbləri</h2>
              <p className="text-small text-default-500">
                {course.title.az} kursu üçün tələbləri seçin
              </p>
            </ModalHeader>
            <ModalBody className="!bg-white">
              <Input
                value={search}
                onValueChange={setSearch}
                placeholder="Tələb başlığı və ya təsviri üzrə axtarış..."
                size="sm"
                variant="bordered"
                startContent={
                  <MdSearch className="text-default-400" size={20} />
                }
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
              <ScrollShadow className="!bg-white max-h-[500px] shadow-none">
                <div className="grid !bg-white grid-cols-1 gap-4">
                  {loading ? (
                    <p>Yüklənir...</p>
                  ) : filteredEligibilities.length === 0 ? (
                    <p className="py-6 text-center text-sm text-default-500">
                      {normalizedSearch
                        ? "Axtarışa uyğun tələb tapılmadı"
                        : "Heç bir tələb yoxdur"}
                    </p>
                  ) : (
                    filteredEligibilities.map((eligibility) => {
                      const IconComponent = getIcon(eligibility.icon);
                      const assigned = getAssignedEligibility(eligibility.id);
                      const isSelected = Boolean(assigned);
                      const assignedOrder =
                        assignedOrderMap[eligibility.id] ?? Number(assigned?.order ?? 0);

                      return (
                        <Card
                          key={eligibility.id}
                          className={`p-4 transition-all shadow-none duration-200 ${
                            isSelected
                              ? "border-2 border-jsyellow bg-jsyellow/5"
                              : "hover:border-jsyellow/50 border-2 border-gray-400"
                          }`}
                        >
                          <Checkbox
                            classNames={{
                              label: "w-full",
                              wrapper: "before:border-jsyellow",
                            }}
                            isSelected={isSelected}
                            onValueChange={(isSelected) =>
                              handleCheckboxChange(eligibility.id, isSelected)
                            }
                          >
                            <div className="flex items-center gap-3 w-full">
                              <span className="material-icons text-jsyellow text-xl mt-1">
                                <IconComponent className="w-6 h-6" />
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-foreground">
                                  {eligibility.title.az}
                                </p>
                                <p className="text-small text-default-500 mt-1">
                                  {eligibility.description.az}
                                </p>
                              </div>
                            </div>
                          </Checkbox>
                          {isSelected ? (
                            <Input
                              className="mt-3 max-w-32"
                              type="number"
                              min={0}
                              label="Sıra"
                              size="sm"
                              defaultValue={String(assignedOrder)}
                              key={`eligibility-order-${eligibility.id}-${assignedOrder}`}
                              onBlur={(event) =>
                                handleOrderChange(
                                  eligibility.id,
                                  (event.target as HTMLInputElement).value
                                )
                              }
                            />
                          ) : null}
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollShadow>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} className="font-medium">
                Bağla
              </Button>
              <Button
                color="warning"
                variant="flat"
                className="bg-jsyellow text-white font-medium"
                onPress={onClose}
              >
                Təsdiqlə
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
