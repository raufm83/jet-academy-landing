"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
        >
          <div className="relative flex flex-col items-center justify-center w-full max-w-xl px-8">
            <motion.div
              initial={{ opacity: 1, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full max-w-[300px] sm:max-w-[380px] md:max-w-[460px] aspect-[1280/720] mb-2"
            >
              <Image
                src="/logos/jet-loading-v2.png"
                alt="Jet Academy Loading"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </motion.div>

            <div className="relative w-[220px] sm:w-[260px] md:w-[290px] mx-auto h-[2px] bg-gray-100 overflow-hidden mt-2">
              <motion.div
                className="absolute top-0 left-0 h-full bg-[#1560bd]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
