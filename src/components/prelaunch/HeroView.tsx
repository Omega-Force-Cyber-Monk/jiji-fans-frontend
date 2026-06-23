import React from "react";
import AnimatedNumber from "../ui/AnimatedNumber";

interface HeroViewProps {
  entryCount: number;
  categoryCount: number;
  onJoin: () => void;
}

const HeroView = ({ entryCount, categoryCount, onJoin }: HeroViewProps) => (
  <div className="w-full flex flex-col items-center justify-center text-center px-6 gap-6">
    {/* Badge */}
    {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-brand-primary/30 bg-brand-primary/10 backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary" />
      </span>
      <span className="text-brand-primary text-xs font-medium tracking-widest uppercase">
        Coming Soon
      </span>
    </div> */}

    {/* Headline */}
    <h1 className="text-4xl sm:text-5xl lg:text-5xl font-semibold text-white leading-tight tracking-tight">
      Africa&apos;s Creator{" "}
      <span
        className="bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #00E97A 0%, #00B05A 50%, #009C4A 100%)",
        }}
      >
        Subscription Platform
      </span>
      <br />
      <span className="text-white">is Coming</span>
    </h1>

    {/* Sub-heading */}
    <p
      className="text-base sm:text-lg text-white! font-normal leading-relaxed"
      style={{ maxWidth: "540px" }}
    >
      Built for creators. Designed for African audiences.
      <br />
      <span className="text-brand-primary font-medium">Launching soon.</span>
    </p>

    {/* CTAs */}
    <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
      <button
        id="prelaunch-hero-join-btn"
        onClick={onJoin}
        className="px-8 py-3.5 rounded-md bg-brand-primary text-white font-medium text-sm hover:bg-brand-secondary transition-all duration-200 shadow-xl shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:scale-[1.02] active:scale-[0.98]"
      >
        Join Creator Waitlist →
      </button>
      <button
        id="prelaunch-hero-early-btn"
        onClick={onJoin}
        className="px-8 py-3.5 rounded-md border border-brand-primary/35 text-brand-primary font-medium text-sm bg-brand-primary/5 hover:bg-brand-primary/12 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        Get Early Access
      </button>
    </div>

    {/* Stats strip */}
    <div
      className="flex flex-wrap justify-center gap-8 sm:gap-14 mt-4 pt-6 border-t border-white/6 w-full"
      style={{ maxWidth: "540px" }}
    >
      {[
        { label: "Countries Targeted", value: 54, isAnimated: true },
        { label: "Creator Categories", value: categoryCount, isAnimated: true },
        { label: "On Waitlist", value: entryCount, isAnimated: true },
      ].map((s) => (
        <div key={s.label} className="text-center">
          <div
            className="text-2xl font-semibold bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg,#00E97A,#009C4A)" }}
          >
            {s.isAnimated && typeof s.value === "number" ? <AnimatedNumber target={s.value} /> : s.value as React.ReactNode}
            {s.label === "Creator Categories" && !s.isAnimated && "+"}
          </div>
          <div className="text-xs text-muted-text mt-1 font-normal">{s.label}</div>
        </div>
      ))}
    </div>
  </div>
);

export default HeroView;
