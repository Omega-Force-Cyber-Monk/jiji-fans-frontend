"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/16/solid";

const Custom404: React.FC = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Container mClassName="min-h-screen flex items-center justify-center">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left Content Section */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
              Oops!
              <br />
              Page not found
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-md mx-auto lg:mx-0">
              Something went wrong. It&apos;s look like the link is broken or
              the page is removed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 group shadow-lg hover:shadow-xl"
            >
              <HomeIcon className="size-5" />
              Home
              {/* <BsArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform duration-200"
              /> */}
            </Link>

            <button
              onClick={handleGoBack}
              className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 group shadow-sm hover:shadow-md"
            >
              <ArrowLeftIcon className="size-5 group-hover:-translate-x-1 transition-transform duration-200" />
              Go Back
            </button>
          </div>
        </div>

        {/* Right Illustration Section */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg">
            {/* Main Blue Container */}
            <div className="border-2 border-blue-400 rounded-2xl bg-white p-8 lg:p-12 relative overflow-hidden shadow-lg">
              {/* Floating Decorative Elements */}
              <div className="absolute top-6 right-6">
                <div className="flex gap-2">
                  <div className="w-4 h-1 bg-blue-500 rounded-full transform rotate-12"></div>
                  <div className="w-6 h-1 bg-blue-400 rounded-full transform -rotate-12"></div>
                </div>
              </div>

              <div className="absolute top-12 left-6">
                <div className="w-8 h-8 bg-blue-500 rounded-full animate-bounce"></div>
              </div>

              <div className="absolute bottom-8 right-8">
                <div className="w-6 h-6 bg-blue-400 rounded-full animate-pulse"></div>
              </div>

              <div className="absolute bottom-16 left-8">
                <div className="w-4 h-4 bg-blue-300 rounded-full animate-bounce delay-300"></div>
              </div>

              {/* Browser Window Mock */}
              <div className="absolute top-8 left-8 opacity-30">
                <div className="w-16 h-12 border border-gray-300 rounded bg-white">
                  <div className="flex gap-1 p-1">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="px-1 pb-1">
                    <div className="w-full h-6 bg-gray-100 rounded-sm"></div>
                  </div>
                </div>
              </div>

              {/* Central Robot Character */}
              <div className="flex flex-col items-center justify-center py-8">
                {/* Robot Head with 404 Display */}
                <div className="relative mb-4">
                  {/* Antenna */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                    <div className="w-0.5 h-4 bg-gray-600"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>

                  {/* Head */}
                  <div className="w-24 h-16 bg-gray-800 rounded-t-3xl flex items-center justify-center">
                    <div className="bg-gray-900 text-white text-lg font-bold px-3 py-1 rounded border-2 border-gray-700">
                      404
                    </div>
                  </div>
                </div>

                {/* Robot Body */}
                <div className="w-20 h-28 bg-gray-700 rounded-lg relative mb-4">
                  {/* Chest Panel */}
                  <div className="absolute inset-4 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full relative">
                      <div className="absolute inset-1 bg-blue-400 rounded-full animate-spin">
                        <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1"></div>
                      </div>
                    </div>
                  </div>

                  {/* Side Panels */}
                  <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-gray-600 rounded-full"></div>
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-2 h-8 bg-gray-600 rounded-full"></div>
                </div>

                {/* Robot Arms */}
                <div className="flex justify-between w-32 -mt-8 mb-4">
                  <div className="w-12 h-3 bg-gray-600 rounded-full transform rotate-12 origin-left"></div>
                  <div className="w-12 h-3 bg-gray-600 rounded-full transform -rotate-12 origin-right"></div>
                </div>

                {/* Robot Legs */}
                <div className="flex gap-3 mb-2">
                  <div className="w-4 h-16 bg-gray-600 rounded-full relative">
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gray-700 rounded-full"></div>
                  </div>
                  <div className="w-4 h-16 bg-gray-600 rounded-full relative">
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gray-700 rounded-full"></div>
                  </div>
                </div>

                {/* Robot Feet */}
                <div className="flex gap-2">
                  <div className="w-8 h-4 bg-gray-800 rounded-full"></div>
                  <div className="w-8 h-4 bg-gray-800 rounded-full"></div>
                </div>
              </div>

              {/* Additional Decorative Elements */}
              <div className="absolute top-16 right-12 opacity-20">
                <div className="w-6 h-6 border-2 border-gray-400 rounded transform rotate-45"></div>
              </div>

              <div className="absolute bottom-20 left-12 opacity-20">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              </div>

              {/* Scattered Small Elements */}
              <div className="absolute top-20 left-16 w-1 h-1 bg-blue-400 rounded-full"></div>
              <div className="absolute bottom-24 right-16 w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
              <div className="absolute top-32 right-20 w-1 h-1 bg-blue-500 rounded-full"></div>

              {/* Floating Lines */}
              <div className="absolute top-10 right-16 opacity-30">
                <div className="w-8 h-0.5 bg-gray-400 rounded-full transform -rotate-12"></div>
              </div>
              <div className="absolute bottom-12 left-16 opacity-30">
                <div className="w-6 h-0.5 bg-gray-400 rounded-full transform rotate-45"></div>
              </div>
            </div>

            {/* External Floating Elements */}
            <div className="absolute -top-4 -left-4 w-8 h-6 border-2 border-blue-200 rounded-lg opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-4 border-2 border-blue-300 rounded opacity-50"></div>
            <div className="absolute top-1/2 -left-6 w-4 h-4 bg-blue-100 rounded-full opacity-40"></div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Custom404;
