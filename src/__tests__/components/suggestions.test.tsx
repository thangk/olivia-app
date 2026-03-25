import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Suggestions } from "@/components/chat/suggestions";

describe("Suggestions", () => {
  it("renders default suggestions when none provided", () => {
    render(<Suggestions suggestions={[]} onSelect={vi.fn()} />);
    expect(
      screen.getByText("Lifestyle photo on a marble countertop with morning light")
    ).toBeDefined();
  });

  it("renders custom suggestions when provided", () => {
    render(
      <Suggestions
        suggestions={["Test suggestion 1", "Test suggestion 2"]}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByText("Test suggestion 1")).toBeDefined();
    expect(screen.getByText("Test suggestion 2")).toBeDefined();
  });

  it("calls onSelect when a suggestion is clicked", () => {
    const onSelect = vi.fn();
    render(
      <Suggestions
        suggestions={["Click me"]}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByText("Click me"));
    expect(onSelect).toHaveBeenCalledWith("Click me");
  });
});
