import { Share } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as Clipboard from "expo-clipboard";
import { buildShareUrl } from "@shared/lib/share/link";
import type { Bill } from "@shared/lib/types";

/** Public website URL that share links point to; read per call so tests can vary it. */
export function appBaseUrl(): string | null {
  const raw = process.env.EXPO_PUBLIC_APP_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

export function shareUrlFor(bill: Bill): string | null {
  const base = appBaseUrl();
  return base ? buildShareUrl(bill, base) : null;
}

/** Snapshot a mounted view (pass a ref to a View with collapsable={false}) to a temp PNG. */
export function captureReceipt(ref: React.RefObject<unknown>): Promise<string> {
  return captureRef(ref as never, { format: "png", quality: 1, result: "tmpfile" });
}

export async function shareImage(uri: string, title: string): Promise<"done" | "unavailable"> {
  if (!(await Sharing.isAvailableAsync())) return "unavailable";
  await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: title, UTI: "public.png" });
  return "done";
}

export async function saveImage(uri: string): Promise<"done" | "denied"> {
  const { granted } = await MediaLibrary.requestPermissionsAsync(true);
  if (!granted) return "denied";
  await MediaLibrary.saveToLibraryAsync(uri);
  return "done";
}

export function copyLink(url: string): Promise<boolean> {
  return Clipboard.setStringAsync(url);
}

export async function shareLink(url: string, title: string): Promise<void> {
  await Share.share({ message: url, url, title });
}
