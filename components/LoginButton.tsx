"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Github, LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

export function LoginButton() {
  const { user, loading, isLoggedIn, login, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <span className="p-1.5 text-[var(--color-text-tertiary)]">
        <Loader2 className="w-5 h-5 animate-spin" />
      </span>
    );
  }

  if (!isLoggedIn) {
    return (
      <button
        onClick={login}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm
          bg-[var(--color-accent)] text-white
          hover:bg-[var(--color-accent-hover)] transition-colors"
        title="Login with GitHub"
      >
        <Github className="w-4 h-4" />
        <span className="hidden sm:inline">登录</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 p-1 rounded-md
          hover:bg-[var(--color-bg-tertiary)] transition-colors"
        title={user?.login ?? "User"}
      >
        {user?.avatar_url && (
          <img
            src={user.avatar_url}
            alt={user.login}
            width={24}
            height={24}
            className="w-6 h-6 rounded-full ring-1 ring-[var(--color-border)]"
          />
        )}
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute right-0 top-full mt-1 w-48 py-1 rounded-md
              border border-[var(--color-border)] bg-[var(--color-bg-primary)]
              shadow-lg z-50"
          >
            <div className="px-3 py-2 border-b border-[var(--color-border)]">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                {user?.name || user?.login}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] truncate">
                @{user?.login}
              </p>
            </div>
            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm
                text-[var(--color-text-secondary)]
                hover:bg-[var(--color-sidebar-hover)]
                hover:text-[var(--color-text-primary)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </>
      )}
    </div>
  );
}
