"use client";

import ContactForm from "@/components/views/landing/contact-us/contact-form";
import Logo from "@/components/layout/header/logo";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function RegistrationClient() {
  const t = useTranslations("contact.form");
  return (
    <main className="flex-1 min-h-screen bg-[#fdfaf5] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-jsyellow/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-jsyellow/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[600px] z-10"
      >
        <div className="bg-white rounded-[40px] shadow-2xl p-8 sm:p-12 border border-jsyellow/10">
          <div className="flex flex-col items-center mb-10">
             <Link href="/">
                <Logo size="lg" className="cursor-pointer" />
             </Link>
            
            <h1 className="mt-8 text-3xl sm:text-4xl font-bold text-jsblack text-center leading-tight">
              {t("registration.title")}
            </h1>
            <p className="mt-4 text-gray-500 text-center max-w-md">
              {t("registration.description")}
            </p>
          </div>

          <ContactForm />

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} JET Academy. {t("copyright")}
            </p>
          </div>
        </div>

        {/* Floating elements for aesthetic */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:block absolute -right-20 top-1/4"
        >
          <div className="w-16 h-16 bg-jsyellow/20 rounded-2xl rotate-12 backdrop-blur-sm border border-white/50" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden lg:block absolute -left-20 bottom-1/4"
        >
          <div className="w-12 h-12 bg-jsyellow/30 rounded-full backdrop-blur-sm border border-white/50" />
        </motion.div>
      </motion.div>
    </main>
  );
}
