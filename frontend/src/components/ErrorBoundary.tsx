import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/app/dashboard';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            <div className="glass rounded-2xl p-8 text-center space-y-6">
              {/* Icon */}
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10"
              >
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </motion.div>

              {/* Title */}
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-muted-foreground">
                  Don't worry, we've logged the error and will fix it soon.
                </p>
              </div>

              {/* Error Details */}
              {this.state.error && (
                <details className="text-left">
                  <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                    Technical details
                  </summary>
                  <pre className="mt-2 p-3 rounded-lg bg-muted text-xs overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Reload
                </Button>
                <Button
                  onClick={this.handleReset}
                  className="flex-1 gap-2 bg-gradient-primary"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}