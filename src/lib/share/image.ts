// Loaded via dynamic import() at call sites so html-to-image never ships in
// the initial bundle — only Results-step users who actually export pay for it.

export async function exportReceiptImage(node: HTMLElement, filename: string): Promise<void> {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export async function receiptImageBlob(node: HTMLElement): Promise<Blob | null> {
  const { toBlob } = await import("html-to-image");
  return toBlob(node, { pixelRatio: 2, cacheBust: true });
}
