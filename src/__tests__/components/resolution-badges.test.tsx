import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResolutionBadges } from "@/components/canvas/resolution-badges";

describe("ResolutionBadges", () => {
  it("renders all resolution options", () => {
    render(<ResolutionBadges value="1K" onChange={vi.fn()} />);
    expect(screen.getAllByText("1K").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2K").length).toBeGreaterThan(0);
    expect(screen.getAllByText("4K").length).toBeGreaterThan(0);
  });

  it("marks the active resolution", () => {
    render(<ResolutionBadges value="2K" onChange={vi.fn()} />);
    const radios = screen.getAllByRole("radio", { name: "2K resolution" });
    const checkedRadio = radios.find(
      (r) => r.getAttribute("aria-checked") === "true"
    );
    expect(checkedRadio).toBeDefined();
  });

  it("calls onChange when a badge is clicked", () => {
    const onChange = vi.fn();
    render(<ResolutionBadges value="1K" onChange={onChange} />);
    const radios = screen.getAllByRole("radio", { name: "4K resolution" });
    // Use the last one (first may be stale from StrictMode double-render)
    fireEvent.click(radios[radios.length - 1]);
    expect(onChange).toHaveBeenCalledWith("4K");
  });
});
