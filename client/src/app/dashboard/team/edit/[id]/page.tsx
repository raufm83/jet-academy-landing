"use client";

import TeamMemberForm from "@/components/views/dashboard/team/team-member-form";
import { TeamMemberFormInputs } from "@/types/team";
import api from "@/utils/api/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditTeamMemberPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeamMemberFormInputs>();

  useEffect(() => {
    const fetchTeamMember = async () => {
      try {
        const { data } = await api.get(`/team/${params.id}`);
        
        // Handle multilingual fields - ensure they're objects
        const formData = {
          ...data,
          name: typeof data.name === 'string' 
            ? { az: data.name, en: '' } 
            : (data.name || { az: '', en: '' }),
          surname: typeof data.surname === 'string' 
            ? { az: data.surname, en: '' } 
            : (data.surname || { az: '', en: '' }),
          // Handle bio - ensure it's an object with az and en
          bio: typeof data.bio === 'string' 
            ? { az: data.bio, en: '' } 
            : (data.bio || { az: '', en: '' }),
        };
        reset(formData);
      } catch (error) {
        console.error("Komanda üzvü məlumatlarını yükləmə xətası:", error);
        toast.error("Komanda üzvü məlumatları yüklənə bilmədi");
        router.push("/dashboard/team");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMember();
  }, [params.id, reset, router]);

  const onSubmit = async (data: TeamMemberFormInputs) => {
    try {
      const formData = new FormData();
      
      // Name fields
      formData.append("name[az]", data.name.az);
      if (data.name.en) {
        formData.append("name[en]", data.name.en);
      }
      
      // Surname fields
      formData.append("surname[az]", data.surname.az);
      if (data.surname.en) {
        formData.append("surname[en]", data.surname.en);
      }
      
      // Bio fields - send as nested object fields (not JSON string)
      formData.append("bio[az]", data.bio.az);
      if (data.bio.en) {
        formData.append("bio[en]", data.bio.en);
      }

      // Image (only if new image is provided)
      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      const response = await api.patch(`/team/${params.id}`, formData);

      if (response.status === 200) {
        toast.success("Komanda üzvü məlumatları uğurla yeniləndi");
        router.push("/dashboard/team");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Yeniləmə xətası:", error);
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
    <TeamMemberForm
      mode="edit"
      onSubmit={onSubmit}
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
      router={router}
      setValue={setValue}
    />
  );
}
