import * as Fa from "react-icons/fa";
import * as Fi from "react-icons/fi";
import * as Bi from "react-icons/bi";
import * as Hi from "react-icons/hi";
import * as Ri from "react-icons/ri";
import * as Md from "react-icons/md";
import * as Bs from "react-icons/bs";
import * as Lu from "react-icons/lu";
import * as Ai from "react-icons/ai";
import * as Si from "react-icons/si";
import * as Io from "react-icons/io";
import * as Io5 from "react-icons/io5";
import * as Go from "react-icons/go";
import * as Gi from "react-icons/gi";
import * as Ti from "react-icons/ti";
import * as Gr from "react-icons/gr";
import * as Cg from "react-icons/cg";
import * as Pi from "react-icons/pi";
import * as Rx from "react-icons/rx";
import * as Tb from "react-icons/tb";
import { IconType } from "react-icons";

// Ordered longest-first so multi-char prefixes (Io5, Tfi, Vsc…) match before short ones
const iconLibraries: Record<string, Record<string, IconType>> = {
  Io5,
  Fa,
  Fi,
  Bi,
  Hi,
  Ri,
  Md,
  Bs,
  Lu,
  Ai,
  Si,
  Io,
  Go,
  Gi,
  Ti,
  Gr,
  Cg,
  Pi,
  Rx,
  Tb,
};

export const getIcon = (iconName: string): IconType => {
  if (!iconName) return Ri.RiQuestionLine;

  // Try to find the library by matching the icon name prefix against known keys
  // (longest keys first to avoid short-prefix false matches like "Io" vs "Io5")
  const sortedKeys = Object.keys(iconLibraries).sort(
    (a, b) => b.length - a.length
  );

  for (const key of sortedKeys) {
    if (iconName.startsWith(key)) {
      const library = iconLibraries[key];
      if (iconName in library) {
        return library[iconName];
      }
      // prefix matched but icon not found in that library — keep searching
    }
  }

  return Ri.RiQuestionLine;
};
