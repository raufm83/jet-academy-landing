"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { MdRefresh } from "react-icons/md";

/** a, b, istifadəçi yazdığı cavab (API-yə a+b yoxlanması üçün) */
export type SimpleCaptchaContext = {
  a: number;
  b: number;
  answer: string;
};

interface SimpleCaptchaProps {
  onChange: (valid: boolean, context?: SimpleCaptchaContext) => void;
  label?: string;
  errorText?: string;
}

/**
 * Sadə riyazi CAPTCHA — bot/spam-ın qarşısını almaq üçün minimal UX-friendly mexanizm.
 * Üçüncü tərəf xidməti tələb etmir; yenidən generasiya düyməsi var.
 */
export default function SimpleCaptcha({
  onChange,
  label,
  errorText,
}: SimpleCaptchaProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [seed, setSeed] = useState(0);
  const [answer, setAnswer] = useState("");
  const [touched, setTouched] = useState(false);

  const problem = useMemo(() => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { a, b, sum: a + b };
    // seed dəyişəndə yenidən hesablanır
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const regenerate = useCallback(() => {
    setSeed((n) => n + 1);
    setAnswer("");
    setTouched(false);
  }, []);

  useEffect(() => {
    const ok = Number.parseInt(answer, 10) === problem.sum;
    onChangeRef.current(ok, { a: problem.a, b: problem.b, answer });
  }, [answer, problem.a, problem.b, problem.sum]);

  const isValid = Number.parseInt(answer, 10) === problem.sum;
  const showError = touched && answer.length > 0 && !isValid;

  return (
    <div className="space-y-2">
      {label ? (
        <label className="block text-sm font-medium text-jsblack">{label}</label>
      ) : null}
      <div className="flex items-center gap-3">
        <div
          aria-hidden
          className="select-none rounded-[20px] border border-jsyellow/60 bg-[#fef7eb] px-4 py-3 font-mono text-base font-semibold tracking-wider text-jsblack"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 2px, transparent 2px, transparent 6px)",
          }}
        >
          {problem.a} + {problem.b} = ?
        </div>
        <button
          type="button"
          onClick={regenerate}
          aria-label="Yeni CAPTCHA"
          className="rounded-full border border-jsyellow/50 bg-white p-2 text-jsyellow transition hover:bg-jsyellow/10"
        >
          <MdRefresh size={18} />
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={answer}
          onChange={(e) => setAnswer(e.target.value.replace(/[^0-9-]/g, ""))}
          onBlur={() => setTouched(true)}
          placeholder="?"
          className="w-24 rounded-[20px] border border-jsyellow bg-[#fef7eb] p-3 text-center text-base font-semibold shadow-sm outline-none transition focus:ring-2 focus:ring-jsyellow"
          aria-invalid={showError || undefined}
        />
      </div>
      {showError ? (
        <p className="pl-2 text-sm text-red-500">
          {errorText ?? "Cavab səhvdir, yenidən yoxlayın."}
        </p>
      ) : null}
    </div>
  );
}
