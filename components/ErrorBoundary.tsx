"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary — 防止组件崩溃导致整页白屏
 *
 * 用法：<ErrorBoundary><YourComponent /></ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-bg-tertiary)] mb-4">
            <svg className="w-6 h-6 text-[var(--color-text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">Something went wrong</h2>
          <p className="text-xs text-[var(--color-text-tertiary)] max-w-sm">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 text-xs rounded-lg bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
