// app/(whatever)/TeamSectionMap.tsx  — SERVER COMPONENT
import api from "@/utils/api/axios";
import { getTranslations } from "next-intl/server";
import React from "react";
import TeamSection from "../about/team-section";

export default async function TeamSectionMap() {
  const [t, teamRes] = await Promise.all([
    getTranslations("aboutPage"),
    api.get("/team/active?limit=30").catch((err) => {
      console.error("Team fetch failed:", err);
      return { data: [] };
    }),
  ]);
  const teamMembers: any[] = teamRes.data ?? [];

  if (!teamMembers.length) return null;

  return (
    <TeamSection
      teamMembers={teamMembers}
      title={t("team.title")}
      description={t("team.description")}
      isSlider={true}
    />
  );
}
