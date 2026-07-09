import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { logClientError } from "@/lib/log-client-error";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void logClientError({
      message: error.message || "Unknown React error",
      stack: [error.stack, info.componentStack].filter(Boolean).join("\n"),
    });
  }

  private handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-serif">Ocorreu um erro</h1>
          <p className="text-sm text-muted-foreground">
            Algo deu errado ao carregar esta tela. Já registramos o problema —
            por favor, recarregue e tente novamente.
          </p>
          <Button onClick={this.handleReload} className="rounded-full">
            Recarregar
          </Button>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
