"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

interface AuthState {
  user: GitHubUser | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: () => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const STORAGE_KEY = "mcbecd-auth";
const CLIENT_ID = "Iv23liXqF0FjDMRB3hqO"; // 创建后替换

const AuthContext = createContext<AuthContextValue | null>(null);

function loadAuth(): AuthState {
  if (typeof window === "undefined") return { user: null, token: null, loading: true };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, token: null, loading: false };
    const parsed = JSON.parse(raw);
    return {
      user: parsed.user ?? null,
      token: parsed.token ?? null,
      loading: false,
    };
  } catch {
    return { user: null, token: null, loading: false };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => loadAuth());

  /* @side-effect 处理 OAuth 回调 — Cloudflare Function redirect 回来带 token 和 user 参数 */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userJson = params.get("user");
    const error = params.get("auth_error");

    if (error) {
      console.error("Auth error:", error);
      return;
    }

    if (token && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson)) as GitHubUser;
        const newState = { user, token, loading: false };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        setState(newState);

        // 清除 URL 参数
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        url.searchParams.delete("user");
        window.history.replaceState({}, "", url.toString());
      } catch {
        // invalid params
      }
    }
  }, []);

  /* @side-effect 验证已存的 token */
  useEffect(() => {
    if (!state.token || state.user || state.loading) return;

    let cancelled = false;
    fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${state.token}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("invalid token");
        return res.json();
      })
      .then((user: GitHubUser) => {
        if (cancelled) return;
        const newState = { user, token: state.token, loading: false };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        setState(newState);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem(STORAGE_KEY);
        setState({ user: null, token: null, loading: false });
      });

    return () => { cancelled = true; };
  }, [state.token]);

  const login = useCallback(() => {
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/api/auth/callback`,
    );
    window.location.href =
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&scope=read:user`;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, token: null, loading: false });
  }, []);

  return (
    <AuthContext
      value={{
        ...state,
        login,
        logout,
        isLoggedIn: state.user !== null,
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
