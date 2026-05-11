"use client";
import { getMenuItems, type MenuItem } from "@/data/sidebar-items";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { MdLogout, MdMenu, MdPerson } from "react-icons/md";

function normalizePath(p: string) {
  const t = p.replace(/\/$/, "");
  return t === "" ? "/" : t;
}

/** Alt marşrutlarda da düzgün aktiv element: ən uzun uyğun path qazanır. */
function getActiveMenuItem(pathname: string, items: MenuItem[]): MenuItem | undefined {
  const p = normalizePath(pathname);
  const matches = items.filter((item) => {
    const href = normalizePath(item.path || "/");
    if (href === "/dashboard") return p === "/dashboard";
    return p === href || p.startsWith(`${href}/`);
  });
  if (matches.length === 0) return undefined;
  return matches.reduce((best, cur) =>
    (cur.path?.length ?? 0) > (best.path?.length ?? 0) ? cur : best
  );
}

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();
  const { data: session } = useSession();
  const menuItems = useMemo(() => getMenuItems(session), [session]);
  const activeMenuItem = useMemo(
    () => getActiveMenuItem(pathname || "", menuItems),
    [pathname, menuItems]
  );

  const sidebarVariants = {
    expanded: {
      width: "16rem",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
    collapsed: {
      width: "5rem",
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  const textVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      display: "block",
      transition: { delay: 0.1 },
    },
    collapsed: {
      opacity: 0,
      x: -20,
      transitionEnd: { display: "none" },
    },
  };

  return (
    <div className="overflow-hidden flex">
      <motion.div
        className="flex flex-col bg-white text-black border-r border-gray-200 flex-shrink-0"
        initial="expanded"
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={sidebarVariants}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0">
            <div className="relative p-4 border-b border-gray-200">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "absolute bg-jsyellow rounded-full p-1.5 text-white hover:bg-opacity-90 transition-colors z-50",
                  isExpanded
                    ? "top-4 right-4"
                    : "top-4 left-1/2 -translate-x-1/2"
                )}
              >
                <MdMenu size={20} />
              </button>
              <motion.h1
                variants={textVariants}
                className="text-xl font-bold text-jsyellow"
              >
                İdarə Paneli
              </motion.h1>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-jsyellow/10 p-2 rounded-full flex-shrink-0">
                  <MdPerson size={24} className="text-jsyellow" />
                </div>
                <motion.div variants={textVariants} className="overflow-hidden">
                  <p className="font-medium text-gray-900 truncate">
                    {session?.user?.email}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {session?.user?.role || "İstifadəçi"}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto scrollbar-none">
            <ul className="py-4">
              {menuItems.map((item, index) => {
                const isActive = activeMenuItem?.path === item?.path;
                return (
                  <li key={index}>
                    <Link
                      href={item?.path || "/"}
                      className={`flex items-center px-4 py-3 transition-colors relative group
                       ${
                         isActive
                           ? "bg-jsyellow/10 text-jsyellow font-medium"
                           : "text-gray-600 hover:bg-gray-50 hover:text-jsyellow"
                       }`}
                    >
                      <span className="relative z-10 flex-shrink-0">
                        {item?.icon}
                      </span>
                      <motion.span
                        variants={textVariants}
                        className="ml-3 truncate"
                      >
                        {item?.name}
                      </motion.span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 top-0 h-full w-1 bg-jsyellow"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white mt-auto">
            <button
              onClick={async () => {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jetacademy.az";
                const loginUrl = `${baseUrl}/dashboard/login`;
                await signOut({ redirect: false });
                window.location.replace(loginUrl);
              }}
              className="w-full flex items-center px-4 py-4 text-gray-600 hover:bg-gray-50 hover:text-jsyellow transition-colors"
            >
              <span className="relative z-10 flex-shrink-0">
                <MdLogout size={24} />
              </span>
              <motion.span variants={textVariants} className="ml-3 truncate">
                Çıxış
              </motion.span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;
