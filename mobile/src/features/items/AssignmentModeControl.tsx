import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useBillStore } from "@/store/billStore";
import type { AssignmentMode, Item } from "@shared/lib/types";

const MODE_OPTIONS: { value: AssignmentMode; label: string }[] = [
  { value: "equal", label: "Split equally" },
  { value: "units", label: "By portions" },
];

export function AssignmentModeControl({ item }: { item: Item }) {
  const setItemMode = useBillStore((s) => s.setItemMode);
  return (
    <SegmentedControl
      accessibilityLabel={`Assignment mode for ${item.name || "item"}`}
      options={MODE_OPTIONS}
      value={item.mode}
      onChange={(mode) => setItemMode(item.id, mode)}
    />
  );
}
