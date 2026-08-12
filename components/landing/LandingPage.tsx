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
      {/* Grid background pattern — top section only, fades out */}
      <div className="absolute inset-x-0 top-0 h-[600px] bg-grid pointer-events-none -z-10" aria-hidden="true" />

      <HeroSection />
      <FeatureGrid />
      <StatsBar docsCount={docsCount} />
      <CTASection docsCount={docsCount} />
      <FooterMini />
    </div>
  );
}
