import React from 'react';

const Skeleton = ({ className = '', variant = 'rect' }) => {
    const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]';

    const variantClasses = {
        rect: 'rounded',
        circle: 'rounded-full',
        text: 'rounded h-4',
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
    );
};

export const MessageSkeleton = () => (
    <div className="flex gap-4 mb-6">
        <Skeleton variant="circle" className="w-8 h-8 flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    </div>
);

export const CardSkeleton = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
    </div>
);

export default Skeleton;
