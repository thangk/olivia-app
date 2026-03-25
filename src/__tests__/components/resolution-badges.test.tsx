import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResolutionBadges } from "@/components/canvas/resolution-badges";

describe("ResolutionBadges", () => {
  it("renders the current resolution value", () => {
    render(<ResolutionBadges value="1K" onChange={vi.fn()} />);
    expect(screen.getByText("1K")).toBeDefined();
  });

  it("renders a button with the correct aria-label", () => {
    render(<ResolutionBadges value="2K" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Resolution: 2K" })).toBeDefined();
  });

  it("shows the selected value in the trigger", () => {
    render(<ResolutionBadges value="4K" onChange={vi.fn()} />);
    expect(screen.getByText("4K")).toBeDefined();
  });
});
