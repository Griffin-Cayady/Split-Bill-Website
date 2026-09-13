import { useRef, useState } from "react";
import { Modal, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { captureReceipt, saveImage, shareImage } from "@/lib/share";
import { useUIStore } from "@shared/store/uiStore";
import type { Bill, BillResult } from "@shared/lib/types";
import { ReceiptCard } from "./ReceiptCard";

interface Props {
  open: boolean;
  onClose: () => void;
  bill: Bill;
  result: BillResult;
}

export function ReceiptPreviewModal({ open, onClose, bill, result }: Props) {
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState<"share" | "save" | null>(null);
  const pushToast = useUIStore((s) => s.pushToast);
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.min(screenWidth - 32, 420);

  async function handleShare() {
    setBusy("share");
    try {
      const uri = await captureReceipt(cardRef);
      const outcome = await shareImage(uri, bill.title);
      if (outcome === "unavailable") pushToast("Sharing is not available on this device.");
    } catch {
      pushToast("Couldn't share the image — try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleSave() {
    setBusy("save");
    try {
      const uri = await captureReceipt(cardRef);
      const outcome = await saveImage(uri);
      if (outcome === "done") pushToast("Saved to Photos ✓");
      else if (outcome === "denied") pushToast("Photos permission was denied.");
      else {
        // No photo-library module in this runtime — the share sheet offers "Save Image".
        pushToast("Use Share image, then choose Save Image.");
        await shareImage(uri, bill.title);
      }
    } catch {
      pushToast("Couldn't save the image — try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }} className="flex-1 bg-paper">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="font-display-bold text-lg text-ink">Receipt preview</Text>
          <Button variant="ghost" size="sm" onPress={onClose}>
            Close
          </Button>
        </View>
        <ScrollView contentContainerStyle={{ alignItems: "center", paddingVertical: 12, paddingBottom: 24 }}>
          <ReceiptCard ref={cardRef} bill={bill} result={result} width={width} />
        </ScrollView>
        <View className="flex-row gap-2 border-t-[1.5px] border-border px-4 pt-3">
          <Button onPress={handleShare} disabled={busy !== null} className="flex-1">
            {busy === "share" ? "Preparing…" : "Share image"}
          </Button>
          <Button variant="secondary" onPress={handleSave} disabled={busy !== null} className="flex-1">
            {busy === "save" ? "Saving…" : "Save to Photos"}
          </Button>
        </View>
      </View>
    </Modal>
  );
}
