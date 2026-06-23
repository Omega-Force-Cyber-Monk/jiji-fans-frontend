"use client";

import React from "react";
import { TLayoutProps } from "@/types";
import Image from "@/components/ui/CImage";
import { GuestGuard } from "@/components/guards";
import Link from "next/link";

const AuthLayout = ({ children }: TLayoutProps) => {
  return (
    <GuestGuard>
      <main className="min-h-screen flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-primary-bg">
        <div className="max-w-5xl xl:max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center bg-secondary-bg p-6 sm:p-10 rounded-3xl shadow-xs border border-border-primary">
          <div className="flex flex-col items-center justify-center">
            <Link href={"/"} className="relative w-32 sm:w-40 lg:w-64 h-30 aspect-square">
              <Image
                src={`/static/2Fans-01.svg`}
                alt="+2Fans Logo"
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </Link>

            <div className="hidden md:block text-center space-y-2">
              <h2 className="text-3xl font-bold text-primary-text">
                Welcome to +2Fans
              </h2>
              <p className="text-muted-text max-w-xs">
                Where Creators & Fans Connect
              </p>
            </div>
          </div>
          <div className="w-full md:border-l md:pl-8 lg:pl-16 border-border-primary">
            {children}
          </div>
        </div>
      </main>
    </GuestGuard >
  );
};

export default AuthLayout;
