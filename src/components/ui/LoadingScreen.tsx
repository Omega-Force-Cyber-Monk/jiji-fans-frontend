"use client";

import Image from "@/components/ui/CImage";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface LoadingScreenProps {
  message?: string;
  variant?: "default" | "minimal";
  isVisible?: boolean;
}

export default function LoadingScreen({
  message = "Loading...",
  variant = "default",
  isVisible = true,
}: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (!containerRef.current) return;

    if (isVisible) {
      setShouldRender(true);
      // Entry animation
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );

      // Logo floating animation
      gsap.to(logoRef.current, {
        y: -12,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Content staggered entry
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", delay: 0.2 }
        );
      }
    } else {
      // Exit animation (Ceremony up)
      gsap.to(containerRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: "power4.inOut",
        onComplete: () => {
          setShouldRender(false);
        },
      });

      // Fade out content slightly earlier
      gsap.to(contentRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      });

      // Safety fallback: if GSAP pauses (e.g. inactive tab), forcefully unmount
      const safetyTimeout = setTimeout(() => {
        setShouldRender(false);
      }, 1000);

      return () => clearTimeout(safetyTimeout);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  if (variant === "minimal") {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary-bg"
      >
        <div ref={contentRef} className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          </div>
          {message && (
            <p className="text-secondary-text text-sm font-medium">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary-bg overflow-hidden"
    >
      {/* Premium background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/5 blur-[120px] rounded-full" />
      </div>

      <div ref={contentRef} className="relative flex flex-col items-center gap-8 p-8 max-w-md w-full">
        {/* Logo with floating animation */}
        <div ref={logoRef} className="relative">
          <div className="absolute inset-0 bg-brand-primary/10 blur-3xl rounded-full scale-125" />
          <div className="relative w-28 h-28 sm:w-36 sm:h-36">
            <Image
              src="/static/2Fans-02.svg"
              alt="Logo"
              width={144}
              height={144}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Loading message */}
        <div className="text-center space-y-4">
          <h4 className="text-xl font-medium text-primary-text">
            {message}
          </h4>

          {/* Custom dot animation */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-brand-primary rounded-full opacity-20"
                style={{
                  animation: `loading-pulse 1.5s infinite ease-in-out both`,
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes loading-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.2; }
          40% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
