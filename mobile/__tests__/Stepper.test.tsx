import { fireEvent, render, screen } from "@testing-library/react-native";
import { Stepper } from "@/components/ui/Stepper";

describe("Stepper", () => {
  it("increments and decrements within bounds", async () => {
    const onChange = jest.fn();
    await render(<Stepper value={1} min={0} max={2} onChange={onChange} ariaLabel="pieces" />);
    await fireEvent.press(screen.getByLabelText("Increase pieces"));
    expect(onChange).toHaveBeenLastCalledWith(2);
    await fireEvent.press(screen.getByLabelText("Decrease pieces"));
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("clamps typed values", async () => {
    const onChange = jest.fn();
    await render(<Stepper value={1} min={0} max={5} onChange={onChange} ariaLabel="pieces" />);
    await fireEvent.changeText(screen.getByLabelText("pieces"), "9");
    expect(onChange).toHaveBeenLastCalledWith(5);
    await fireEvent.changeText(screen.getByLabelText("pieces"), "abc");
    expect(onChange).toHaveBeenLastCalledWith(0);
  });
});
