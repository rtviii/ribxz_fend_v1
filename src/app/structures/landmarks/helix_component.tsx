import React from 'react';
import { Eye, EyeOff, Focus } from 'lucide-react';
import { cn } from '@/components/utils';
import type { HelixLandmark } from './types';

interface HelixLandmarkRowProps {
    landmark: HelixLandmark;
    isVisible?: boolean;
    isHighlighted?: boolean;
    onToggleVisibility: (id: string) => void;
    onHighlight: (id: string) => void;
    onFocus: (id: string) => void;
}

const HelixLandmarkRow: React.FC<HelixLandmarkRowProps> = ({
    landmark,
    isVisible = true,
    isHighlighted = false,
    onToggleVisibility,
    onHighlight,
    onFocus
}) => {
    const getPolymerClassStyle = (polymerClass: string) => {
        switch (polymerClass) {
            case '23SrRNA':
                return 'bg-blue-100 text-blue-800';
            case '16SrRNA':
                return 'bg-green-100 text-green-800';
            case '5SrRNA':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div 
            className="border-b border-gray-200 last:border-b-0"
            onMouseEnter={() => onHighlight(landmark.id)}
            onMouseLeave={() => onHighlight('')}
        >
            <div className={cn(
                'flex items-center justify-between rounded-md px-2 transition-colors hover:cursor-pointer py-1',
                'hover:border-l-4 hover:border-l-slate-400 hover:bg-slate-200',
                isHighlighted ? 'bg-blue-50/30 border-l-4 border-l-slate-400 bg-slate-200' : ''
            )}>
                <div className="flex items-center space-x-2">
                    <span className={cn(
                        'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium',
                        getPolymerClassStyle(landmark.polymer_class)
                    )}>
                        {landmark.chain_id}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                        {landmark.name}
                    </span>
                    <span className="text-xs text-gray-500">
                        {landmark.start_residue}-{landmark.end_residue}
                    </span>
                </div>

                <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                    <button 
                        className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                        onClick={() => onFocus(landmark.id)}
                        title="Focus view"
                    >
                        <Focus size={14} />
                    </button>

                    <button 
                        className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                        onClick={() => onToggleVisibility(landmark.id)}
                        title={isVisible ? "Hide" : "Show"}
                    >
                        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Container component to handle the list of helices
const HelixLandmarksList: React.FC<{
    helices: HelixLandmark[];
    visibleHelices: Set<string>;
    highlightedHelix: string | null;
    onToggleVisibility: (id: string) => void;
    onHighlight: (id: string) => void;
    onFocus: (id: string) => void;
}> = ({
    helices,
    visibleHelices,
    highlightedHelix,
    onToggleVisibility,
    onHighlight,
    onFocus
}) => {
    return (
        <div className="space-y-1">
            {helices.map(helix => (
                <HelixLandmarkRow
                    key={helix.id}
                    landmark={helix}
                    isVisible={visibleHelices.has(helix.id)}
                    isHighlighted={highlightedHelix === helix.id}
                    onToggleVisibility={onToggleVisibility}
                    onHighlight={onHighlight}
                    onFocus={onFocus}
                />
            ))}
        </div>
    );
};

export default HelixLandmarksList;