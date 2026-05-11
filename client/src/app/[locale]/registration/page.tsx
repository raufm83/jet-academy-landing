import RegistrationClient from "@/components/views/landing/registration/registration-client";
import FaqSection from "@/components/views/landing/faq/faq-section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qeydiyyat | JET Academy",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RegistrationPage({
  params,
}: {
  params: { locale: string };
}) {
  return (
    <>
      <RegistrationClient />
      <FaqSection pageKey="registration" locale={params.locale} />
    </>
  );
}
