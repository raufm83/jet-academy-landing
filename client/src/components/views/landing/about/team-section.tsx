import SectionTitle from "@/components/shared/section-title";
import { TeamMember } from "@/types/team";
import { getLocale } from "next-intl/server";
import { Locale } from "@/i18n/request";
import TeamSlider from "./team-slider";
import TeamMemberCard from "./team-member-card";

interface TeamSectionProps {
  title: string;
  description?: string;
  teamMembers: TeamMember[];
  isSlider?: boolean;
}

export default async function TeamSection({
  title,
  description,
  teamMembers,
  isSlider = true,
}: TeamSectionProps) {
  const locale = (await getLocale()) as Locale;

  if (!isSlider) {
    return (
      <section className="container mx-auto px-4 mt-10">
        <SectionTitle title={title} description={description} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mt-12">
          {teamMembers.map((teamMember: TeamMember, index) => (
            <TeamMemberCard
              key={teamMember.id}
              member={teamMember}
              locale={locale}
              index={index}
              loadEager={index < 2}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 mt-10 w-full overflow-hidden">
      <SectionTitle title={title} description={description} />
      <TeamSlider teamMembers={teamMembers} locale={locale} />
    </section>
  );
}