"use client";
import { Role } from "@/types/enums";
import api from "@/utils/api/axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import UsersForm from "@/components/views/dashboard/users/users-form";

interface CreateUserFormInputs {
  name: string;
  surname?: string;
  position?: string;
  nameEn?: string;
  surnameEn?: string;
  positionEn?: string;
  email: string;
  password: string;
  role: Role;
  avatar?: File;
}

export default function CreateUserPage() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormInputs>({
    defaultValues: {
      name: "",
      surname: "",
      position: "",
      nameEn: "",
      surnameEn: "",
      positionEn: "",
      email: "",
      password: "",
      role: Role.USER,
    },
  });

  const selectedRole = watch("role", Role.USER);
  const isAuthor = selectedRole === Role.AUTHOR;

  const onSubmit = async (data: CreateUserFormInputs) => {
    try {
      const fullName = data.surname
        ? `${data.name} ${data.surname}`.trim()
        : data.name;

      if (data.avatar) {
        const formData = new FormData();
        formData.append("name", fullName);
        if (data.surname) formData.append("surname", data.surname);
        if (data.position) formData.append("position", data.position);
        if (data.nameEn) formData.append("nameEn", data.nameEn);
        if (data.surnameEn) formData.append("surnameEn", data.surnameEn);
        if (data.positionEn) formData.append("positionEn", data.positionEn);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("role", data.role);
        formData.append("avatar", data.avatar);

        const response = await api.post("/auth/register", formData);
        if (response.status === 201) {
          toast.success("İstifadəçi uğurla yaradıldı");
          router.push("/dashboard/users");
          router.refresh();
        }
      } else {
        const payload: any = {
          ...data,
          name: fullName,
        };
        delete payload.avatar;

        const response = await api.post("/auth/register", payload);
        if (response.status === 201) {
          toast.success("İstifadəçi uğurla yaradıldı");
          router.push("/dashboard/users");
          router.refresh();
        }
      }
    } catch (error: any) {
      console.error("İstifadəçi yaradılması uğursuz oldu:", error);
      toast.error(
        error.response?.data?.message || "Xəta baş verdi. Yenidən cəhd edin"
      );
    }
  };

  return (
    <UsersForm
      mode="create"
      onSubmit={onSubmit}
      register={register}
      control={control}
      errors={errors}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      router={router}
      isAuthor={isAuthor}
      watch={watch}
      setValue={setValue}
    />
  );
}
