import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollToTop } from "@/components/ScrollToTop";

describe("ScrollToTop", () => {
  beforeEach(() => {
    window.scrollY = 0;
    window.scrollTo = vi.fn();
  });

  it("renders the scroll-to-top button", () => {
    render(<ScrollToTop />);
    const btn = screen.getByRole("button", { name: "Scroll to top" });
    expect(btn).toBeInTheDocument();
  });

  it("is hidden when scroll position is below threshold", () => {
    window.scrollY = 100;
    render(<ScrollToTop />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("pointer-events-none");
  });

  it("becomes visible when scrolled past threshold (320px)", () => {
    window.scrollY = 500;
    render(<ScrollToTop />);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("pointer-events-auto");
  });

  it("calls scrollTo(0) on click", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    window.scrollY = 500;
    render(<ScrollToTop />);
    await user.click(screen.getByRole("button"));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});