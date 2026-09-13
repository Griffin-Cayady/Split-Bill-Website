import { useState } from "react";
import { Text, View } from "react-native";
import { Button, ButtonLabel } from "@/components/ui/Button";
import { CheckIcon, DownloadIcon, LinkIcon, ShareIcon } from "@/components/ui/icons";
import { useInkColor } from "@/components/ui/useInkColor";
import { copyLink, shareLink, shareUrlFor } from "@/lib/share";
import { computeBillResult } from "@shared/lib/calc";
import { SHARE_URL_WARN_LENGTH } from "@shared/lib/share/link";
import { useUIStore } from "@shared/store/uiStore";
import type { Bill } from "@shared/lib/types";
import { ReceiptPreviewModal } from "./ReceiptPreviewModal";

export function ShareActions({ bill }: { bill: Bill }) {
  const pushToast = useUIStore((s) => s.pushToast);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const accentInk = useInkColor("accent-ink");
  const ink = useInkColor();
  const result = computeBillResult(bill);
  const shareUrl = shareUrlFor(bill);
  const urlTooLong = Boolean(shareUrl && shareUrl.length > SHARE_URL_WARN_LENGTH);

  async function handleCopy() {
    if (!shareUrl) return;
    const ok = await copyLink(shareUrl);
    if (ok) {
      setCopied(true);
      pushToast("Link copied ✓");
      setTimeout(() => setCopied(false), 2500);
    } else {
      pushToast("Couldn't copy the link.");
    }
  }

  async function handleShareLink() {
    if (!shareUrl) return;
    try {
      await shareLink(shareUrl, bill.title);
    } catch {
      pushToast("Couldn't open the share sheet.");
    }
  }

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap gap-2">
        <Button onPress={() => setPreviewOpen(true)}>
          <DownloadIcon size={18} color={accentInk} />
          <ButtonLabel>Share image</ButtonLabel>
        </Button>
        <Button variant="secondary" onPress={handleCopy} disabled={!shareUrl}>
          {copied ? <CheckIcon size={18} color={ink} /> : <LinkIcon size={18} color={ink} />}
          <ButtonLabel variant="secondary">Copy link</ButtonLabel>
        </Button>
        <Button variant="secondary" onPress={handleShareLink} disabled={!shareUrl}>
          <ShareIcon size={18} color={ink} />
          <ButtonLabel variant="secondary">Share link</ButtonLabel>
        </Button>
      </View>

      {!shareUrl && (
        <Text className="font-sans text-xs text-ink-soft">
          Links are disabled — set EXPO_PUBLIC_APP_URL to your website address to enable them.
        </Text>
      )}
      {urlTooLong && shareUrl && (
        <Text className="font-sans text-xs text-accent">
          This bill makes a long link (~{Math.round(shareUrl.length / 1000)}k characters) — sharing the image works more reliably for
          big bills.
        </Text>
      )}

      <ReceiptPreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} bill={bill} result={result} />
    </View>
  );
}
