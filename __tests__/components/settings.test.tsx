import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleSwitch } from "@/components/settings/ToggleSwitch";
import { Section } from "@/components/settings/Section";
import { SliderRow } from "@/components/settings/SliderRow";

describe("ToggleSwitch", () => {
  it("has role=switch and reflects checked state", () => {
    render(<ToggleSwitch checked={true} onChange={vi.fn()} />);
    const sw = screen.getByRole("switch");
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange with opposite value on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={onChange} />);
    await user.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("toggles from on to off", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleSwitch checked={true} onChange={onChange} />);
    await user.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("applies accent styling when checked", () => {
    const { container } = render(<ToggleSwitch checked={true} onChange={vi.fn()} />);
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("bg-[var(--color-accent)]");
  });
});

describe("Section", () => {
  it("renders title and children", () => {
    render(
      <Section title="Test Title">
        <p>Section content</p>
      </Section>,
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Section content")).toBeInTheDocument();
  });
});

describe("SliderRow", () => {
  it("renders label, slider, and value", () => {
    render(<SliderRow label="Opacity" value={60} onChange={vi.fn()} />);
    expect(screen.getByText("Opacity")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue("60");
  });

  it("calls onChange when slider value changes", () => {
    const onChange = vi.fn();
    render(<SliderRow label="Blur" value={5} onChange={onChange} max={20} />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "10" } });
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("respects max prop", () => {
    render(<SliderRow label="Test" value={3} onChange={vi.fn()} max={20} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("max", "20");
  });
});