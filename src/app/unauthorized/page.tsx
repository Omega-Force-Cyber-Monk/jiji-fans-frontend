"use client";

import { ArrowRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();
  return (
    <main className="h-screen flex flex-col justify-center items-center gap-2.5 bg-primary-bg text-primary-text">
      <h1 className="text-2xl font-semibold text-primary-text">401 - Unauthorized !!</h1>
      <p className="text-center max-w-xl text-secondary-text">
        Please log in to access this page.
        Based on your role, you'll have access to specific features. Ensure you
        have the appropriate permissions to continue.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-3">
        <button
          onClick={() => router.replace("/")}
          className="inline-flex items-center justify-center gap-2 border border-border-primary hover:border-brand-primary/20 bg-secondary-bg hover:bg-primary-bg text-primary-text px-6 py-3 rounded-lg font-medium transition-all duration-200 group shadow-sm hover:shadow-md"
        >
          <HomeIcon className="w-5" />
          Home
        </button>
        <button
          onClick={() => router.push("/sign-in")}
          className="inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 group shadow-lg hover:shadow-xl"
        >
          Sign In
          <ArrowRightIcon
            className="w-4 group-hover:translate-x-1 transition-transform duration-200"
          />
        </button>
      </div>
    </main>
  );
}
