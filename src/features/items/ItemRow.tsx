import type { ReactElement } from "react";
import { ItemForm } from "./ItemForm";
import { ItemFormMobile } from "./ItemFormMobile";
import { ItemDiscount } from "./ItemDiscount";
import { AssignmentModeControl } from "./AssignmentModeControl";
import { EqualModeAssign } from "./EqualModeAssign";
import { UnitsModeAssign } from "./UnitsModeAssign";
import { useMediaQuery, isMobileQuery } from "../../hooks/useMediaQuery";
import { itemElementId } from "./jumpToItem";
import type { AssignmentMode, Item } from "../../lib/types";

const MODE_COMPONENT: Record<AssignmentMode, (props: { item: Item }) => ReactElement> = {
  equal: EqualModeAssign,
  units: UnitsModeAssign,
};

export function ItemRow({ item, onDelete }: { item: Item; onDelete: () => void }) {
  const isMobile = useMediaQuery(isMobileQuery);
  // Fall back to equal-split for any mode this build no longer recognizes
  // (e.g. stale localStorage/shared links from an older schema) instead of crashing.
  const ModeAssign = MODE_COMPONENT[item.mode] ?? EqualModeAssign;

  return (
    <div
      id={itemElementId(item.id)}
      className="flex scroll-mt-6 flex-col gap-3.5 rounded-2xl border-[1.5px] border-border bg-paper-raised p-4"
    >
      {isMobile ? (
        <>
          <ItemFormMobile item={item} onDelete={onDelete} />
          {/* The "add discount" trigger is inline in ItemFormMobile; only the full editing box needs a slot here. */}
          {item.discount && <ItemDiscount item={item} />}
        </>
      ) : (
        <>
          <ItemForm item={item} onDelete={onDelete} />
          <ItemDiscount item={item} />
        </>
      )}
      <AssignmentModeControl item={item} />
      <ModeAssign item={item} />
    </div>
  );
}
