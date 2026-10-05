import { Suspense } from "react";
import { CommunityDetailClient } from "./CommunityDetailClient";

export default function CommunityPage() {
  return (
    <Suspense fallback={null}>
      <CommunityDetailClient />
    </Suspense>
  );
}