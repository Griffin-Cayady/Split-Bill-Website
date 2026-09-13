import { Modal, Pressable, Text, View } from "react-native";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <Modal transparent animationType="fade" visible onRequestClose={onCancel} statusBarTranslucent>
      {/* Backdrop tap cancels; the inner Pressable swallows taps on the card itself. */}
      <Pressable onPress={onCancel} className="flex-1 items-center justify-center bg-black/40 p-4">
        <Pressable onPress={() => {}} className="w-full max-w-sm rounded-2xl border-[1.5px] border-border bg-paper-raised p-5">
          <Text accessibilityRole="header" className="font-display-bold text-lg text-ink">
            {title}
          </Text>
          {description && <Text className="mt-2 font-sans text-sm text-ink-soft">{description}</Text>}
          <View className="mt-5 flex-row justify-end gap-2">
            <Button variant="ghost" onPress={onCancel}>
              {cancelLabel}
            </Button>
            <Button variant={danger ? "danger" : "primary"} onPress={onConfirm}>
              {confirmLabel}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
