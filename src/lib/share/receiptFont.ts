// The exported receipt is set in Geist and Geist Mono, which index.html already
// links. Before rasterising, wait until the exact weights the receipt uses are
// loaded, so the image never captures a fallback font.
const FACES = ['400 16px "Geist"', '600 16px "Geist"', '700 16px "Geist"', '400 16px "Geist Mono"', '600 16px "Geist Mono"'];

let ready: Promise<void> | null = null;

export function loadReceiptFont(): Promise<void> {
  if (ready) return ready;
  ready = Promise.all(FACES.map((face) => document.fonts.load(face))).then(
    () => undefined,
    () => undefined, // offline: export falls back to the system sans
  );
  return ready;
}
