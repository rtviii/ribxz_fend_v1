import React, {useState} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {Download, Square, CheckSquare} from 'lucide-react';
import {IonNames} from '@/components/mstar/providers/polymer_preset';
import {Color} from 'molstar/lib/mol-util/color';
import PolymerColorschemeWarm from '@/components/mstar/providers/colorschemes/colorscheme_warm';

const getLuminance = (hexColor: string): number => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getContrastColor = (hexColor: string): string => {
    const luminance = getLuminance(hexColor);
    if (luminance > 0.7) return '#374151'; // gray-700
    if (luminance > 0.5) return '#6B7280'; // gray-500
    if (luminance > 0.3) return '#D1D5DB'; // gray-300
    return '#F3F4F6'; // gray-100
};

interface ResidueSummary {
    label_seq_id: number | null | undefined;
    label_comp_id: string | null | undefined;
    auth_seq_id: number;
    auth_asym_id: string;
    rcsb_id: string;
}

interface ResidueCardProps {
    residue: ResidueSummary;
    onHover?: (residue: ResidueSummary) => void;
    onClick?: (residue: ResidueSummary) => void;
}

const ResidueCard: React.FC<ResidueCardProps> = ({residue, onHover, onClick}) => (
    <button
        className="flex flex-row items-center justify-between w-20 px-1.5 py-0.5 bg-gray-50 hover:bg-gray-100 rounded text-xs border border-gray-200"
        onMouseEnter={() => onHover?.(residue)}
        onClick={() => onClick?.(residue)}>
        <span className="font-mono font-medium min-w-6">{residue.label_comp_id}</span>
        <span className="text-gray-500 min-w-6 text-right">{residue.auth_seq_id}</span>
    </button>
);

interface ResidueGridProps {
    residues: ResidueSummary[];
    ligandId: string;
    nomenclature_map?: Record<string, string>;
    onResidueHover?: (residue: ResidueSummary) => void;
    onResidueClick?: (residue: ResidueSummary) => void;
    onDownload?: () => void;
}

const ResidueGrid: React.FC<ResidueGridProps> = ({
    residues,
    ligandId,
    nomenclature_map = {},
    onResidueHover,
    onResidueClick,
    onDownload
}) => {
    const [groupByChain, setGroupByChain] = useState(true);

    if (!residues || residues.length === 0) {
        return null;
    }

    // Group residues by auth_asym_id
    const groupedResidues = residues
        .filter(residue => !IonNames.has(residue.label_comp_id!))
        .reduce((acc, residue) => {
            const group = acc.get(residue.auth_asym_id) || [];
            group.push(residue);
            acc.set(
                residue.auth_asym_id,
                group.sort((a, b) => a.auth_seq_id - b.auth_seq_id)
            );
            return acc;
        }, new Map<string, ResidueSummary[]>());

    const getPolymerStyle = (polymerClass: string) => {
        const color = PolymerColorschemeWarm[polymerClass];
        if (!color) return {};

        const hexColor = Color.toHexStyle(color);
        const textColor = getContrastColor(hexColor);

        return {
            backgroundColor: hexColor,
            color: textColor
        };
    };

    const renderResidueGrid = (residuesToRender: ResidueSummary[]) => (
        <div className="flex flex-wrap gap-0.5 p-1">
            {residuesToRender.map((residue, index) => (
                <ResidueCard
                    key={`${residue.auth_asym_id}-${residue.auth_seq_id}-${index}`}
                    residue={residue}
                    onHover={onResidueHover}
                    onClick={onResidueClick}
                />
            ))}
        </div>
    );

    return (
        <Card className="w-full">
            <div className="border-b bg-gray-100/50">
                <div className="px-3 py-1.5 text-sm">{ligandId} Binding Site</div>
            </div>
            <CardContent className="p-2 space-y-1">
                {groupByChain ? (
                    <Accordion type="multiple" className="space-y-1">
                        {Array.from(groupedResidues.entries()).map(([chainId, chainResidues]) => {
                            const polymerClass = nomenclature_map[chainId];
                            const style = polymerClass ? getPolymerStyle(polymerClass) : {};

                            return (
                                <AccordionItem
                                    value={chainId}
                                    key={chainId}
                                    className="relative border rounded-lg overflow-hidden bg-white shadow-sm group/item hover:shadow-md transition-all duration-200 mb-2">
                                    <AccordionTrigger className="hover:no-underline py-1.5 px-2 group-hover/item:bg-gray-100/80">
                                        <div className="flex items-center justify-between w-full px-1">
                                            <div className="flex items-center gap-3">
                                                <code className="text-xs text-gray-600">auth_asym_id: {chainId}</code>
                                                {polymerClass && (
                                                    <span
                                                        className="px-2 py-0.5 rounded text-xs font-medium"
                                                        style={style}>
                                                        {polymerClass}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {chainResidues.length} residues
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-0 group-hover/item:bg-gray-50/80 transition-colors">
                                        {renderResidueGrid(chainResidues)}
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                ) : (
                    renderResidueGrid(
                        residues.sort((a, b) => {
                            if (a.auth_asym_id !== b.auth_asym_id) {
                                return a.auth_asym_id.localeCompare(b.auth_asym_id);
                            }
                            return a.auth_seq_id - b.auth_seq_id;
                        })
                    )
                )}
            </CardContent>

            <div className="border-t bg-gray-50/50 px-2 py-1">
                <div className="flex items-center gap-4 justify-end">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setGroupByChain(!groupByChain)}>
                        <span className="text-xs text-gray-600 select-none">Group by chain</span>
                        {groupByChain ? (
                            <CheckSquare className="h-3.5 w-3.5 text-gray-600" />
                        ) : (
                            <Square className="h-3.5 w-3.5 text-gray-600" />
                        )}
                    </div>
                    <button onClick={onDownload} className="text-gray-600 hover:text-gray-900 transition-colors">
                        <Download className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default ResidueGrid;
