import React from "react";

interface ISectionTitle {
  title: string;
  description?: string;
  /** Başlıq altı məsafə (tailwind spacing class). Default: mb-8 */
  bottomSpacing?: string;
}
function SectionTitle({ title, description, bottomSpacing = "mb-8 sm:mb-10" }: ISectionTitle) {
  return (
    <div
      className={`w-10/12 lg:w-1/2 mx-auto text-jsblack text-center flex flex-col gap-4 [@media(min-width:3500px)]:!gap-10 ${bottomSpacing} justify-center items-center`}
    >
      <h2
        className="text-xl sm:text-2xl md:text-3xl [@media(min-width:3500px)]:!text-4xl font-bold leading-[1.3]"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {description?.trim() ? (
        <p>{description}</p>
      ) : null}
    </div>
  );
}

export default SectionTitle;
