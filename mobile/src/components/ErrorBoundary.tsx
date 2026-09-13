import { Component, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import * as Updates from "expo-updates";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  async reload() {
    try {
      await Updates.reloadAsync();
    } catch {
      // Expo Go / dev: updates module is disabled — just reset the boundary.
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View className="flex-1 items-center justify-center bg-paper px-6">
        <View className="w-full max-w-sm rounded-2xl border-[1.5px] border-border bg-paper-raised p-5">
          <Text className="font-display-bold text-lg text-ink">Something went wrong</Text>
          <Text className="mt-2 font-sans text-sm text-ink-soft">{this.state.error.message}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => this.reload()}
            className="mt-5 h-11 items-center justify-center rounded-xl bg-accent px-4"
          >
            <Text className="font-sans-bold text-accent-ink">Reload SplitEasy</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}
