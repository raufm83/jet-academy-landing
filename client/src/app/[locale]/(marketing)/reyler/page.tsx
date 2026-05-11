import FeedbacksPublicPage, {
  generateFeedbacksMetadata,
} from "@/components/views/landing/feedbacks/feedbacks-public-page";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return generateFeedbacksMetadata(params.locale);
}

export default FeedbacksPublicPage;

export const revalidate = 60;
