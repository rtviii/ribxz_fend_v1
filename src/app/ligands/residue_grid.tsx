import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { IonNames } from '@/components/mstar/providers/polymer_preset';
import { Color } from 'molstar/lib/mol-util/color';
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
    if (luminance > 0.7) return '#374151';
    if (luminance > 0.5) return '#6B7280';
    if (luminance > 0.3) return '#D1D5DB';
    return '#F3F4F6';
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
        className="flex flex-row items-center justify-between w-[4.5rem] min-w-[4.5rem] px-1.5 py-0.5 bg-gray-50 hover:bg-gray-100 rounded text-xs border border-gray-200"
        onMouseEnter={() => onHover?.(residue)}
        onClick={() => onClick?.(residue)}>
        <span className="font-mono font-medium w-6 truncate">{residue.label_comp_id}</span>
        <span className="text-gray-500 w-6 text-right truncate">{residue.auth_seq_id}</span>
    </button>
);


interface ResidueGridProps {
    residues: ResidueSummary[];
    nomenclature_map?: Record<string, string>;
    onResidueHover?: (residue: ResidueSummary) => void;
    onResidueClick?: (residue: ResidueSummary) => void;
    groupByChain: boolean;
}

const ResidueGrid: React.FC<ResidueGridProps> = ({
    residues,
    nomenclature_map = {},
    onResidueHover,
    onResidueClick,
    groupByChain
}) => {
    if (!residues || residues.length === 0) {
        return null;
    }

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
        <div className="flex flex-wrap gap-0.5 p-1 min-w-0 overflow-x-auto">
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

    return groupByChain ? (
        <Accordion type="multiple" className="space-y-1 min-w-0">
            {Array.from(groupedResidues.entries()).map(([chainId, chainResidues]) => {
                const polymerClass = nomenclature_map[chainId];
                const style = polymerClass ? getPolymerStyle(polymerClass) : {};

                return (
                    <AccordionItem
                        value={chainId}
                        key={chainId}
                        className="relative border rounded-lg overflow-hidden bg-white shadow-sm group/item hover:shadow-md transition-all duration-200">
                        <AccordionTrigger className="hover:no-underline py-1.5 px-2 group-hover/item:bg-gray-100/80">
                            <div className="flex items-center justify-between w-full px-1 min-w-0">
                                <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                                    <code className="text-xs text-gray-600 truncate">auth_asym_id: {chainId}</code>
                                    {polymerClass && (
                                        <span
                                            className="px-2 py-0.5 rounded text-xs font-medium truncate shrink-0"
                                            style={style}>
                                            {polymerClass}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 shrink-0 ml-2">
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
    );
};

export default ResidueGrid;
