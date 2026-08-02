import { useRef, useState } from "react";
import { Button } from "../../components/ui/Button";
import { CheckIcon, DownloadIcon, LinkIcon, ShareIcon } from "../../components/ui/icons";
import { buildShareUrl, SHARE_URL_WARN_LENGTH } from "../../lib/share/link";
import { copyToClipboard } from "../../lib/clipboard";
import { computeBillResult } from "../../lib/calc";
import { useUIStore } from "../../store/uiStore";
import { ReceiptCard } from "./ReceiptCard";
import type { Bill } from "../../lib/types";

export function ShareActions({ bill }: { bill: Bill }) {
  const result = computeBillResult(bill);
  const pushToast = useUIStore((s) => s.pushToast);
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"image" | "share" | null>(null);
  const [copied, setCopied] = useState(false);

  const shareUrl = buildShareUrl(bill);
  const urlTooLong = shareUrl.length > SHARE_URL_WARN_LENGTH;
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  const canShareFiles = Boolean(nav?.canShare);

  async function handleDownload() {
    if (!cardRef.current) return;
    setBusy("image");
    try {
      const { exportReceiptImage } = await import("../../lib/share/image");
      await exportReceiptImage(cardRef.current, `split-bill-${bill.dateISO.replace(/-/g, "")}.png`);
    } catch {
      pushToast("Couldn't generate the image — try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleShareImage() {
    if (!cardRef.current || !nav?.share) return;
    setBusy("share");
    try {
      const { receiptImageBlob } = await import("../../lib/share/image");
      const blob = await receiptImageBlob(cardRef.current);
      if (!blob) throw new Error("no blob");
      const file = new File([blob], `split-bill-${bill.dateISO}.png`, { type: "image/png" });
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: bill.title });
      } else {
        await handleDownload();
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // user cancelled the native share sheet — not an error
      } else {
        pushToast("Couldn't share the image — try downloading instead.");
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleCopyLink() {
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      pushToast("Link copied ✓");
      setTimeout(() => setCopied(false), 2500);
    } else {
      pushToast("Couldn't copy automatically — select and copy the link manually.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDownload} disabled={busy !== null}>
          <DownloadIcon width={18} height={18} />
          {busy === "image" ? "Rendering…" : "Download image"}
        </Button>
        {canShareFiles && (
          <Button variant="secondary" onClick={handleShareImage} disabled={busy !== null}>
            <ShareIcon width={18} height={18} />
            {busy === "share" ? "Preparing…" : "Share image"}
          </Button>
        )}
        <Button variant="secondary" onClick={handleCopyLink}>
          {copied ? <CheckIcon width={18} height={18} /> : <LinkIcon width={18} height={18} />}
          Copy link
        </Button>
      </div>

      {urlTooLong && (
        <p className="text-xs text-accent">
          This bill makes a long link (~{Math.round(shareUrl.length / 1000)}k characters) — Download image works more reliably for
          big bills.
        </p>
      )}

      <div style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none" }} aria-hidden="true">
        <ReceiptCard ref={cardRef} bill={bill} result={result} />
      </div>
    </div>
  );
}
