import React, {useState} from 'react';
import {ChevronDown, ChevronRight, Eye, EyeOff, Focus} from 'lucide-react';
import {cn} from '@/components/utils';
import {HelixData, HelixLandmark, HelixLandmarksProps, transformHelicesToLandmarks} from './types';

interface HelixRowProps {
    helix: HelixLandmark;
    onToggleVisibility: (id: HelixLandmark) => void;
    onHighlight: (id: HelixLandmark) => void;
    onFocus: (id: HelixLandmark) => void;
}

const HelixRow: React.FC<HelixRowProps> = ({
    helix,
    onToggleVisibility,
    onHighlight,
    onFocus
}) => {
    const isHighlighted = false;
    const isVisible = true;
    return (
        <div
            className="border-b border-gray-200 last:border-b-0"
            // onMouseEnter={() => onHighlight(helix)}
            // onMouseLeave={() => onHighlight()}
        >
            <div
                className={cn(
                    'flex items-center justify-between rounded-md px-2 transition-colors hover:cursor-pointer py-1',
                    'hover:border-l-4 hover:border-l-slate-400 hover:bg-slate-200',
                    isHighlighted ? 'bg-blue-50/30 border-l-4 border-l-slate-400 bg-slate-200' : ''
                )}>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">{helix.name}</span>
                    <span className="text-xs text-gray-500">
                        {helix.start_residue}-{helix.end_residue}
                    </span>
                </div>

                <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                    <button
                        className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                        onClick={() => onFocus(helix)}
                        title="Focus view">
                        <Focus size={14} />
                    </button>

                    <button
                        className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                        onClick={() => onToggleVisibility(helix)}
                        title={isVisible ? 'Hide' : 'Show'}>
                        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ChainGroupProps {
    chainId: string;
    polymerClass: string;
    helices: HelixLandmark[];
    visibleHelices: Set<string>;
    highlightedHelix: string | null;
    onToggleVisibility: (h: HelixLandmark) => void;
    onHighlight: (h: HelixLandmark) => void;
    onFocus: (h: HelixLandmark) => void;
}

const ChainGroup: React.FC<ChainGroupProps> = ({
    chainId,
    polymerClass,
    helices,
    onToggleVisibility,
    onHighlight,
    onFocus
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

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
        <div className="border rounded-md mb-2">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-50">
                <div className="flex items-center space-x-2">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span
                        className={cn('text-xs font-medium rounded px-1.5 py-0.5', getPolymerClassStyle(polymerClass))}>
                        {polymerClass}
                    </span>
                    <span className="text-xs text-gray-500">({helices.length} helices)</span>
                </div>
            </button>

            {isExpanded && (
                <div className="px-2 pb-2">
                    {helices.map(helix => (
                        <HelixRow
                            key={helix.id}
                            helix={helix}
                            onToggleVisibility={onToggleVisibility}
                            onHighlight={onHighlight}
                            onFocus={onFocus}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export const HelixLandmarks: React.FC<HelixLandmarksProps> = ({
    helicesData,
    onToggleVisibility,
    onHighlight,
    onFocus
}) => {
    if (!helicesData) return null;

    const helixLandmarks = transformHelicesToLandmarks(helicesData);
    const groupedHelices = helixLandmarks.reduce((groups, helix) => {
        const chain = helix.chain_id;
        if (!groups[chain]) {
            groups[chain] = {
                polymer_class: helix.polymer_class,
                helices: []
            };
        }
        groups[chain].helices.push(helix);
        return groups;
    }, {} as Record<string, {polymer_class: string; helices: HelixLandmark[]}>);

    return (
        <div className="space-y-2">
            {Object.entries(groupedHelices).map(([chainId, {polymer_class, helices}]) => (
                <ChainGroup
                    key={chainId}
                    chainId={chainId}
                    polymerClass={polymer_class}
                    helices={helices}
                    onToggleVisibility={onToggleVisibility}
                    onHighlight={onHighlight}
                    onFocus={onFocus}
                />
            ))}
        </div>
    );
};
