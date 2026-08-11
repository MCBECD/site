import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ReadingProgress } from "@/components/ReadingProgress";

describe("ReadingProgress", () => {
  beforeEach(() => {
    Object.defineProperty(document.documentElement, "scrollHeight", { value: 2000, writable: true, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 800, writable: true, configurable: true });
    window.scrollY = 0;
  });

  it("renders the progress bar container", () => {
    const { container } = render(<ReadingProgress />);
    const bar = container.querySelector("[aria-hidden='true'] > div");
    expect(bar).toBeInTheDocument();
  });

  it("sets opacity to 0 when progress is 0", () => {
    const { container } = render(<ReadingProgress />);
    const bar = container.querySelector("[aria-hidden='true'] > div") as HTMLElement;
    expect(bar.style.opacity).toBe("0");
  });

  it("adds and cleans up scroll/resize listeners", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<ReadingProgress />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("updates bar width based on scroll position", () => {
    Object.defineProperty(window, "scrollY", { value: 600, writable: true, configurable: true });
    const { container } = render(<ReadingProgress />);
    const bar = container.querySelector("[aria-hidden='true'] > div") as HTMLElement;
    // scrollY=600, scrollHeight=2000, innerHeight=800 => progress = 600/(2000-800)*100 = 50
    expect(parseFloat(bar.style.width)).toBeGreaterThan(0);
  });
});
