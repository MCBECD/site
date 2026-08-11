import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CmdBlock, makeCmdBlock } from "@/components/mdx/CmdBlock";

describe("CmdBlock", () => {
  it("renders icon image with correct src", () => {
    const { container } = render(<CmdBlock icon="impulse">/give @p diamond</CmdBlock>);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "/icons/cmd/impulse.png");
    expect(img).toHaveAttribute("width", "20");
    expect(img).toHaveAttribute("height", "20");
  });

  it("renders children as code content", () => {
    render(<CmdBlock icon="chain">/setblock ~ ~-1 ~ stone</CmdBlock>);
    const code = screen.getByText("/setblock ~ ~-1 ~ stone");
    expect(code.tagName).toBe("CODE");
  });

  it("applies cmd-icon-wrapper and cmd-code classes", () => {
    const { container } = render(<CmdBlock icon="chat">/say hello</CmdBlock>);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("cmd-icon-wrapper");
    const code = container.querySelector(".cmd-code");
    expect(code).toBeInTheDocument();
  });

  describe("makeCmdBlock", () => {
    it("creates a component that delegates to CmdBlock", () => {
      const CmdRepeat = makeCmdBlock("repeat");
      const { container } = render(<CmdRepeat>/tp @p 0 64 0</CmdRepeat>);
      const img = container.querySelector("img")!;
      expect(img).toHaveAttribute("src", "/icons/cmd/repeat.png");
      expect(screen.getByText("/tp @p 0 64 0")).toBeInTheDocument();
    });
  });
});
