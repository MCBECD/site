import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LocaleProvider } from "@/contexts/LocaleContext";

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("test crash");
  return <div>OK</div>;
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <LocaleProvider locale="zh-CN">{children}</LocaleProvider>;
}

describe("ErrorBoundary", () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("renders fallback UI when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText("出错了")).toBeInTheDocument();
    expect(screen.getByText("页面遇到了一个意外错误，请尝试刷新页面。")).toBeInTheDocument();
    expect(screen.getByText("重试")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
      { wrapper: Wrapper },
    );
    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
  });

  it("resets error state on retry click", async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function ToggleChild() {
      if (shouldThrow) throw new Error("boom");
      return <div>Recovered</div>;
    }

    render(
      <ErrorBoundary>
        <ToggleChild />
      </ErrorBoundary>,
      { wrapper: Wrapper },
    );

    expect(screen.getByText("出错了")).toBeInTheDocument();
    shouldThrow = false;
    await user.click(screen.getByText("重试"));
    expect(screen.getByText("Recovered")).toBeInTheDocument();
  });

  it("logs error to console.error", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
      { wrapper: Wrapper },
    );
    expect(console.error).toHaveBeenCalled();
  });
});
