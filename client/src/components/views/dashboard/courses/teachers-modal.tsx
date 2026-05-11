"use client";

import { Course } from "@/types/course";
import { CourseTeacherAssignment, TeamMember } from "@/types/team";
import api from "@/utils/api/axios";
import {
  Avatar,
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  Spinner,
} from "@nextui-org/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
  teacherRoleId?: string;
  onUpdate: () => void;
  course: Course;
}

const backoff = async <T,>(fn: () => Promise<T>, tries = 3, base = 400): Promise<T> => {
  let lastErr: any;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) {
        await new Promise(r => setTimeout(r, base * Math.pow(2, i)));
      }
    }
  }
  throw lastErr;
};

export default function TeachersModal({
  isOpen,
  onClose,
  courseId,
  teacherRoleId,
  onUpdate,
  course,
}: Props) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<CourseTeacherAssignment[]>([]);
  const [positions, setPositions] = useState<{ [key: string]: string }>({});
  
  // Use ref to track if we should fetch data
  const shouldFetchRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset all state when modal closes
  const resetState = useCallback(() => {
    setTeamMembers([]);
    setAssignments([]);
    setPositions({});
    setLoading(false);
    shouldFetchRef.current = false;
    
    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  // Fetch data when modal opens with valid props
  useEffect(() => {
    // Don't fetch if modal is closed
    if (!isOpen) {
      return;
    }

    // Validate required props
    if (!courseId || !teacherRoleId) {
      console.warn("TeachersModal: Missing required props", { courseId, teacherRoleId });
      toast.error("Kurs və ya müəllim rolu seçilməyib");
      resetState();
      return;
    }

    // Prevent duplicate fetches
    if (shouldFetchRef.current) {
      return;
    }

    shouldFetchRef.current = true;
    setLoading(true);

    // Create abort controller for this fetch
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const fetchData = async () => {
      try {
        // Fetch data with retry mechanism and credentials
        const [teamResult, assignmentsResult] = await Promise.allSettled([
          backoff(() => api.get("/team?limit=100", { withCredentials: true })),
          backoff(() => api.get(`/course-teacher/${teacherRoleId}?limit=100`, { withCredentials: true })),
        ]);

        // Check if request was aborted
        if (abortController.signal.aborted) {
          return;
        }

        // Handle team members response
        if (teamResult.status === "fulfilled") {
          setTeamMembers(teamResult.value.data?.items || []);
        } else {
          console.error("Team members yüklənmədi:", teamResult.reason);
          if (!abortController.signal.aborted) {
            toast.error("Komanda üzvləri yüklənə bilmədi");
          }
        }

        // Handle assignments response
        if (assignmentsResult.status === "fulfilled") {
          const assignmentsData = assignmentsResult.value.data;
          const courses = assignmentsData?.courses || [];
          
          const courseAssignments = courses
            .filter((a: any) => a.courseId === courseId)
            .map((a: any) => ({
              teacherId: a.teacherId,
              courseId: a.courseId,
              position: a.position,
              teacher: a.teacher,
            }));

          setAssignments(courseAssignments);

          const positionsMap: { [key: string]: string } = {};
          courseAssignments.forEach((assignment: CourseTeacherAssignment) => {
            if (assignment.position) {
              positionsMap[assignment.teacherId] = assignment.position;
            }
          });
          setPositions(positionsMap);
        } else {
          console.error("Təyinatlar yüklənmədi:", assignmentsResult.reason);
          if (!abortController.signal.aborted) {
            toast.error("Kurs təyinatları yüklənə bilmədi");
          }
        }
      } catch (error: any) {
        // Don't show error if request was aborted
        if (error?.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }
        console.error("Məlumatlar yüklənmədi:", error);
        toast.error("Məlumatlar yüklənə bilmədi");
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
        abortControllerRef.current = null;
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [isOpen, courseId, teacherRoleId, resetState]);

  const handleAssign = useCallback(async (teamId: string) => {
    if (!teacherRoleId || !courseId) return;
    
    const currentPosition = positions[teamId] || "";
    
    try {
      await backoff(() =>
        api.post(
          `/course-teacher/${teacherRoleId}/courses/${courseId}/team/${teamId}`,
          {
            position: currentPosition,
          },
          { withCredentials: true }
        )
      );
      toast.success("Müəllim əlavə edildi");
      
      const teacher = teamMembers.find((t) => t.id === teamId);
      if (teacher) {
        setAssignments((prev) => [
          ...prev.filter((a) => a.teacherId !== teamId),
          {
            teacherId: teamId,
            courseId: courseId,
            position: currentPosition,
            teacher,
          },
        ]);
      }
      onUpdate();
    } catch (error) {
      console.error("Müəllim əlavə edilmədi:", error);
      toast.error("Əməliyyat uğursuz oldu");
    }
  }, [teacherRoleId, courseId, positions, teamMembers, onUpdate]);

  const handleUnassign = useCallback(async (teamId: string) => {
    if (!teacherRoleId || !courseId) return;
    
    try {
      await backoff(() =>
        api.delete(
          `/course-teacher/${teacherRoleId}/courses/${courseId}/team/${teamId}`,
          { withCredentials: true }
        )
      );
      toast.success("Müəllim silindi");
      
      setAssignments((prev) => prev.filter((a) => a.teacherId !== teamId));
      setPositions((prev) => {
        const newPositions = { ...prev };
        delete newPositions[teamId];
        return newPositions;
      });
      onUpdate();
    } catch (error) {
      console.error("Müəllim silinmədi:", error);
      toast.error("Əməliyyat uğursuz oldu");
    }
  }, [teacherRoleId, courseId, onUpdate]);

  const handleToggle = useCallback((teamId: string, isSelected: boolean) => {
    if (isSelected) {
      handleAssign(teamId);
    } else {
      handleUnassign(teamId);
    }
  }, [handleAssign, handleUnassign]);

  const handlePositionChange = useCallback((teamId: string, position: string) => {
    setPositions((prev) => ({ ...prev, [teamId]: position }));
  }, []);


  const renderTeamMember = (member: TeamMember) => {
    const isAssigned = assignments.some((a) => a.teacherId === member.id);

    return (
      <div
        key={member.id}
        className="flex items-center gap-4 p-2 rounded-lg hover:bg-default-100"
      >
        <Checkbox
          isSelected={isAssigned}
          onValueChange={(isSelected) => handleToggle(member.id, isSelected)}
        />
        <Avatar
          src={member.imageUrl ? `${process.env.NEXT_PUBLIC_CDN_URL || ""}/${member.imageUrl}` : undefined}
          size="sm"
          className="flex-shrink-0"
        />
        <div className="flex-grow">
          <p className="font-medium">
            {typeof member.fullName === 'string' ? member.fullName : member.fullName?.az || ""}
          </p>
          <p className="text-small text-default-500">
            {typeof member.bio === 'string' ? member.bio : member.bio?.az || ""}
          </p>
        </div>
        <div className="w-48">
          <Input
            type="text"
            placeholder="Vəzifə"
            size="sm"
            value={positions[member.id] || ""}
            onChange={(e) => handlePositionChange(member.id, e.target.value)}
            disabled={!isAssigned}
            onBlur={() => {
              if (isAssigned && positions[member.id]) {
                handleAssign(member.id);
              }
            }}
          />
        </div>
      </div>
    );
  };

  // Don't render modal if required props are missing
  if (!courseId || !teacherRoleId) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">Kurs Müəllimləri</h2>
              <p className="text-small text-default-500">
                {course?.title?.az || "Kurs"} üçün müəllimləri seçin
              </p>
            </ModalHeader>
            <ModalBody>
              <ScrollShadow className="max-h-[500px]">
                <div className="flex flex-col gap-3">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Spinner size="lg" color="warning" />
                      <span className="ml-3 text-default-500">Yüklənir...</span>
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <p className="text-center text-default-500 py-8">
                      Komanda üzvləri tapılmadı
                    </p>
                  ) : (
                    teamMembers
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map(renderTeamMember)
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
        )}
      </ModalContent>
    </Modal>
  );
}
