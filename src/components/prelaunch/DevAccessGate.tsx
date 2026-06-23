"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import Image from "next/image";

const ACCESS_KEY = "p2f_dev_access_v1";
const CORRECT_CODE = "0099";

function isGranted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(ACCESS_KEY) === "granted";
  } catch {
    return false;
  }
}

function grantAccess(): void {
  try {
    sessionStorage.setItem(ACCESS_KEY, "granted");
  } catch {
    // private mode — no-op
  }
}

export default function DevAccessGate({ children }: { children: React.ReactNode }) {
  const id = useId();
  const [granted, setGranted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hydrate after mount to avoid SSR mismatch
  useEffect(() => {
    setGranted(isGranted());
    setHydrated(true);
  }, []);

  // Focus input when gate appears
  useEffect(() => {
    if (hydrated && !granted) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [hydrated, granted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (code.trim() === CORRECT_CODE) {
      setLoading(true);
      // brief delay for visual feedback
      await new Promise((r) => setTimeout(r, 400));
      grantAccess();
      setGranted(true);
    } else {
      setError("Invalid access code. Please try again.");
      setShake(true);
      setCode("");
      setTimeout(() => {
        setShake(false);
        setError("");
        inputRef.current?.focus();
      }, 700);
    }
  };

  // While SSR or not yet hydrated — render nothing visible
  if (!hydrated) return null;

  // Access already granted — render the app
  if (granted) return <>{children}</>;

  // Gate overlay
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      {/* Background — reuse map.jpg */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/map.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(0.2) brightness(0.25)",
        }}
      />
      {/* Gradient overlay */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(0,176,90,0.22) 0%, transparent 65%), " +
            "rgba(5,13,10,0.72)",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 flex flex-col items-center gap-6 rounded-lg p-8 sm:p-10 border border-white/10 w-full"
        style={{
          maxWidth: "420px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(0,176,90,0.06) 100%)",
          backdropFilter: "blur(20px)",
          margin: "0 16px",
        }}
      >
        {/* Logo */}
        <div className="relative w-[120px] h-[46px]">
          <Image
            src="/static/2Fans-01.svg"
            alt="+2Fans"
            fill
            style={{ objectFit: "contain" }}
            priority
            sizes="120px"
          />
        </div>

        {/* Copy */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-2">
            Platform Access
          </h1>
          <p className="text-sm text-muted-text font-normal leading-relaxed">
            +2Fans is in pre-launch. Enter your access code to preview the platform.
          </p>
        </div>

        {/* Form */}
        <form
          id={`${id}-gate-form`}
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor={`${id}-code-input`}
              className="block text-xs font-medium text-muted-text mb-2 uppercase tracking-wider"
            >
              Access Code
            </label>
            <input
              ref={inputRef}
              id={`${id}-code-input`}
              type="password"
              inputMode="numeric"
              maxLength={8}
              autoComplete="off"
              placeholder="••••"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-3.5 rounded-md text-center text-lg font-medium text-white placeholder-muted-text bg-white/5 border border-white/12 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 transition-all duration-200 tracking-[0.4em]"
              style={{
                animation: shake ? "gate-shake 0.5s ease" : undefined,
              }}
            />
            {error && (
              <p className="mt-2 text-xs text-error font-normal text-center">
                {error}
              </p>
            )}
          </div>

          <button
            id={`${id}-gate-submit`}
            type="submit"
            disabled={loading || code.length === 0}
            className="w-full py-3.5 rounded-md bg-brand-primary text-white font-medium text-sm hover:bg-brand-secondary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/25"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Verifying…
              </span>
            ) : (
              "Enter Platform →"
            )}
          </button>
        </form>

        {/* Footer note */}
        <p className="text-xs text-muted-text font-normal text-center">
          Access restricted to authorised team members only.
          <br />
          Not a team member?{" "}
          <a
            href="/"
            className="text-brand-primary hover:underline"
          >
            Join the waitlist
          </a>
        </p>
      </div>

      {/* Shake keyframe */}
      <style>{`
        @keyframes gate-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
