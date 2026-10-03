import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui/Button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("SplitEasy crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Something tore the receipt.</h1>
        <p className="max-w-sm text-sm text-ink-soft">
          SplitEasy hit an unexpected error. Your bill is saved, so reloading should fix it.
        </p>
        <Button onClick={() => window.location.reload()}>Reload SplitEasy</Button>
      </div>
    );
  }
}
