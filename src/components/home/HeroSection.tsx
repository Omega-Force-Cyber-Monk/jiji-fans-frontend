"use client";
import React, { useEffect, useRef, useState } from "react";
import Container from "../Container";
import Image from "@/components/ui/CImage";
import { cn } from "@/utils/cn";
import { Button } from "antd";
// import { ArrowRightIcon } from "@heroicons/react/16/solid";
// import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useAppSelector } from "@/redux/hook";
import { selectIsAuthenticated } from "@/redux/features/auth/authSelectors";
import { ROLE } from "@/types";

// Register GSAP plugins
gsap.registerPlugin(TextPlugin, ScrollTrigger);

interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className = "" }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { user } = useAppSelector((state) => state.auth);

  // Refs with proper typing
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const profilesRef = useRef<HTMLDivElement>(null);
  // const buttonRef = useRef<HTMLButtonElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Background map transient transition state
  const [showMap, setShowMap] = useState(true);

  // Mount effect to start with the map and transition to video after 3 seconds
  useEffect(() => {
    const initialTimeout = setTimeout(() => {
      setShowMap(false);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch((err) => console.log("Video play interrupted:", err));
      }
    }, 3000);

    return () => clearTimeout(initialTimeout);
  }, []);

  const handleVideoEnded = () => {
    setShowMap(true);
    setTimeout(() => {
      setShowMap(false);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch((err) => console.log("Video play interrupted:", err));
      }
    }, 3000);
  };

  console.log(isAuthenticated);
  useEffect(() => {
    if (!containerRef.current) return;

    let handleMouseMove: (e: MouseEvent) => void;
    const currentContainer = containerRef.current;

    const ctx = gsap.context(() => {
      // Create timeline for entrance animations
      const tl = gsap.timeline({ delay: 0.5 });

      // Background Ken Burns effect
      if (backgroundRef.current) {
        gsap.to(backgroundRef.current, {
          scale: 1.05,
          rotation: 1,
          duration: 12,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });
      }

      // Floating particles animation
      particlesRef.current.forEach(
        (particle: HTMLDivElement | null, index: number) => {
          if (particle) {
            gsap.to(particle, {
              y: "random(-50, 50)",
              x: "random(-30, 30)",
              duration: "random(3, 6)",
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              delay: index * 0.2,
            });

            gsap.to(particle, {
              opacity: "random(0.3, 0.8)",
              duration: "random(2, 4)",
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              delay: index * 0.3,
            });
          }
        },
      );

      // Floating cards ambient animation
      gsap.to(".floating-card", {
        y: "random(-15, 15)",
        duration: "random(3, 5)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
      });

      // 3D Parallax Mouse Move effect (Proximity + Depth based)
      handleMouseMove = (e: MouseEvent) => {
        const wrappers = document.querySelectorAll(".parallax-wrapper");
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight / 2;
        const screenXPos = (e.clientX - screenCenterX) / screenCenterX;
        const screenYPos = (e.clientY - screenCenterY) / screenCenterY;

        wrappers.forEach((wrapper) => {
          const el = wrapper as HTMLElement;
          const rect = el.getBoundingClientRect();

          // Element center
          const elCenterX = rect.left + rect.width / 2;
          const elCenterY = rect.top + rect.height / 2;

          // Distance from mouse to element
          const distX = e.clientX - elCenterX;
          const distY = e.clientY - elCenterY;
          const distance = Math.sqrt(distX * distX + distY * distY);

          // Proximity intensity (closer = stronger reaction)
          const maxDistance = 800;
          let proximityForce = 1 - Math.min(distance / maxDistance, 1);
          proximityForce = Math.pow(proximityForce, 2); // Exponential falloff

          const speed = parseFloat(el.dataset.speed || "1");

          gsap.to(wrapper, {
            rotationY: screenXPos * 5 * speed + (distX * 0.01 * proximityForce),
            rotationX: -screenYPos * 5 * speed - (distY * 0.01 * proximityForce),
            x: screenXPos * 15 * speed - (distX * 0.05 * proximityForce),
            y: screenYPos * 15 * speed - (distY * 0.05 * proximityForce),
            ease: "power2.out",
            duration: 0.8,
            transformPerspective: 1000,
            transformOrigin: "center center"
          });
        });
      };

      currentContainer.addEventListener("mousemove", handleMouseMove);

      // Main entrance animations
      if (
        titleRef.current &&
        descriptionRef.current &&
        profilesRef.current
        // &&
        // buttonRef.current
      ) {
        tl.from(
          descriptionRef.current,
          {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
          },
        )
          .from(
            profilesRef.current.children,
            {
              x: -60,
              opacity: 0,
              duration: 0.8,
              ease: "back.out(1.7)",
              stagger: 0.1,
            },
            "-=0.5",
          );
        // .from(
        //   buttonRef.current,
        //   {
        //     x: -60,
        //     opacity: 0,
        //     duration: 0.8,
        //     ease: "back.out(1.7)",
        //   },
        //   "-=0.6"
        // );
      }



      // Profile images hover animations
      if (profilesRef.current) {
        const profiles = profilesRef.current.children;
        Array.from(profiles).forEach((profile: Element, _index: number) => {
          const profileElement = profile as HTMLElement;
          if (profileElement.classList.contains("profile-image")) {
            const onEnter = (): void => {
              gsap.to(profileElement, {
                scale: 1.03,
                y: -10,
                zIndex: 20,
                duration: 0.3,
                ease: "power2.out",
              });
              gsap.to(profileElement, {
                rotation: "random(-5, 5)",
                duration: 0.3,
                ease: "power2.out",
              });
            };

            const onLeave = (): void => {
              gsap.to(profileElement, {
                scale: 1,
                y: 0,
                zIndex: 1,
                rotation: 0,
                duration: 0.3,
                ease: "power2.out",
              });
            };
            profileElement.addEventListener("mouseenter", onEnter);
            profileElement.addEventListener("mouseleave", onLeave);
          }
        });
      }

      // Button animations removed - no hover effects, no pulse, no arrow animations
    }, containerRef);

    return () => {
      ctx.revert();
      if (currentContainer && handleMouseMove) {
        currentContainer.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  const handleParticleRef =
    (index: number) =>
      (el: HTMLDivElement | null): void => {
        particlesRef.current[index] = el;
      };

  return (
    <section className="relative dark" aria-labelledby="hero-title">
      <div ref={containerRef}>
        <Container
          className={cn(
            "relative w-full min-h-175 h-[calc(100vh-80px)] lg:h-screen max-h-270 flex flex-col justify-center overflow-hidden text-center sm:text-left",
            className,
          )}
          mClassName=""
        >
          {/* Video & Map Transition Background */}
          <div className="absolute inset-0 overflow-hidden -z-20 bg-black">
            {/* The Map Image Background Overlay */}
            <div
              className={`absolute inset-0 z-10 transition-opacity duration-1000 ease-in-out bg-cover bg-center ${showMap ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
              style={{ backgroundImage: "url('/map.jpg')" }}
            />

            {/* The Video Background */}
            <video
              ref={videoRef}
              muted
              playsInline
              onEnded={handleVideoEnded}
              className="w-full h-full object-cover"
              poster="/static/bgs/hero-bg.svg"
            >
              <source src="/bg.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          {/* Black Overlay */}
          <div
            className="absolute inset-0 bg-black/30 -z-10"
            aria-hidden="true"
          ></div>
          {/* Floating Particles */}
          <div
            className="absolute inset-0 overflow-hidden -z-10"
            aria-hidden="true"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                ref={handleParticleRef(i)}
                className="absolute w-2 h-2 bg-white/40 rounded-full will-change-transform"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          {/* Floating Elements (Moved to outer container for edge alignment) */}
          {/* Top Left Card */}
          <div data-speed="1.2" className="parallax-wrapper absolute top-[20%] left-[5%] xl:left-[12%] w-56 h-56 hidden lg:block z-20">
            <div className="floating-card w-full h-full rounded-lg overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/creator_dj.png"
                alt="Creator DJ"
                fill
                className="object-cover"
              />
              {/* <div className="absolute top-3 right-3 px-3 py-1 bg-white text-black text-xs font-semibold rounded-sm">
                NORDIC NEST
              </div> */}
            </div>
          </div>

          {/* Top Right Tag */}
          {/* <div data-speed="0.8" className="parallax-wrapper absolute top-[15%] right-[15%] xl:right-[25%] hidden md:block z-20">
            <div className="floating-card px-6 py-3 bg-green-100 text-green-800 font-semibold rounded-md text-sm shadow-xl">
              RKET
            </div>
          </div> */}

          {/* Middle Right Content Card */}
          <div data-speed="1.5" className="parallax-wrapper absolute top-[35%] right-[15%] xl:right-[10%] transform -translate-y-1/2 hidden lg:block w-64 z-20">
            <div className="floating-card w-full bg-secondary-bg/30 backdrop-blur-md rounded-lg border border-white/10 p-6 text-left shadow-2xl">
              <p className="text-sm text-white">Content</p>
              <p className="text-xl font-bold text-primary-text flex items-center gap-1">R343.260</p>
              <div className="flex items-end gap-6 mt-6 h-12">
                <div className="w-2.5 bg-white/20 h-5 rounded-sm"></div>
                <div className="w-2.5 bg-white/20 h-8 rounded-sm"></div>
                <div className="w-2.5 bg-brand-primary h-10 rounded-sm"></div>
                <div className="w-2.5 bg-white/20 h-6 rounded-sm"></div>
              </div>
            </div>
            {/* <Image
              src="/map.jpg"
              alt="Creator DJ"
              fill
              className="object-cover"
            /> */}
          </div>

          {/* Bottom Left Tag */}
          {/* <div data-speed="0.6" className="parallax-wrapper absolute bottom-[20%] left-[15%] xl:left-[25%] hidden md:block z-20">
            <div className="floating-card px-6 py-3 bg-white text-black font-semibold rounded-md text-sm shadow-xl">
              dyson
            </div>
          </div> */}

          {/* Bottom Right Card */}
          <div data-speed="1.3" className="parallax-wrapper absolute bottom-[15%] right-[15%] xl:right-[15%] w-72 h-48 hidden lg:block z-20">
            <div className="floating-card w-full h-full rounded-lg overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/creator_guitarist.png"
                alt="Creator Guitarist"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Centered Text Content */}
          <div className="text-white space-y-6 sm:space-y-8 flex flex-col justify-evenly max-w-full sm:max-w-10/12 lg:max-w-8/12 mx-auto relative z-[99] pt-8 pointer-events-none">
            {/* Pill */}
            {/* <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-white/80 border border-white/20 flex items-center gap-2 w-fit mx-auto pointer-events-auto">
              Smart Tools & Real Growth
            </div> */}

            {/* Animated Title */}
            <h1
              id="hero-title"
              ref={titleRef}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-text leading-tight will-change-transform text-center"
            >
              Where Creators and Fans Connect<span className=""> – </span>Exclusively
            </h1>

            {/* Animated Description */}
            <p
              ref={descriptionRef}
              className="text-2xl font-medium text-primary-text max-w-3xl will-change-transform leading-relaxed text-center mx-auto"
            >
              A premium video space where creators share exclusive content and fans get closer access – through memberships, tips, and special drops.
            </p>

            {/* Button */}
            <div ref={profilesRef} className="pt-4 flex justify-center pointer-events-auto">
              <Link
                href={
                  user?.role === "Creator"
                    ? "/dashboard"
                    : user?.role === "Admin"
                      ? "admin/home"
                      : user?.role === ROLE.USER
                        ? "/overview"
                        : "/sign-up"
                }
                className="inline-block"
              >
                <button className="px-8 py-3 bg-brand-primary text-primary-text font-medium rounded-full hover:bg-transparent hover:border-brand-primary border border-brand-primary hover:text-brand-primary cursor-pointer transition-colors shadow-lg duration-300 ease-in-out">
                  {isAuthenticated ? "Go to Dashboard" : "Let's Get Started"}
                </button>
              </Link>
            </div>
          </div>
        </Container>
        {/* <div
          className="w-full flex justify-center sticky left-0 bottom-10 animate-bounce pointer-events-none"
          aria-hidden="true"
        >
          <ArrowDownIcon className="size-8 border border-white/20 rounded-full p-1.5 text-white/70" />
        </div> */}
      </div>
    </section>
  );
};

export default HeroSection;
