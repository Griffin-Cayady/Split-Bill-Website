import { fireEvent, render, screen } from "@testing-library/react-native";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("fires onPress and renders its label", async () => {
    const onPress = jest.fn();
    await render(<Button onPress={onPress}>Add</Button>);
    await fireEvent.press(screen.getByText("Add"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire when disabled", async () => {
    const onPress = jest.fn();
    await render(
      <Button onPress={onPress} disabled>
        Add
      </Button>,
    );
    await fireEvent.press(screen.getByText("Add"));
    expect(onPress).not.toHaveBeenCalled();
  });
});
