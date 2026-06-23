"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Container from "../Container";
import Image from "@/components/ui/CImage";

gsap.registerPlugin(ScrollTrigger);

const MarketingHighlight = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Text lines sweep up with 3D rotation on scroll down, reverse on scroll up
      gsap.fromTo(
        ".marketing-line",
        {
          opacity: 0,
          y: 80,
          rotationX: -45,
          transformOrigin: "50% 50% -50px",
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1.2,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 20%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Images expand elastically on scroll down, collapse on scroll up based on screen width
      mm.add("(min-width: 1024px)", () => {
        gsap.fromTo(
          ".inline-img-wrapper",
          { width: 0, opacity: 0, margin: 0 },
          {
            width: "10rem",
            opacity: 1,
            margin: "0 0.75rem",
            duration: 1.5,
            stagger: 0.3,
            ease: "elastic.out(1.2, 0.75)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              end: "top 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      mm.add("(min-width: 768px) and (max-width: 1023px)", () => {
        gsap.fromTo(
          ".inline-img-wrapper",
          { width: 0, opacity: 0, margin: 0 },
          {
            width: "7rem",
            opacity: 1,
            margin: "0 0.5rem",
            duration: 1.5,
            stagger: 0.3,
            ease: "elastic.out(1.2, 0.75)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              end: "top 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      mm.add("(max-width: 767px)", () => {
        gsap.fromTo(
          ".inline-img-wrapper",
          { width: 0, opacity: 0, margin: 0 },
          {
            width: "5rem",
            opacity: 1,
            margin: "0 0.25rem",
            duration: 1.5,
            stagger: 0.3,
            ease: "elastic.out(1.2, 0.75)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              end: "top 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Container className="bg-primary-bg overflow-hidden">
      <div
        ref={sectionRef}
        className="w-full pt-10 text-center flex flex-col items-center justify-center space-y-6"
        style={{ perspective: "1000px" }}
      >
        {/* Line 1: Accelerate Your [image] Influence and Unlock */}
        <h1 className="marketing-line text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight flex flex-wrap justify-center items-center gap-6">
          <span className="text-primary-text">
            Accelerate <span className="text-brand-primary">Your Influence</span>{" "}
          </span>
          <span className="inline-img-wrapper inline-flex align-middle overflow-hidden items-center justify-center rounded-full">
            <span className="w-20 h-10 sm:w-28 sm:h-14 lg:w-40 lg:h-20 rounded-full overflow-hidden border-2 border-border-primary flex-shrink-0 shadow-lg">
              <Image
                src="/creator_painter.png"
                alt="Creator"
                width={160}
                height={80}
                className="w-full h-full object-cover"
              />
            </span>
          </span>
          <span className="text-primary-text">and Unlock</span>
        </h1>

        {/* Line 2: [image] New Streams by Accessing the Potential */}
        <h1 className="marketing-line text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight flex flex-wrap justify-center items-center gap-6">
          <span className="text-primary-text">New Streams </span>
          <span className="inline-img-wrapper inline-flex align-middle overflow-hidden items-center justify-center rounded-full">
            <span className="w-20 h-10 sm:w-28 sm:h-14 lg:w-40 lg:h-20 rounded-full overflow-hidden border-2 border-border-primary flex-shrink-0 shadow-lg">
              <Image
                src="/creator_chef.png"
                alt="Creator"
                width={160}
                height={80}
                className="w-full h-full object-cover"
              />
            </span>
          </span>
          <span className="text-primary-text">by Accessing the</span>
          <span className="">
            {" "}
            Content <span className="text-brand-primary">Drops</span>
          </span>
        </h1>
      </div>
    </Container>
  );
};

export default MarketingHighlight;
