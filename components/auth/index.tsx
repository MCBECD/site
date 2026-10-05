"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { LoginModal } from "./LoginModal";
import { DetailModal } from "./DetailModal";

export function AuthModals() {
  return (
    <>
      <LoginModal />
      <DetailModal />
    </>
  );
}

export function AuthBoundary({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <AuthModals />
    </AuthProvider>
  );
}