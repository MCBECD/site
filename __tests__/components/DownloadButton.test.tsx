import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DownloadButton } from "@/components/DownloadButton";
import { LocaleProvider } from "@/contexts/LocaleContext";

vi.mock("next/navigation", () => ({
  usePathname: () => "/docs/test",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <LocaleProvider locale="zh-CN">{children}</LocaleProvider>;
}

describe("DownloadButton", () => {
  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:http://localhost/fake");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  it("renders the download button with icon", () => {
    render(<DownloadButton filename="test-doc" getContent={() => "# Test"} />, { wrapper: Wrapper });
    const btn = screen.getByTitle("下载");
    expect(btn).toBeInTheDocument();
  });

  it("creates a blob and triggers download on click", () => {
    render(<DownloadButton filename="cmd-execute" getContent={() => "some content"} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTitle("下载"));
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});
