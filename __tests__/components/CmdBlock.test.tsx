import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { makeCmdBlock } from "@/components/mdx/CmdBlock";
import { LocaleProvider } from "@/contexts/LocaleContext";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <LocaleProvider locale="en">{children}</LocaleProvider>;
}

describe("CmdBlock", () => {
  it("renders command icon and highlighted code", async () => {
    const CmdImpulse = makeCmdBlock("impulse");
    const { container } = render(await CmdImpulse({ children: "/give @p diamond" }), { wrapper: Wrapper });
    const icon = container.querySelector("img");
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("alt", "impulse command block");
  });

  it("makeCmdBlock creates distinct components per icon type", async () => {
    const CmdRepeat = makeCmdBlock("repeat");
    const CmdChain = makeCmdBlock("chain");
    const { container: rContainer } = render(await CmdRepeat({ children: "/tp @p 0 64 0" }), { wrapper: Wrapper });
    const { container: cContainer } = render(await CmdChain({ children: "/setblock ~ ~-1 ~ stone" }), { wrapper: Wrapper });
    expect(rContainer.querySelector("img")).toHaveAttribute("alt", "repeat command block");
    expect(cContainer.querySelector("img")).toHaveAttribute("alt", "chain command block");
    expect(rContainer.textContent).toContain("/tp @p 0 64 0");
    expect(cContainer.textContent).toContain("/setblock ~ ~-1 ~ stone");
  });
});