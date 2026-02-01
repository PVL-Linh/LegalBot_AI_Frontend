import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const spinner = (
        <div className="flex items-center justify-center">
            <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="text-center space-y-4">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
                    <p className="text-slate-600 font-medium">Đang tải...</p>
                </div>
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;
