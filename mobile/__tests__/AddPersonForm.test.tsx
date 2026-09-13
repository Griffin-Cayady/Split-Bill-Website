import { fireEvent, render, screen } from "@testing-library/react-native";
import { AddPersonForm } from "@/features/people/AddPersonForm";
import { useBillStore } from "@/store/billStore";

describe("AddPersonForm", () => {
  beforeEach(() => useBillStore.getState().resetBill());

  it("adds a trimmed name and clears the input", async () => {
    await render(<AddPersonForm count={0} />);
    const input = screen.getByPlaceholderText("Type a name, e.g. Sam");
    await fireEvent.changeText(input, "  Sam ");
    await fireEvent.press(screen.getByText("Add"));
    expect(useBillStore.getState().bill.people.map((p) => p.name)).toEqual(["Sam"]);
    expect(screen.getByPlaceholderText("Type a name, e.g. Sam").props.value).toBe("");
  });

  it("submits from the keyboard", async () => {
    await render(<AddPersonForm count={0} />);
    const input = screen.getByPlaceholderText("Type a name, e.g. Sam");
    await fireEvent.changeText(input, "Kim");
    await fireEvent(input, "submitEditing");
    expect(useBillStore.getState().bill.people).toHaveLength(1);
  });

  it("is disabled at the soft cap", async () => {
    await render(<AddPersonForm count={20} />);
    expect(screen.getByPlaceholderText("Max 20 people").props.editable).toBe(false);
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });
});
