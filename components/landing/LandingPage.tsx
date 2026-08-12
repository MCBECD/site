"use client";

import { HeroSection } from "./HeroSection";
import { FooterMini } from "./FooterMini";

interface LandingPageProps {
  docsCount: number;
}

export function LandingPage({ docsCount }: LandingPageProps) {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-[400px] bg-grid pointer-events-none -z-10" aria-hidden="true" />
      <HeroSection docsCount={docsCount} />
      <FooterMini />
    </div>
  );
}