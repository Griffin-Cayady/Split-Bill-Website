import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { useBillStore } from "../../store/billStore";
import type { AssignmentMode, Item } from "../../lib/types";

const MODE_OPTIONS: { value: AssignmentMode; label: string }[] = [
  { value: "equal", label: "Split evenly" },
  { value: "units", label: "Count pieces" },
];

export function AssignmentModeControl({ item }: { item: Item }) {
  const setItemMode = useBillStore((s) => s.setItemMode);
  return (
    <SegmentedControl
      aria-label={`How to split ${item.name.trim() || "this item"}`}
      options={MODE_OPTIONS}
      value={item.mode}
      onChange={(mode) => setItemMode(item.id, mode)}
      className="w-full overflow-x-auto sm:w-auto"
    />
  );
}
