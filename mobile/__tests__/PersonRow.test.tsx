import { fireEvent, render, screen } from "@testing-library/react-native";
import { PersonRow } from "@/features/people/PersonRow";
import { useBillStore } from "@/store/billStore";

function seed() {
  useBillStore.getState().resetBill();
  useBillStore.getState().addPerson("Sam");
  return useBillStore.getState().bill.people[0];
}

describe("PersonRow", () => {
  it("removes immediately when the person has no assignments", async () => {
    const person = seed();
    await render(<PersonRow person={person} hasAssignments={false} />);
    await fireEvent.press(screen.getByLabelText("Remove Sam"));
    expect(useBillStore.getState().bill.people).toHaveLength(0);
  });

  it("asks for confirmation when the person has assignments", async () => {
    const person = seed();
    await render(<PersonRow person={person} hasAssignments />);
    await fireEvent.press(screen.getByLabelText("Remove Sam"));
    expect(useBillStore.getState().bill.people).toHaveLength(1);
    await fireEvent.press(screen.getByText("Remove"));
    expect(useBillStore.getState().bill.people).toHaveLength(0);
  });

  it("renames inline", async () => {
    const person = seed();
    await render(<PersonRow person={person} hasAssignments={false} />);
    await fireEvent.changeText(screen.getByLabelText("Person name"), "Sammy");
    expect(useBillStore.getState().bill.people[0].name).toBe("Sammy");
  });
});
