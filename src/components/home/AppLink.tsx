"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import SectionContainer from "@/components/ui/SectionContainer";

export default function AppLink() {
  return (
    <section className="relative w-full min-h-[500px] overflow-hidden py-12 bg-primary-bg">
      {/* Background Map Image */}
      {/* <div className="absolute inset-0 z-0">
        <Image
          src="/map.jpg"
          alt="Map Background"
          fill
          className="object-cover opacity-55 dark:opacity-10 grayscale pointer-events-none select-none"
          priority
        />
      </div> */}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary-bg/25 via-primary-bg/10 to-transparent z-10 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-20 flex items-center justify-center min-h-[600px] p-6">
        <SectionContainer className="flex flex-col lg:flex-row items-center justify-center gap-12 p-6 md:p-12">

          {/* Left Side: Phone Mockup */}
          <div className="relative w-64 sm:w-96 aspect-[9/16] order-2 lg:order-1 flex items-center justify-center">
            <Image src="/X Mockup.png" alt="App Mockup" fill className="object-contain" />
          </div>

          {/* Right Side: Content */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 text-primary-text text-center lg:text-left order-1 lg:order-2">

            <div className="flex justify-center lg:justify-start">
              <Image src="/static/2Fans-02.svg" alt="App Icon" width={56} height={56} />
            </div>

            <h2 className="font-serif! text-3xl sm:text-4xl lg:text-5xl font-semibold leading-relaxed">
              DOWNLOAD AND <br className="hidden lg:block" />
              SUPPORT YOUR <br className="hidden lg:block" />
              <span className="text-brand-primary">FAVORITE CREATORS</span>
            </h2>

            <p className="text-base! font-normal text-secondary-text max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Available on iOS and Android. Subscribe to exclusive multi-category content, connect directly with creators, and unlock deeper, granular real-time analytics dashboards.
            </p>

            {/* Get the App Box */}
            <div className="flex flex-col gap-6">
              <h4 className="text-lg font-semibold uppercase tracking-wider text-brand-primary text-center lg:text-left">Get the App</h4>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Link href="#" className="flex items-center gap-6 bg-primary-bg hover:bg-secondary-bg border border-border-primary transition p-6 rounded-md shadow-md w-full sm:w-auto justify-center">
                  <Image
                    src="/static/home/app-store.svg"
                    alt="App Store"
                    width={160}
                    height={48}
                    className="w-auto h-10 hover:scale-105 transition-transform"
                  />
                </Link>

                <Link href="#" className="flex items-center gap-6 bg-primary-bg hover:bg-secondary-bg border border-border-primary transition p-6 rounded-md shadow-md w-full sm:w-auto justify-center">
                  <Image
                    src="/static/home/play-store.svg"
                    alt="Play Store"
                    width={160}
                    height={48}
                    className="w-auto h-10 hover:scale-105 transition-transform"
                  />
                </Link>
              </div>
            </div>

          </div>

        </SectionContainer>
      </div>
    </section>
  );
}
