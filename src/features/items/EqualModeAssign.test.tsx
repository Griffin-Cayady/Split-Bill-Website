// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { EqualModeAssign } from "./EqualModeAssign";
import { createDefaultBill, useBillStore } from "../../store/billStore";
import type { Item } from "../../lib/types";

const people = [
  { id: "p1", name: "Ayu", color: "#2563eb" },
  { id: "p2", name: "Dimas", color: "#047857" },
  { id: "p3", name: "Mei Lin", color: "#a21caf" },
];

function seed(item: Partial<Item>) {
  const full: Item = { id: "i1", name: "Gyoza", price: 38000, quantity: 1, mode: "equal", ...item };
  useBillStore.setState({ bill: { ...createDefaultBill(), people, items: [full] } });
}

const currentItem = () => useBillStore.getState().bill.items[0];

// Re-renders from the store, as ItemRow does in the app.
function Harness() {
  const item = useBillStore((s) => s.bill.items[0]);
  return <EqualModeAssign item={item} />;
}

const chip = (name: string) => screen.getByRole("button", { name: `${name} shared Gyoza` });

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe("EqualModeAssign people chips", () => {
  it("shows one chip per person, pressed only for people on the item", () => {
    seed({ equalPersonIds: ["p1"] });
    render(<Harness />);
    expect(chip("Ayu")).toHaveAttribute("aria-pressed", "true");
    expect(chip("Dimas")).toHaveAttribute("aria-pressed", "false");
    expect(chip("Mei Lin")).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles a person on with one portion, and off again", () => {
    seed({ equalPersonIds: [] });
    render(<Harness />);

    fireEvent.click(chip("Dimas"));
    expect(currentItem().equalPersonIds).toEqual(["p2"]);
    expect(currentItem().equalQuantities).toEqual([{ personId: "p2", quantity: 1 }]);
    expect(chip("Dimas")).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(chip("Dimas"));
    expect(currentItem().equalPersonIds).toEqual([]);
    expect(currentItem().equalQuantities).toEqual([]);
    expect(chip("Dimas")).toHaveAttribute("aria-pressed", "false");
  });

  it("'Everyone' adds the missing people with one portion and keeps existing portions", () => {
    seed({ equalPersonIds: ["p1"], equalQuantities: [{ personId: "p1", quantity: 2 }] });
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Everyone" }));

    expect(new Set(currentItem().equalPersonIds)).toEqual(new Set(["p1", "p2", "p3"]));
    expect(currentItem().equalQuantities).toEqual(
      expect.arrayContaining([
        { personId: "p1", quantity: 2 },
        { personId: "p2", quantity: 1 },
        { personId: "p3", quantity: 1 },
      ]),
    );
    // Once everyone is on the item the shortcut has nothing left to do.
    expect(screen.queryByRole("button", { name: "Everyone" })).not.toBeInTheDocument();
  });
});

describe("EqualModeAssign portions", () => {
  it("keeps portions hidden while everyone has one, and shows steppers only for included people when opened", () => {
    seed({ equalPersonIds: ["p1", "p3"] });
    render(<Harness />);

    expect(screen.queryByRole("textbox", { name: /Portions for/ })).not.toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: /Adjust portions/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Hide portions" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Increase Portions for Ayu" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Increase Portions for Mei Lin" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Increase Portions for Dimas" })).not.toBeInTheDocument();
  });

  it("raising a portion updates the bill and the chip shows the multiplier", () => {
    seed({ equalPersonIds: ["p1", "p3"] });
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /Adjust portions/ }));
    fireEvent.click(screen.getByRole("button", { name: "Increase Portions for Mei Lin" }));

    expect(currentItem().equalQuantities).toEqual(expect.arrayContaining([{ personId: "p3", quantity: 2 }]));
    expect(chip("Mei Lin")).toHaveTextContent("×2");
  });

  it("opens portions straight away when someone already has more than one", () => {
    seed({ equalPersonIds: ["p1"], equalQuantities: [{ personId: "p1", quantity: 3 }] });
    render(<Harness />);
    expect(screen.getByRole("button", { name: "Hide portions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decrease Portions for Ayu" })).toBeInTheDocument();
  });

  it("lowering someone's last portion takes them off the item", () => {
    seed({ equalPersonIds: ["p1", "p2"] });
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: /Adjust portions/ }));
    fireEvent.click(screen.getByRole("button", { name: "Decrease Portions for Dimas" }));

    expect(currentItem().equalPersonIds).toEqual(["p1"]);
    expect(chip("Dimas")).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("button", { name: "Decrease Portions for Dimas" })).not.toBeInTheDocument();
  });
});
