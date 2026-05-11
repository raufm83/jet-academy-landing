"use client";

import api from "@/utils/api/axios";
import { useEffect, useState } from "react";

export type PublicSectionVisibility = {
  showGraduates: boolean;
  showStudentProjects: boolean;
  showVacancies: boolean;
  loaded: boolean;
};

const initial: PublicSectionVisibility = {
  showGraduates: true,
  showStudentProjects: true,
  showVacancies: true,
  loaded: false,
};

/**
 * Navbar üçün: məzunlar, tələbə layihələri və aktiv vakansiya sayı.
 * Yüklənənə qədər optimistik olaraq true.
 */
export function usePublicSectionVisibility(): PublicSectionVisibility {
  const [state, setState] = useState<PublicSectionVisibility>(initial);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [gRes, pRes, vRes] = await Promise.all([
          api.get("/graduates").catch(() => ({ data: [] })),
          api
            .get("/student-projects", { params: { limit: 1, page: 1 } })
            .catch(() => ({ data: { meta: { total: 0 } } })),
          api.get("/vacancies").catch(() => ({ data: [] })),
        ]);

        const grads = Array.isArray(gRes.data) ? gRes.data.length : 0;
        const proj =
          typeof (pRes.data as { meta?: { total?: number } })?.meta?.total ===
          "number"
            ? (pRes.data as { meta: { total: number } }).meta.total
            : 0;
        const vacs = Array.isArray(vRes.data) ? vRes.data.length : 0;

        if (!cancelled) {
          setState({
            showGraduates: grads >= 1,
            showStudentProjects: proj >= 1,
            showVacancies: vacs >= 1,
            loaded: true,
          });
        }
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, loaded: true }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
