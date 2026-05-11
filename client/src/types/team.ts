interface MultilingualText {
  az: string;
  en?: string;
}

export interface TeamMember {
  id: string;
  name: MultilingualText;
  surname: MultilingualText;
  fullName: MultilingualText;
  imageUrl: string;
  imageAlt?: MultilingualText;
  bio: {
    az: string;
    en: string;
  };
  order: number;
  createdAt: string;
  isActive: boolean;
}

export interface TeamMemberFormInputs {
  name: MultilingualText;
  surname: MultilingualText;
  fullName?: MultilingualText;
  image: File[];
  bio: {
    az: string;
    en: string;
  };
}
export interface CourseTeacherAssignment {
  teacherId: string;
  courseId: string;
  position?: string;
  teacher: TeamMember;
}
export interface CourseTeacherRole {
  id: string;
  title: string;
  description: {
    az: string;
    en: string;
  };
  courses: {
    course: {
      id: string;
      title: {
        az: string;
        en: string;
      };
    };
    teacher: {
      id: string;
      fullName: MultilingualText;
      imageUrl: string;
      bio: {
        az: string;
        en: string;
      };
    };
    position?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseTeacherAsMember {
  id: string;
  position: string | null;
  courseId: string;
  teacherId: string;
  courseTeacherId: string;
  createdAt: string;
  teacher: TeamMember;
  courseTeacher: CourseTeacherRole;
  imageUrl: string;
  fullName: MultilingualText;
  bio: {
    az: string;
    en: string;
  };
}

export interface CourseTeacherResponse {
  items: CourseTeacherRole[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CourseTeacherFormInputs {
  title: string;
  description: {
    az: string;
    en: string;
  };
}
