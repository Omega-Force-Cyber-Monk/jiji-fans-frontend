"use client";

import React, { useState, useEffect } from "react";
import { WaitlistEntry } from "./waitlist.types";
import { SUCCESS_COUNTDOWN_SEC } from "./prelaunch.constants";

interface SuccessViewProps {
  entry: WaitlistEntry | null;
  onReset: () => void;
}

const SuccessView = ({ entry, onReset }: SuccessViewProps) => {
  const [remaining, setRemaining] = useState(SUCCESS_COUNTDOWN_SEC);

  // Countdown — only runs while this component is mounted (i.e. view === "success")
  useEffect(() => {
    setRemaining(SUCCESS_COUNTDOWN_SEC);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onReset]);

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = (remaining / SUCCESS_COUNTDOWN_SEC) * circumference;

  const nextSteps = [
    {
      icon: "📬",
      title: "Confirmation email",
      desc: `We've noted ${entry?.email ?? "your email"} — watch your inbox.`,
    },
    {
      icon: "🚀",
      title: "Early access invite",
      desc: "You'll be among the first to get access when we launch.",
    },
    {
      icon: "💬",
      title: "WhatsApp updates",
      desc: entry?.whatsapp
        ? `We'll send launch updates to ${entry.whatsapp}.`
        : "Add your WhatsApp next time to get launch alerts.",
    },
  ];

  return (
    <div
      className="w-full flex flex-col items-center justify-center text-center px-6 gap-6"
      style={{ maxWidth: "560px", margin: "0 auto" }}
    >
      {/* Icon */}
      <div
        className="w-20 h-20 rounded-md flex items-center justify-center text-4xl shadow-2xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,233,122,0.2) 0%, rgba(0,176,90,0.12) 100%)",
          border: "1px solid rgba(0,176,90,0.3)",
        }}
      >
        🎉
      </div>

      {/* Headline */}
      <div>
        <h2 className="text-3xl font-semibold text-white mb-2">
          You&apos;re on the list!
        </h2>
        <p className="text-white! font-normal text-base leading-relaxed">
          Welcome aboard,{" "}
          <span className="text-brand-primary font-medium">
            {entry?.name?.split(" ")[0] ?? "Creator"}
          </span>
          . You&apos;re officially part of Africa&apos;s next big creator movement.
        </p>
      </div>

      {/* What happens next */}
      <div
        className="w-full rounded-lg p-6 text-left border border-white/8 flex flex-col gap-4"
        style={{ background: "rgba(255,255,255,0.03)" }}
      >
        <p className="text-sm font-medium text-white! uppercase tracking-wider">
          What happens next
        </p>
        {nextSteps.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <span className="text-xl mt-0.5 shrink-0">{item.icon}</span>
            <div>
              <p className="text-lg font-medium text-white">{item.title}</p>
              <p className="text-sm text-muted-text font-normal mt-0.5 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Go Back + countdown ring */}
      <div className="flex items-center justify-center w-full">
        <button
          id="prelaunch-success-back-btn"
          onClick={onReset}
          className="flex items-center gap-3 px-6 py-3 rounded-md border border-brand-primary/30 text-brand-primary text-sm font-medium hover:bg-brand-primary/10 transition-colors"
        >
          <svg width="44" height="44" viewBox="0 0 44 44" className="rotate-180">
            {/* Track */}
            <circle
              cx="22" cy="22" r={radius}
              fill="none"
              stroke="rgba(0,176,90,0.15)"
              strokeWidth="3"
            />
            {/* Progress */}
            <circle
              cx="22" cy="22" r={radius}
              fill="none"
              stroke="var(--brand-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              style={{ transition: "stroke-dashoffset 0.8s linear" }}
            />
            {/* Number — counter-rotated to read upright */}
            <text
              x="22" y="22"
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                transform: "rotate(180deg)",
                transformOrigin: "22px 22px",
                fill: "var(--brand-primary)",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              {remaining}
            </text>
          </svg>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default SuccessView;
