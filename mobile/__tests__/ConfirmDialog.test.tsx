import { fireEvent, render, screen } from "@testing-library/react-native";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("renders nothing when closed", async () => {
    await render(<ConfirmDialog open={false} title="Reset?" onConfirm={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.queryByText("Reset?")).toBeNull();
  });

  it("calls onConfirm / onCancel", async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    await render(<ConfirmDialog open title="Reset?" confirmLabel="OK" onConfirm={onConfirm} onCancel={onCancel} />);
    await fireEvent.press(screen.getByText("OK"));
    expect(onConfirm).toHaveBeenCalled();
    await fireEvent.press(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });
});
