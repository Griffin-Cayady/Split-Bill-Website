// The exported receipt is set in Libre Franklin; the app itself never uses it,
// so it is fetched only once someone reaches Results, not on every page load.
const HREF = "https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;600;700&display=swap";

let ready: Promise<void> | null = null;

export function loadReceiptFont(): Promise<void> {
  if (ready) return ready;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = HREF;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
  ready = new Promise<void>((resolve) => {
    link.onload = () => resolve();
    link.onerror = () => resolve(); // offline: export falls back to the system sans
  }).then(() => Promise.all(["400", "600", "700"].map((w) => document.fonts.load(`${w} 16px "Libre Franklin"`)))).then(
    () => undefined,
    () => undefined,
  );
  return ready;
}
