import { getTranslations } from "next-intl/server";
import Link from "next/link";
import ContactFormFloat from "../single-course/contact-form-float";
import DownloadPdfButton from "@/components/shared/download-pdf-button";

interface GlossaryTermDetailProps {
  term: string;
  definition: string;
  categoryName?: string;
  categorySlug?: string;
  relatedTerms?: {
    id: string;
    term: {
      az: string;
      en: string;
    };
    slug: {
      az: string;
      en: string;
    };
  }[];
  categoryText: string;
  relatedTermsText: string;
  language: string;
  buttonText: string;
  loadingText: string;
  phoneForPdf?: string;
}

export default async function GlossaryTermDetail({
  term,
  definition,
  categoryName,
  categorySlug,
  relatedTerms,
  categoryText,
  relatedTermsText,
  language,
  buttonText,
  loadingText,
  phoneForPdf,
}: GlossaryTermDetailProps) {
  const t = await getTranslations("glossary");
  const mergedRelatedTerms = relatedTerms ?? [];
  const getTitleText = (locale: string) => {
    switch (locale) {
      case "az":
        return `${term} ${t("whats")}`;
      case "en":
        return `${t("whats")} ${term}?`;
      case "ru":
        return `${t("whats")} ${term}?`;
      default:
        return `${term} ${t("whats")}`;
    }
  };

  return (
    <div className="flex flex-col gap-6 items-start justify-start animate-fadeIn px-6 sm:px-10">
      <div className="flex flex-wrap items-center gap-4">
        {categoryName && categorySlug && (
          <Link href={`/glossary/category/${categorySlug}`}>
            <span className="bg-jsyellow/10 text-jsblack px-4 py-2 rounded-full cursor-pointer underline">
              {`${categoryText}: ${categoryName}`}
            </span>
          </Link>
        )}
      </div>

      <h1
        className="
          text-left text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.3] text-jsblack
          [@media(min-width:3500px)]:!text-5xl
        "
      >
        {getTitleText(language)}
      </h1>

      <div className="w-full flex justify-start">
        <DownloadPdfButton
          title={getTitleText(language)}
          description={definition}
          buttonText={buttonText}
          loadingText={loadingText}
          contactPhone={phoneForPdf}
        />
      </div>

      <div
        className="
          flex flex-col lg:flex-row gap-6 lg:gap-8
          [@media(min-width:2500px)]:gap-20 
          [@media(min-width:3500px)]:gap-24
          w-full
        "
      >
        <div
          dangerouslySetInnerHTML={{ __html: definition }}
          className="
            flex-1 prose max-w-none mx-0 text-left
            prose-headings:text-left prose-p:text-left prose-ul:text-left prose-ol:text-left
            prose-li:list-disc prose-li:ml-4
            [@media(min-width:2500px)]:text-2xl
            [@media(min-width:3500px)]:text-3xl
            [@media(min-width:2500px)]:leading-relaxed
            [@media(min-width:3500px)]:leading-loose
          "
        />

        <div
          className="
            w-full lg:w-[400px]
            [@media(min-width:2500px)]:w-[600px] 
            [@media(min-width:3500px)]:w-[700px]
            lg:flex-shrink-0
          "
        >
          {/* ContactFormFloat burada qalacaqsa — okay; əks halda CoursesSlider-ə yer verilir */}
          <ContactFormFloat title="contactFormTitle" />
        </div>
      </div>

      {mergedRelatedTerms.length > 0 ? (
        <div className="mt-6 w-full">
          <h3
            className="
              font-semibold mb-2 text-left
              [@media(min-width:2500px)]:text-3xl
              [@media(min-width:3500px)]:text-4xl
            "
          >
            {relatedTermsText}:
          </h3>
          <div className="flex flex-wrap gap-2">
            {mergedRelatedTerms.map((relatedTerm) => (
              <Link
                key={relatedTerm.id}
                href={`/glossary/term/${
                  relatedTerm.slug[language as keyof typeof relatedTerm.slug]
                }`}
              >
                <span
                  className="
                    bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm cursor-pointer
                    [@media(min-width:2500px)]:px-6 [@media(min-width:2500px)]:py-3 [@media(min-width:2500px)]:text-xl
                    [@media(min-width:3500px)]:px-8 [@media(min-width:3500px)]:py-4 [@media(min-width:3500px)]:text-2xl
                    hover:bg-blue-200 transition-colors
                  "
                >
                  {relatedTerm.term[language as keyof typeof relatedTerm.term]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
