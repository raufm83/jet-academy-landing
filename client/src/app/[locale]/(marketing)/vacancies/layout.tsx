import { setRequestLocale } from "next-intl/server";

export default async function VacanciesLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-col bg-transparent">
      {children}
    </div>
  );
}
