"use client";

import TeamMemberForm from "@/components/views/dashboard/team/team-member-form";
import { TeamMemberFormInputs } from "@/types/team";
import api from "@/utils/api/axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CreateTeamMemberPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeamMemberFormInputs>();

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
      
      // Bio fields - send as nested object fields
      formData.append("bio[az]", data.bio.az);
      if (data.bio.en) {
        formData.append("bio[en]", data.bio.en);
      }
      
      // Image
      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      const response = await api.post("/team", formData);

      if (response.status === 201) {
        toast.success("Komanda üzvü uğurla əlavə edildi");
        router.push("/dashboard/team");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Yaradılma xətası:", error);
      toast.error(
        error.response?.data?.message || "Xəta baş verdi. Yenidən cəhd edin"
      );
    }
  };

  return (
    <TeamMemberForm
      mode="create"
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
