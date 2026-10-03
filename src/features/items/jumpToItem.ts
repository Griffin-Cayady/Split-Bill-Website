export function itemElementId(itemId: string) {
  return `item-${itemId}`;
}

/**
 * Scrolls an item card into view, briefly highlights it and moves focus into
 * it — so a "what's blocking Next" hint leads straight to the fix.
 */
export function jumpToItem(itemId: string) {
  const el = document.getElementById(itemElementId(itemId));
  if (!el) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
  el.classList.remove("attention-flash");
  // Force a reflow so re-triggering the highlight restarts its animation.
  void el.offsetWidth;
  el.classList.add("attention-flash");
  const target = el.querySelector<HTMLElement>("input, button");
  target?.focus({ preventScroll: true });
}
