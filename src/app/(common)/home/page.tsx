import React from "react";
import AppLink from "@/components/home/AppLink";
import DesSection from "@/components/home/DesSection";
import HeroSection from "@/components/home/HeroSection";
import PopularChannels from "@/components/home/PopularChannels";
import CreatorGrid from "@/components/home/CreatorGrid";
import MarketingHighlight from "@/components/home/MarketingHighlight";

/**
 * Hidden home route — accessible at /home.
 * This is the real home page, bypassing the prelaunch landing.
 * Only share this URL with the internal team until launch.
 */
const HiddenHomePage = () => {
  return (
    <div>
      <HeroSection />
      <PopularChannels />
      <MarketingHighlight />
      <DesSection />
      <CreatorGrid />
      <AppLink />
    </div>
  );
};

export default HiddenHomePage;
