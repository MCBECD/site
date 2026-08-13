"use client";

import { HeroSection } from "./HeroSection";
import { FeatureGrid } from "./FeatureGrid";
import { StatsBar } from "./StatsBar";
import { CTASection } from "./CTASection";
import { FooterMini } from "./FooterMini";

interface LandingPageProps {
  docsCount: number;
}

export function LandingPage({ docsCount }: LandingPageProps) {
  return (
    <div className="relative">
      <HeroSection />
      <FeatureGrid />
      <StatsBar docsCount={docsCount} />
      <CTASection docsCount={docsCount} />
      <FooterMini />
    </div>
  );
}
