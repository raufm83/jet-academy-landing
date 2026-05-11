import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import Breadcrumbs from "@/components/views/landing/bread-crumbs/bread-crumbs";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const ContactModal = dynamic(() => import("@/components/shared/contact-modal"), {
  ssr: false,
});
const ProjectModal = dynamic(() => import("@/components/shared/project-modal"), {
  ssr: false,
});
const ScrollItems = dynamic(() => import("@/components/shared/scroll-items"), {
  ssr: false,
});
const TopCircle = dynamic(() => import("@/components/shared/top-circle"), {
  ssr: false,
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScrollItems />
      <TopCircle />
      <Header />
      <div className="container relative z-[1] pt-4">
        <Suspense fallback={null}>
          <Breadcrumbs />
        </Suspense>
      </div>
      <ContactModal />
      <ProjectModal />
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1001] focus:block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-md focus:bg-jsyellow focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-white"
      >
        Məzmunə keç / Skip to content
      </a>
      <main
        id="main-content"
        className="relative z-[1] flex flex-1 flex-col"
        tabIndex={-1}
      >
        {children}
      </main>
      <div className="relative z-[1]">
        <Footer />
      </div>
    </>
  );
}
