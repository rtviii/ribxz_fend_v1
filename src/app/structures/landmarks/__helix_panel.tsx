import {useState} from 'react';
import {ChevronDown, ChevronRight} from 'lucide-react';
import {HelixData, transformHelicesToLandmarks, HelixLandmark} from './types';
import {cn} from '@/components/utils';

// Group helices by chain
const groupHelicesByChain = (helices: HelixLandmark[]) => {
    return helices.reduce((groups, helix) => {
        const chain = helix.chain_id;
        if (!groups[chain]) {
            groups[chain] = {
                polymer_class: helix.polymer_class,
                helices: []
            };
        }
        groups[chain].helices.push(helix);
        return groups;
    }, {} as Record<string, { polymer_class: string, helices: HelixLandmark[] }>);
};

const ChainGroup: React.FC<{
    chainId: string,
    polymerClass: string,
    helices: HelixLandmark[],
    visibleHelices: Set<string>,
    highlightedHelix: string | null,
    onToggleVisibility: (id: string) => void,
    onHighlight: (id: string) => void,
    onFocus: (id: string) => void
}> = ({
    chainId,
    polymerClass,
    helices,
    visibleHelices,
    highlightedHelix,
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
                className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-50"
            >
                <div className="flex items-center space-x-2">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span className={cn(
                        "text-xs font-medium rounded px-1.5 py-0.5",
                        getPolymerClassStyle(polymerClass)
                    )}>
                        {polymerClass}
                    </span>
                    <span className="text-xs text-gray-500">
                        ({helices.length} helices)
                    </span>
                </div>
            </button>
            
            {isExpanded && (
                <div className="px-2 pb-2">
                    <HelixLandmarksList
                        helices={helices}
                        visibleHelices={visibleHelices}
                        highlightedHelix={highlightedHelix}
                        onToggleVisibility={onToggleVisibility}
                        onHighlight={onHighlight}
                        onFocus={onFocus}
                    />
                </div>
            )}
        </div>
    );
};

export const HelixLandmarks: React.FC<{helicesData: HelixData | undefined}> = ({helicesData}) => {
    const [visibleHelices, setVisibleHelices]     = useState<Set<string>>(new Set());
    const [highlightedHelix, setHighlightedHelix] = useState<string | null>(null);

    if (!helicesData) {
        return null;
    }

    const helixLandmarks = transformHelicesToLandmarks(helicesData);
    const groupedHelices = groupHelicesByChain(helixLandmarks);

    const handleToggleVisibility = (id: string) => {
        const newVisible = new Set(visibleHelices);
        if (newVisible.has(id)) {
            newVisible.delete(id);
        } else {
            newVisible.add(id);
        }
        setVisibleHelices(newVisible);
    };

    return (
        <div className="space-y-2">
            {Object.entries(groupedHelices).map(([chainId, {polymer_class, helices}]) => (
                <ChainGroup
                    key={chainId}
                    chainId={chainId}
                    polymerClass={polymer_class}
                    helices={helices}
                    visibleHelices={visibleHelices}
                    highlightedHelix={highlightedHelix}
                    onToggleVisibility={handleToggleVisibility}
                    onHighlight={setHighlightedHelix}
                    onFocus={id => {
                        // Add your focus logic here
                    }}
                />
            ))}
        </div>
    );
};
