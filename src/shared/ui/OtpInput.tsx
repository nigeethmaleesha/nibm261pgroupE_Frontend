"use client";

import { ClipboardEvent, KeyboardEvent, useMemo, useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

const LENGTH = 6;

export function OtpInput({ value, onChange, disabled, autoFocus = true }: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(
    () => Array.from({ length: LENGTH }, (_, index) => value[index] ?? ""),
    [value],
  );

  const updateAt = (index: number, input: string) => {
    const digit = input.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    onChange(next.join(""));

    if (digit && index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
      refs.current[index + 1]?.select();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < LENGTH - 1) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;

    event.preventDefault();
    onChange(pasted);
    refs.current[Math.min(pasted.length, LENGTH) - 1]?.focus();
  };

  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-2.5" aria-label="6 digit OTP input">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onPaste={handlePaste}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onChange={(event) => updateAt(index, event.target.value)}
          aria-label={`OTP digit ${index + 1}`}
          className="h-[54px] min-w-0 rounded-xl border border-slate-200 bg-slate-50 text-center text-[21px] font-black text-slate-950 outline-none transition-all placeholder:text-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(37,99,235,0.08)] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[58px]"
        />
      ))}
    </div>
  );
}
