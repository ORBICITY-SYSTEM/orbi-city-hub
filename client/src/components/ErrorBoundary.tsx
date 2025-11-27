import { cn } from "@/lib/utils";
import { AlertTriangle, Bug, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for development
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);

    // TODO: Send to error logging service if configured
    
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReport = () => {
    // Open feedback widget (will be implemented in next phase)
    const feedbackEvent = new CustomEvent("openFeedback", {
      detail: {
        type: "bug",
        error: this.state.error?.message,
        stack: this.state.error?.stack,
      },
    });
    window.dispatchEvent(feedbackEvent);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8 space-y-6">
            {/* Error Icon */}
            <div className="p-4 rounded-full bg-destructive/10">
              <AlertTriangle
                size={48}
                className="text-destructive"
              />
            </div>

            {/* Error Title */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Something went wrong</h2>
              <p className="text-muted-foreground">
                An unexpected error occurred. The error has been automatically reported to our team.
              </p>
            </div>

            {/* Error Details (collapsible) */}
            <details className="w-full">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2">
                Show error details
              </summary>
              <div className="p-4 w-full rounded-lg bg-muted overflow-auto">
                <div className="space-y-4">
                  {/* Error Message */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Error Message:</p>
                    <p className="text-sm text-foreground">
                      {this.state.error?.message || "Unknown error"}
                    </p>
                  </div>

                  {/* Stack Trace */}
                  {this.state.error?.stack && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Stack Trace:</p>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}

                  {/* Component Stack */}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Component Stack:</p>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </details>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={this.handleReload}
                className="flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reload Page
              </Button>

              <Button
                onClick={this.handleReport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Bug size={16} />
                Report Issue
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-muted-foreground text-center">
              If the problem persists, please contact support at{" "}
              <a
                href="mailto:info@orbicitybatumi.com"
                className="text-primary hover:underline"
              >
                info@orbicitybatumi.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
