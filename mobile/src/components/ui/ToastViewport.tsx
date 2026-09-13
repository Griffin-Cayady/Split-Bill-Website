import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUIStore } from "@shared/store/uiStore";

/** Toasts float above the sticky bottom bar (bottomOffset) and auto-dismiss after 4s. */
export function ToastViewport({ bottomOffset = 0 }: { bottomOffset?: number }) {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={{ bottom: insets.bottom + bottomOffset + 16 }}
      className="absolute inset-x-0 items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} id={t.id} message={t.message} onDismiss={dismissToast} />
      ))}
    </View>
  );
}

function ToastItem({ id, message, onDismiss }: { id: string; message: string; onDismiss: (id: string) => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => onDismiss(id));
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onDismiss, opacity]);
  return (
    <Animated.View style={{ opacity, backgroundColor: "#33291c" }} className="rounded-full px-5 py-3 shadow-lg">
      <Text style={{ color: "#fff8ec" }} className="font-sans-semibold text-sm">
        {message}
      </Text>
    </Animated.View>
  );
}
