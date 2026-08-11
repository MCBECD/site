import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LocaleProvider } from "@/contexts/LocaleContext";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <LocaleProvider locale="zh-CN">{children}</LocaleProvider>;
}

/**
 * The component uses IntersectionObserver to detect scroll position.
 * jsdom doesn't provide it, so we mock it with helpers to simulate state.
 * The callback only uses the entry argument, so we pass null for observer.
 */

let currentObserver: { cb: IntersectionObserverCallback } | null = null;

class MockIntersectionObserver {
  private cb: IntersectionObserverCallback;
  root: Element | null = null;
  rootMargin = "0px";
  thresholds = [0] as ReadonlyArray<number>;

  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
    currentObserver = { cb };
  }

  observe() {
    // Simulate initial state: sentinel is intersecting (user at top) → button hidden
    this.cb([{ isIntersecting: true, target: null! } as IntersectionObserverEntry], null!);
  }

  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

beforeEach(() => {
  currentObserver = null;
  window.scrollTo = vi.fn();
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

describe("ScrollToTop", () => {
  it("renders the scroll-to-top button", () => {
    render(<ScrollToTop />, { wrapper: Wrapper });
    const btn = screen.getByRole("button", { name: "首页" });
    expect(btn).toBeInTheDocument();
  });

  it("is hidden when at the top of the page", () => {
    render(<ScrollToTop />, { wrapper: Wrapper });
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("pointer-events-none");
  });

  it("becomes visible when scrolled past threshold", () => {
    render(<ScrollToTop />, { wrapper: Wrapper });
    act(() => {
      currentObserver?.cb([{ isIntersecting: false, target: null! } as IntersectionObserverEntry], null!);
    });
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("pointer-events-auto");
  });

  it("calls scrollTo(0) on click", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    render(<ScrollToTop />, { wrapper: Wrapper });
    act(() => {
      currentObserver?.cb([{ isIntersecting: false, target: null! } as IntersectionObserverEntry], null!);
    });
    await user.click(screen.getByRole("button"));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
