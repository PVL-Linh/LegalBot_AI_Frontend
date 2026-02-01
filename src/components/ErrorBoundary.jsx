import React from 'react';
import { AlertTriangle } from 'lucide-react';

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
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-red-100 dark:border-red-900/30 text-center space-y-6">
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle size={40} className="text-red-600 dark:text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Oops! Có lỗi xảy ra</h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-2">
                                Đã có lỗi không mong muốn. Vui lòng tải lại trang hoặc liên hệ hỗ trợ nếu vấn đề tiếp diễn.
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            Tải lại trang
                        </button>
                        {import.meta.env?.DEV && (
                            <details className="text-left mt-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <summary className="cursor-pointer text-sm font-bold text-slate-500 dark:text-slate-400">Chi tiết lỗi (Gỡ lỗi)</summary>
                                <pre className="text-xs text-red-600 dark:text-red-400 mt-3 overflow-auto whitespace-pre-wrap font-mono">
                                    {this.state.error?.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
