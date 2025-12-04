'use client';

import { Component, ReactNode } from 'react';
import { Container } from '@/components/container';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, etc.)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center py-20">
          <Container>
            <div className="max-w-lg mx-auto text-center">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#D4B58E]">
                <div className="text-6xl mb-4">⚠️</div>
                <h1 className="font-serif text-3xl text-[#111111] mb-4">
                  Something Went Wrong
                </h1>
                <p className="text-gray-600 mb-6">
                  We encountered an unexpected error. Our team has been notified.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-[#111111] text-[#FAF7F2] px-6 py-3 rounded-lg hover:bg-[#D4B58E] hover:text-[#111111] transition-colors font-medium"
                  >
                    Reload Page
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="w-full border border-[#D4B58E] text-[#111111] px-6 py-3 rounded-lg hover:bg-[#D4B58E] transition-colors font-medium"
                  >
                    Go Home
                  </button>
                </div>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mt-6 p-4 bg-red-50 rounded-lg text-left">
                    <p className="text-sm font-mono text-red-800 break-all">
                      {this.state.error.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </div>
      );
    }

    return this.props.children;
  }
}
