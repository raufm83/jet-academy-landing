"use client";
import UsersForm from "@/components/views/dashboard/users/users-form";
import { Role } from "@/types/enums";
import api from "@/utils/api/axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface UpdateUserFormInputs {
  name: string;
  surname?: string;
  position?: string;
  nameEn?: string;
  surnameEn?: string;
  positionEn?: string;
  email: string;
  password?: string;
  role: Role;
  categoryId?: string;
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserFormInputs>();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get(`/users/${params.id}`);
        const isAuthor = data.role === Role.AUTHOR;
        const sl = data.profile?.socialLinks as {
          authorName?: { az?: string; en?: string };
          authorSurname?: { az?: string; en?: string };
          authorPosition?: { az?: string; en?: string };
        } | undefined;
        const parts = (data.name || "").trim().split(/\s+/);
        const nameAz = isAuthor && sl?.authorName?.az ? sl.authorName.az : (parts[0] ?? "");
        const surnameAz = isAuthor && (sl?.authorSurname?.az !== undefined) ? (sl.authorSurname.az ?? "") : (parts.slice(1).join(" ") ?? "");
        reset({
          name: nameAz,
          surname: surnameAz,
          position: data.profile?.profession ?? "",
          nameEn: sl?.authorName?.en ?? "",
          surnameEn: sl?.authorSurname?.en ?? "",
          positionEn: sl?.authorPosition?.en ?? "",
          email: data.email,
          role: data.role,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("İstifadəçi məlumatları yüklənmədi");
        router.push("/dashboard/users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [params.id, reset, router]);

  const onSubmit = async (data: UpdateUserFormInputs) => {
    try {
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password;
      }

      const response = await api.patch(`/users/${params.id}`, payload);

      if (response.status === 200) {
        toast.success("İstifadəçi məlumatları yeniləndi");
        router.push("/dashboard/users");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(
        error.response?.data?.message || "Xəta baş verdi. Yenidən cəhd edin"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 min-h-screen w-full flex items-center justify-center">
        <p>Yüklənir...</p>
      </div>
    );
  }

  return (
    <UsersForm
      mode="edit"
      onSubmit={onSubmit}
      register={register}
      control={control}
      errors={errors}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      router={router}
      showPasswordField={session?.user?.role === Role.ADMIN}
      isAuthor={watch("role") === Role.AUTHOR}
      watch={watch}
      setValue={setValue}
    />
  );
}
