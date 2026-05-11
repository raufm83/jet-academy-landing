import { permanentRedirect } from "next/navigation";
import { feedbacksPathSegment } from "@/lib/feedbacks-path";

/** Köhnə /az/projects, /en/projects və s. ünvanlarını yenilənmiş slug-a yönləndirir */
export default function LegacyProjectsToFeedbacksSlug({
  params,
}: {
  params: { locale: string };
}) {
  const loc = ["az", "en", "ru"].includes(params.locale) ? params.locale : "az";
  permanentRedirect(`/${loc}/${feedbacksPathSegment(loc)}/`);
}
