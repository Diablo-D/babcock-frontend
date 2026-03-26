import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="d-flex align-items-center justify-content-center vh-100" style={{ background: 'linear-gradient(-45deg, #0f172a, #1e3a8a)' }}>
                    <div className="text-center p-5 rounded-4 shadow-lg" style={{ background: 'rgba(255,255,255,0.95)', maxWidth: '500px' }}>
                        <div className="display-4 mb-3">⚠️</div>
                        <h3 className="fw-bold text-dark mb-3">Something went wrong</h3>
                        <p className="text-muted mb-4">
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
