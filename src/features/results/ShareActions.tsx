import { useEffect, useRef, useState } from "react";
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
  const [showLinkField, setShowLinkField] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ scale: 1, height: 0 });

  // Fit the fixed 640px receipt to the available width. The scale lives on a
  // wrapper, so the exported image is always rendered at full size.
  useEffect(() => {
    if (!previewOpen || !frameRef.current || !cardRef.current) return;
    const frameEl = frameRef.current;
    const cardEl = cardRef.current;
    const measure = () => {
      const scale = Math.min(1, frameEl.clientWidth / cardEl.offsetWidth);
      setFrame({ scale, height: cardEl.offsetHeight * scale });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(frameEl);
    observer.observe(cardEl);
    return () => observer.disconnect();
  }, [previewOpen]);

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
      pushToast("Link copied");
      setTimeout(() => setCopied(false), 2500);
    } else {
      setShowLinkField(true);
      pushToast("Couldn't copy automatically — the link is shown below.");
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
        <Button variant="secondary" onClick={() => setPreviewOpen((v) => !v)} aria-expanded={previewOpen} aria-controls="receipt-preview">
          {previewOpen ? "Hide receipt" : "Preview receipt"}
        </Button>
        <Button variant="secondary" onClick={handleCopyLink}>
          {copied ? <CheckIcon width={18} height={18} /> : <LinkIcon width={18} height={18} />}
          Copy link
        </Button>
      </div>

      {showLinkField && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-ink">Share link — select it and copy</span>
          <input
            readOnly
            value={shareUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="h-11 rounded-xl border-[1.5px] border-field-border bg-paper px-3 font-mono text-sm text-ink focus:border-accent focus:ring-2 focus:ring-accent/60 focus:outline-none"
          />
        </label>
      )}

      {urlTooLong && (
        <p className="text-xs text-accent">
          This bill makes a long link (~{Math.round(shareUrl.length / 1000)}k characters) — Download image works more reliably for
          big bills.
        </p>
      )}

      {/* One receipt element serves both the inline preview and the image export. */}
      <div
        id="receipt-preview"
        ref={frameRef}
        aria-hidden={!previewOpen}
        style={
          previewOpen
            ? { height: frame.height, overflow: "hidden" }
            : { position: "fixed", left: -9999, top: 0, pointerEvents: "none" }
        }
      >
        <div style={previewOpen ? { width: 640, transform: `scale(${frame.scale})`, transformOrigin: "top left" } : undefined}>
          <ReceiptCard ref={cardRef} bill={bill} result={result} />
        </div>
      </div>
    </div>
  );
}
