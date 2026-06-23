"use client";

import React, { useState, useCallback } from "react";
import { useWaitlistStore } from "./useWaitlistStore";
import { WaitlistEntry } from "./waitlist.types";
import { type PrelaunchView } from "./prelaunch.constants";
import AmbientBg from "./AmbientBg";
import PrelaunchLogo from "./PrelaunchLogo";
import Slide from "./Slide";
import HeroView from "./HeroView";
import SuccessView from "./SuccessView";
import WaitlistForm from "./WaitlistForm";
import AnimatedNumber from "../ui/AnimatedNumber";

import { useJoinCreatorWaitlistMutation, useGetCreatorWaitlistQuery } from "@/redux/features/creatorWaitlist/creatorWaitlist.api";
import { useGetAllCategoriesQuery, TCategory } from "@/redux/features/category/category.api";
import { errorAlert, TResError } from "@/lib/alerts";

export default function PrelaunchLandingPage() {
  const { entries, addEntry } = useWaitlistStore();
  const [view, setView] = useState<PrelaunchView>("hero");
  const [lastEntry, setLastEntry] = useState<WaitlistEntry | null>(null);
  const [joinCreatorWaitlist] = useJoinCreatorWaitlistMutation();
  const { data: waitlistData } = useGetCreatorWaitlistQuery({ page: 1, limit: 1 });
  const waitlistCount = waitlistData?.data?.pagination?.total ?? 0;

  const { data: categoriesData } = useGetAllCategoriesQuery({ limit: 100 });
  const categories: TCategory[] = categoriesData?.data?.categories || [];
  const categoryCount = categoriesData?.data?.pagination?.total ?? categories.length;

  const handleJoin = useCallback(() => setView("form"), []);

  const handleSubmit = useCallback(
    async (entry: WaitlistEntry) => {
      try {
        await joinCreatorWaitlist({
          name: entry.name,
          email: entry.email,
          whatsapp: entry.whatsapp || "",
          categoryId: entry.category,
        }).unwrap();

        addEntry(entry);
        setLastEntry(entry);
        setView("success");
      } catch (error) {
        errorAlert({
          error: error as TResError,
          title: "Failed to join waitlist",
        });
        throw error;
      }
    },
    [joinCreatorWaitlist, addEntry]
  );

  const handleReset = useCallback(() => {
    setLastEntry(null);
    setView("hero");
  }, []);

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden!">
      <AmbientBg />

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex-none w-full px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="container mx-auto w-full flex items-center justify-between">
          <PrelaunchLogo />
          <div className="flex items-center gap-3">
            {view !== "hero" && (
              <button
                id="prelaunch-nav-back-btn"
                onClick={() => setView("hero")}
                className="text-sm text-muted-text hover:text-white transition-colors font-normal"
              >
                ← Back
              </button>
            )}
            {view === "hero" && (
              <button
                id="prelaunch-nav-join-btn"
                onClick={handleJoin}
                className="px-5 py-2 rounded-md bg-brand-primary text-white text-sm font-medium hover:bg-brand-secondary transition-all duration-200 shadow-lg shadow-brand-primary/25"
              >
                Join Waitlist
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Content area ── */}
      <div className="relative z-10 flex-1 w-full overflow-hidden">
        <Slide visible={view === "hero"} direction="up">
          <HeroView entryCount={waitlistCount} categoryCount={categoryCount} onJoin={handleJoin} />
        </Slide>

        <Slide visible={view === "form"} direction="down">
          <div className="w-full h-full flex flex-col items-center justify-center px-6 overflow-y-auto py-6">
            <div className="w-full" style={{ maxWidth: "520px" }}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-white mb-1.5">
                  Join the Creator Waitlist
                </h2>
                <p className="text-sm text-white! font-normal">
                  Be first to launch on{" "}
                  <span className="text-brand-primary">+2Fans</span> — Africa&apos;s creator platform.
                </p>
              </div>
              <div
                className="rounded-lg p-6 sm:p-8 border border-white/8"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(0,176,90,0.05) 100%)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <WaitlistForm categories={categories} onSubmit={handleSubmit} />
              </div>
              {waitlistCount > 0 && (
                <p className="mt-3 text-center text-xs text-muted-text font-normal">
                  🎉{" "}
                  <span className="text-brand-primary font-medium">
                    <AnimatedNumber target={waitlistCount} />
                  </span>{" "}
                  creator{waitlistCount !== 1 ? "s" : ""} already on the waitlist
                </p>
              )}
            </div>
          </div>
        </Slide>

        <Slide visible={view === "success"} direction="down">
          <div className="w-full h-full flex items-center justify-center px-6 overflow-y-auto py-6">
            {view === "success" && (
              <SuccessView entry={lastEntry} onReset={handleReset} />
            )}
          </div>
        </Slide>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 flex-none border-t border-white/5 px-6 py-3 flex items-center justify-start gap-4">
        <p className="text-xs text-muted-text font-normal hidden sm:block">
          © {new Date().getFullYear()} +2Fans · Africa&apos;s creator economy, reimagined.
        </p>

      </footer>
    </div>
  );
}
