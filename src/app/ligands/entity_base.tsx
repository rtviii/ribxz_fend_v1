import React, {useState} from 'react';
import {ChevronDown, ChevronRight} from 'lucide-react';
import {ScrollArea} from '@/components/ui/scroll-area';
import {cn} from '@/components/utils';

interface IconButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
    active?: boolean;
    title: string;
}

export const IconButton: React.FC<IconButtonProps> = ({icon, onClick, active, title}) => (
    <button
        onClick={onClick}
        title={title}
        className={cn(
            'p-1 rounded-full transition-colors flex-shrink-0',
            active ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400 hover:text-gray-500'
        )}>
        {icon}
    </button>
);

export interface EntityCardProps {
    title: React.ReactNode;
    icon?: React.ReactNode;
    controls?: React.ReactNode;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    className?: string;
    contentClassName?: string;
    maxContentHeight?: string; // e.g., "24rem" for scrollable content
}

export const EntityCard: React.FC<EntityCardProps> = ({
    title,
    icon,
    controls,
    children,
    defaultExpanded = true,
    className,
    contentClassName,
    maxContentHeight
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const content = maxContentHeight ? (
        <ScrollArea className="w-full" style={{maxHeight: maxContentHeight}}>
            <div className={cn('p-4', contentClassName)}>{children}</div>
        </ScrollArea>
    ) : (
        <div className={cn('p-4', contentClassName)}>{children}</div>
    );

    return (
        <div
            className={cn(
                'rounded-lg bg-white shadow-sm border border-gray-100 overflow-hidden w-full min-w-0',
                className
            )}>
            <div
                className={cn(
                    'border-b border-gray-100 bg-gray-50/80 px-4 py-2',
                    'hover:bg-gray-100/80 transition-colors cursor-pointer',
                    !isExpanded && 'border-b-0'
                )}
                onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center justify-between min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-shrink">
                        {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
                        <div className="min-w-0 flex-1">
                            {typeof title === 'string' ? (
                                <h3 className="text-sm font-medium text-gray-900 truncate">{title}</h3>
                            ) : (
                                title
                            )}
                        </div>
                        <span className="text-gray-400 flex-shrink-0">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                    </div>
                    {controls && (
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                            {controls}
                        </div>
                    )}
                </div>
            </div>
            {isExpanded && content}
        </div>
    );
};

// Helper components for common entity content layouts
export const EntityContent: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({children, className}) => (
    <div className={cn('flex flex-wrap gap-x-6 gap-y-2 text-sm', className)}>{children}</div>
);

export const EntityField: React.FC<{
    label: string;
    value: React.ReactNode;
    className?: string;
}> = ({label, value, className}) => (
    <div className={cn('flex items-center gap-2 min-w-0', className)}>
        <span className="text-gray-500 flex-shrink-0">{label}:</span>
        <span className="text-gray-900 truncate">{value}</span>
    </div>
);

export const EntityDescription: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({children, className}) => <p className={cn('text-sm text-gray-600 break-words', className)}>{children}</p>;
