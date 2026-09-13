import { fireEvent, render, screen } from "@testing-library/react-native";
import { CommitInput } from "@/components/ui/CommitInput";

describe("CommitInput", () => {
  it("commits on blur and on submit, not on every keystroke", async () => {
    const onCommit = jest.fn();
    await render(<CommitInput value="" onCommit={onCommit} accessibilityLabel="Price" />);
    const input = screen.getByLabelText("Price");
    await fireEvent.changeText(input, "12");
    expect(onCommit).not.toHaveBeenCalled();
    await fireEvent(input, "blur");
    expect(onCommit).toHaveBeenLastCalledWith("12");
    await fireEvent.changeText(input, "13");
    await fireEvent(input, "submitEditing");
    expect(onCommit).toHaveBeenLastCalledWith("13");
  });

  it("resets its text when the value prop changes", async () => {
    const r = await render(<CommitInput value="1" onCommit={jest.fn()} accessibilityLabel="Price" />);
    await fireEvent.changeText(screen.getByLabelText("Price"), "999");
    await r.rerender(<CommitInput value="2" onCommit={jest.fn()} accessibilityLabel="Price" />);
    expect(screen.getByLabelText("Price").props.value).toBe("2");
  });
});
