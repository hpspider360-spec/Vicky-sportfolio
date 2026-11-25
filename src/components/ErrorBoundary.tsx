import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#121216] px-6 text-[#F4F4F6]">
          <div className="w-full max-w-lg border border-[#4A4B52] bg-[#16161B] p-7">
            <p className="font-mono text-xs font-semibold tracking-[0.16em] text-[#C8FF2E] uppercase">
              Application Notice
            </p>
            <h1 className="mt-3 font-[var(--font-display)] text-2xl font-bold text-[#F4F4F6]">
              Something went wrong while loading the page.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#B8B9C2]">
              Please refresh to restore your session. If this occurred during an admin action, ensure you are signed in with the authorized owner account.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 inline-flex items-center justify-center border border-[#C8FF2E] bg-[#C8FF2E] px-5 py-2.5 font-mono text-xs font-semibold tracking-[0.12em] text-[#121216] uppercase transition-colors hover:bg-transparent hover:text-[#C8FF2E]"
            >
              Reload Portfolio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
