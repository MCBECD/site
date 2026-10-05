"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { Modal } from "./Modal";

type Mode = "login" | "signup";

const inputClass =
  "w-full px-3.5 py-2.5 text-[13px] rounded-[var(--radius-sm)] " +
  "text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] " +
  "border border-[var(--color-border)] placeholder:text-[var(--color-text-tertiary)] " +
  "focus:outline-none focus:border-[var(--color-accent)]/50 transition-colors duration-[var(--duration-fast)]";

export function LoginModal() {
  const { isLoginOpen, closeLogin, signIn, signUp, signInWithGitHub } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [gitHubSubmitting, setGitHubSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleGitHub = useCallback(async () => {
    setGitHubSubmitting(true);
    setError(null);
    try {
      await signInWithGitHub();
    } catch (err) {
      setError((err as Error).message || "GitHub 登录失败，请重试");
      setGitHubSubmitting(false);
    }
  }, [signInWithGitHub]);

  const switchMode = useCallback((next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !password) {
        setError("请输入邮箱和密码");
        return;
      }
      setSubmitting(true);
      setError(null);
      setNotice(null);
      try {
        if (mode === "login") {
          await signIn(email.trim(), password);
          closeLogin();
          setEmail("");
          setPassword("");
        } else {
          const msg = await signUp(email.trim(), password);
          if (msg) {
            setNotice(msg);
            setPassword("");
          } else {
            closeLogin();
            setEmail("");
            setPassword("");
          }
        }
      } catch (err) {
        setError((err as Error).message || "操作失败，请重试");
      } finally {
        setSubmitting(false);
      }
    },
    [mode, email, password, signIn, signUp, closeLogin],
  );

  if (!isLoginOpen) return null;

  return (
    <Modal
      onClose={closeLogin}
      title={mode === "login" ? "登录" : "注册"}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <button
          type="button"
          onClick={handleGitHub}
          disabled={gitHubSubmitting}
          className="w-full py-2.5 mt-1 text-[13px] font-medium rounded-[var(--radius-sm)]
            text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)]
            border border-[var(--color-border)]
            inline-flex items-center justify-center gap-2
            hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]
            active:scale-[0.98]
            disabled:opacity-60 disabled:active:scale-100
            transition-[opacity,transform,color,border-color] duration-[var(--duration-fast)]"
        >
          <GithubIcon className="w-4 h-4" />
          {gitHubSubmitting ? "跳转中..." : "使用 GitHub 登录"}
        </button>

        <div className="flex items-center gap-2 pt-1">
          <span className="h-px flex-1 bg-[var(--color-border)]" />
          <span className="text-[12px] text-[var(--color-text-tertiary)]">或</span>
          <span className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        <div>
          <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">
            邮箱
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-[12px] text-[var(--color-text-secondary)] mb-1.5">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "至少 6 位" : "••••••••"}
            className={inputClass}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        {error && (
          <p className="text-[12px] text-red-500" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="text-[12px] text-[var(--color-accent)]" role="status">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 mt-1 text-[13px] font-medium rounded-[var(--radius-sm)]
            text-[var(--color-on-accent)] bg-[var(--color-accent)]
            hover:opacity-90 active:scale-[0.98]
            disabled:opacity-60 disabled:active:scale-100
            transition-[opacity,transform] duration-[var(--duration-fast)]"
        >
          {submitting ? "请稍候..." : mode === "login" ? "登录" : "注册"}
        </button>

        <div className="flex items-center justify-center gap-1 pt-1 text-[12px] text-[var(--color-text-tertiary)]">
          <span>{mode === "login" ? "还没有账号？" : "已有账号？"}</span>
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            className="text-[var(--color-accent)] hover:underline underline-offset-2"
          >
            {mode === "login" ? "去注册" : "去登录"}
          </button>
        </div>
      </form>
    </Modal>
  );
}