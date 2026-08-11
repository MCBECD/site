import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LocaleProvider } from "@/contexts/LocaleContext";

// Mock IntersectionObserver (not available in jsdom)
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
vi.stubGlobal("IntersectionObserver", class MockIntersectionObserver {
  observe = mockObserve;
  disconnect = mockDisconnect;
  constructor(cb: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    // Immediately invoke callback with isIntersecting=true (sentinel visible → button hidden)
    queueMicrotask(() => cb([{ isIntersecting: true, target: null! }] as unknown as IntersectionObserverEntry[]));
  }
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <LocaleProvider locale="en">{children}</LocaleProvider>;
}

describe("ScrollToTop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  it("renders the scroll-to-top button", () => {
    render(<ScrollToTop />, { wrapper });
    const btn = screen.getByRole("button", { name: "Home" });
    expect(btn).toBeInTheDocument();
  });

  it("is hidden when sentinel is intersecting (scroll below threshold)", () => {
    render(<ScrollToTop />, { wrapper });
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("pointer-events-none");
  });

  it("calls scrollTo(0) on click", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    render(<ScrollToTop />, { wrapper });
    await user.click(screen.getByRole("button"));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
