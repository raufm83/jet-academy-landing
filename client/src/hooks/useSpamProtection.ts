import { useRef } from "react";

/** Gizli honeypot sahəsinin adı – botlar tez-tez doldurur, istifadəçilər görmür */
export const HONEYPOT_FIELD_NAME = "website";

/** Minimum göndərmə müddəti (ms) – bundan tez göndərənlər bot sayılır */
const MIN_SUBMIT_TIME_MS = 3000;

export function useSpamProtection() {
  const formOpenTimeRef = useRef(Date.now());

  /** Honeypot doldurulubsa və ya form çox tez göndərilibsə true */
  function isSpam(data: object): boolean {
    const record = data as Record<string, unknown>;
    const honeypot = record[HONEYPOT_FIELD_NAME];
    if (typeof honeypot === "string" && honeypot.trim() !== "") return true;
    const elapsed = Date.now() - formOpenTimeRef.current;
    return elapsed < MIN_SUBMIT_TIME_MS;
  }

  /** Payload-dan honeypot sahəsini çıxarır (API-yə göndərməmək üçün) */
  function stripHoneypot<T extends Record<string, unknown>>(data: T): Omit<T, typeof HONEYPOT_FIELD_NAME> {
    const rest = { ...data };
    delete rest[HONEYPOT_FIELD_NAME];
    return rest as Omit<T, typeof HONEYPOT_FIELD_NAME>;
  }

  return {
    formOpenTimeRef,
    isSpam,
    stripHoneypot,
    honeypotName: HONEYPOT_FIELD_NAME,
  };
}
