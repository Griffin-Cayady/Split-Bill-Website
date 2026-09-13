import "../src/polyfills";
import "../global.css";
import { useEffect, useState } from "react";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { PlusJakartaSans_600SemiBold, PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans";
import { IBMPlexMono_500Medium, IBMPlexMono_700Bold } from "@expo-google-fonts/ibm-plex-mono";
import {
  LibreFranklin_400Regular,
  LibreFranklin_500Medium,
  LibreFranklin_600SemiBold,
  LibreFranklin_700Bold,
} from "@expo-google-fonts/libre-franklin";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useBillStore } from "@/store/billStore";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_800ExtraBold,
    IBMPlexMono_500Medium,
    IBMPlexMono_700Bold,
    LibreFranklin_400Regular,
    LibreFranklin_500Medium,
    LibreFranklin_600SemiBold,
    LibreFranklin_700Bold,
  });
  const [hydrated, setHydrated] = useState(useBillStore.persist.hasHydrated());

  // Keep the splash up until the persisted bill is loaded so the resume
  // prompt (app/index.tsx) sees real data and nothing flashes empty.
  useEffect(() => {
    if (useBillStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useBillStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  const ready = (fontsLoaded || Boolean(fontError)) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <ErrorBoundary>
        <Slot />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
