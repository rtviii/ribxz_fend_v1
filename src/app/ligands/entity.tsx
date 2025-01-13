import React, { useState } from 'react';
import Link from 'next/link';
import {Eye, EyeOff, Building2, ChevronDown, ChevronRight} from 'lucide-react';
import {cn} from '@/components/utils';

interface IconButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
    active?: boolean;
    title: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, onClick, active, title }) => (
    <button
        onClick={onClick}
        title={title}
        className={cn(
            "p-1 rounded-full transition-colors",
            active ? "text-blue-500 hover:text-blue-600" : "text-gray-400 hover:text-gray-500"
        )}
    >
        {icon}
    </button>
);

export interface EntityCardProps {
    title: React.ReactNode;
    icon?: React.ReactNode;
    controls?: React.ReactNode;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

export const EntityCard: React.FC<EntityCardProps> = ({ 
    title, 
    icon, 
    controls, 
    children,
    defaultExpanded = true
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="rounded-lg bg-white shadow-sm border border-gray-100 overflow-hidden">
            <div 
                className={cn(
                    "border-b border-gray-100 bg-gray-50/80 px-4 py-2",
                    "hover:bg-gray-100/80 transition-colors cursor-pointer",
                    !isExpanded && "border-b-0"
                )}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon && <span className="text-gray-400">{icon}</span>}
                        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                        <span className="text-gray-400">
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                    </div>
                    {controls && (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            {controls}
                        </div>
                    )}
                </div>
            </div>
            {isExpanded && (
                <div className="p-4">
                    {children}
                </div>
            )}
        </div>
    );
};

