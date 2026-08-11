import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleSwitch } from "@/components/settings/ToggleSwitch";
import { Section } from "@/components/settings/Section";
import { SliderRow } from "@/components/settings/SliderRow";
import { PluginCard } from "@/components/settings/PluginCard";
import { Settings as SettingsIcon } from "lucide-react";

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

describe("PluginCard", () => {
  it("shows name, description, and toggle", () => {
    render(
      <PluginCard name="Color Theme" desc="Change colors" Icon={SettingsIcon} enabled={false} onToggle={vi.fn()}>
        <div>Plugin settings</div>
      </PluginCard>,
    );
    expect(screen.getByText("Color Theme")).toBeInTheDocument();
    expect(screen.getByText("Change colors")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("hides children when disabled, shows when enabled", () => {
    const { rerender } = render(
      <PluginCard name="BG" desc="Background" Icon={SettingsIcon} enabled={false} onToggle={vi.fn()}>
        <div>Hidden content</div>
      </PluginCard>,
    );
    expect(screen.queryByText("Hidden content")).not.toBeInTheDocument();

    rerender(
      <PluginCard name="BG" desc="Background" Icon={SettingsIcon} enabled={true} onToggle={vi.fn()}>
        <div>Hidden content</div>
      </PluginCard>,
    );
    expect(screen.getByText("Hidden content")).toBeInTheDocument();
  });

  it("calls onToggle when switch is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <PluginCard name="Test" desc="desc" Icon={SettingsIcon} enabled={false} onToggle={onToggle}>
        <div>content</div>
      </PluginCard>,
    );
    await user.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledWith(true);
  });
});
