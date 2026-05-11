import { CourseEligibility } from "@/types/course";
import type { Locale } from "@/i18n/request";
import { getIcon } from "@/utils/icon";

interface IEligibilitySectionProps {
  eligibility: CourseEligibility[];
  title: string;
  locale: Locale;
}

export default function EligibilitySection({
  eligibility,
  title,
  locale,
}: IEligibilitySectionProps) {
  const langKey: "az" | "en" = locale === "ru" ? "az" : locale;
  const sortedEligibility = [...(eligibility || [])].sort(
    (a, b) => Number(b?.order ?? 0) - Number(a?.order ?? 0)
  );
  return (
    <div className="mt-12 md:mt-20 pt-6 md:pt-10">
      <div className="w-10/12 lg:w-1/2 mx-auto text-jsblack text-center flex flex-col gap-4 [@media(min-width:3500px)]:!gap-10 mb-5 justify-center items-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl [@media(min-width:3500px)]:!text-5xl font-bold leading-[1.3] whitespace-nowrap">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {sortedEligibility.map((criteria, index) => {
          if (!criteria.eligibility) return null;
          const IconComponent = getIcon(criteria.eligibility.icon);

          return (
            <div
              key={index}
              className="bg-[#fef7eb] border border-jsyellow rounded-[32px] p-6 
                transition-all duration-300 ease-in-out hover:scale-[1.02] 
                hover:shadow-lg hover:shadow-[rgba(252,174,30,0.15)]"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="bg-jsyellow text-white p-4 rounded-full">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="font-semibold [@media(min-width:3500px)]:!text-3xl text-xl">
                  {criteria.eligibility.title[langKey]}
                </h3>
                <p className="text-gray-600 [@media(min-width:3500px)]:!text-2xl">
                  {criteria.eligibility.description[langKey]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
