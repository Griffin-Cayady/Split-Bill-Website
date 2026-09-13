import { fireEvent, render, screen } from "@testing-library/react-native";
import { CommitInput } from "@/components/ui/CommitInput";

describe("CommitInput", () => {
  it("commits on every keystroke so a dismissed keyboard never loses input", async () => {
    const onCommit = jest.fn();
    await render(<CommitInput value="" onCommit={onCommit} accessibilityLabel="Price" />);
    const input = screen.getByLabelText("Price");
    await fireEvent.changeText(input, "12");
    expect(onCommit).toHaveBeenLastCalledWith("12");
    await fireEvent.changeText(input, "12.");
    expect(onCommit).toHaveBeenLastCalledWith("12.");
    await fireEvent(input, "submitEditing");
    expect(onCommit).toHaveBeenLastCalledWith("12.");
  });

  it("keeps the raw text while focused and normalises from the value prop after blur", async () => {
    const r = await render(<CommitInput value="" onCommit={jest.fn()} accessibilityLabel="Price" />);
    const input = screen.getByLabelText("Price");
    await fireEvent(input, "focus");
    await fireEvent.changeText(input, "12.");
    // Parent stores 1200 and passes back "12" — must not clobber the in-progress "12."
    await r.rerender(<CommitInput value="12" onCommit={jest.fn()} accessibilityLabel="Price" />);
    expect(screen.getByLabelText("Price").props.value).toBe("12.");
    await fireEvent(screen.getByLabelText("Price"), "blur");
    expect(screen.getByLabelText("Price").props.value).toBe("12");
  });

  it("resets its text when the value prop changes while unfocused", async () => {
    const r = await render(<CommitInput value="1" onCommit={jest.fn()} accessibilityLabel="Price" />);
    await r.rerender(<CommitInput value="2" onCommit={jest.fn()} accessibilityLabel="Price" />);
    expect(screen.getByLabelText("Price").props.value).toBe("2");
  });
});
