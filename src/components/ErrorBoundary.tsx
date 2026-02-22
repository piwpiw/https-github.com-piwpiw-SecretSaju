'use client';

import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // TODO: Send to error tracking service (Sentry, etc.)
        if (process.env.NODE_ENV === 'production') {
            // trackError(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4">
                    <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
                        <div className="text-6xl mb-4">🐾</div>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            앗, 문제가 발생했어요!
                        </h2>
                        <p className="text-purple-200 mb-6">
                            예상치 못한 오류가 발생했습니다.
                            <br />
                            잠시 후 다시 시도해주세요.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left bg-black/20 rounded-lg p-4 mb-4">
                                <summary className="cursor-pointer text-sm text-purple-300 mb-2">
                                    개발자 정보 보기
                                </summary>
                                <pre className="text-xs text-red-300 overflow-auto">
                                    {this.state.error.toString()}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.href = '/';
                            }}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                            홈으로 돌아가기
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
