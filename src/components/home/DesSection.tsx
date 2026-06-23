"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Container from "../Container";
import Image from "@/components/ui/CImage";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    id: 1,
    title: "Earn From What You Love",
    description:
      "Turn your content into income with memberships and tips from your closest fans.",
    image: "/static/demo/cover_1.png",
    alt: "earn from content",
  },
  {
    id: 2,
    title: "Reach Fans Anywhere",
    description:
      "Go global with location-based pricing and flexible payment options – fans can support you from anywhere in the world.",
    image: "/static/demo/cover_2.png",
    alt: "global reach",
  },
  {
    id: 3,
    title: "Smooth, Simple, Fast",
    description:
      "Upload videos, manage your channel, and handle subscriptions without friction – easy for creators, effortless for viewers.",
    image: "/static/demo/video_1.png",
    alt: "smooth experience",
  },
  {
    id: 4,
    title: "Pay Your Way",
    description:
      "From cards to mobile money, +2Fans supports multiple payment methods so no fan gets left out.",
    image: "/static/podcast/smiley-people-recording-podcast-medium-shot.jpg",
    alt: "payment methods",
  },
];

const DesSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Cards Staggered Animation
      gsap.fromTo(
        cardsRef.current,
        {
          opacity: 0,
          y: 60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current[0],
            start: "top 85%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <Container className="bg-primary-bg pb-16 overflow-hidden">
      <div ref={sectionRef} className="w-full">
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">

          {/* Centered CTA Button — visible ONLY on xl screens and larger */}
          <div
            // href="/signup"
            className="hidden xl:absolute xl:top-1/2 xl:left-1/2 xl:-translate-x-1/2 xl:-translate-y-1/2 z-10 pointer-events-auto h-22 xl:flex w-[470px] items-center justify-center text-center  hover:scale-[1.03] active:scale-95 transition-all duration-300 ease-out"
          >
            <Image src="/static/2Fans-01.svg" alt="get started" fill className="object-fit object-left  transition-transform duration-700 ease-out" />
          </div>

          {features.map((feature, index) => {
            const isLarge = index === 0 || index === 3;
            const isReversed = index === 3;

            return (
              <div
                key={feature.id}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className={`group flex flex-col bg-secondary-bg rounded-lg border border-border-primary overflow-hidden hover:border-brand-primary transition-colors duration-300 ${isLarge ? "md:col-span-2 xl:h-96" : "md:col-span-1"
                  } ${index === 2 ? "xl:-mt-22" : ""}`}
              >
                <div className={`flex flex-col h-full ${isLarge ? (isReversed ? "md:flex-row-reverse" : "md:flex-row") : ""}`}>
                  {/* Image Container */}
                  <div className={`relative bg-primary-bg flex items-center justify-center overflow-hidden border-border-primary ${isLarge ? "w-full md:w-1/2 h-64 md:h-full border-b md:border-b-0" : "w-full h-64 border-b"
                    } ${isLarge && !isReversed ? "md:border-r" : ""} ${isLarge && isReversed ? "md:border-l" : ""}`}>
                    {/* Subtle background glow effect on hover */}
                    <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />

                    <div className="w-full h-full z-10 flex items-center justify-center relative">
                      <Image
                        src={feature.image}
                        alt={feature.alt}
                        fill
                        className="w-full h-full object-cover object-left group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className={`p-8 flex flex-col justify-center flex-1 ${isLarge ? "md:w-1/2" : ""}`}>
                    <div className="w-12 h-1 bg-brand-primary rounded-full mb-6"></div>
                    <h3 className="text-2xl font-semibold text-primary-text mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-base font-normal text-secondary-text leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
};

export default DesSection;
