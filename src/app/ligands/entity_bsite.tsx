import React, { useState } from 'react';
import { Eye, EyeOff, Focus, Inbox, Download, Square, CheckSquare } from 'lucide-react';
import { EntityCard, IconButton } from './entity';
import ResidueGrid from './residue_grid';

interface BindingSiteEntityProps {
    chemicalId: string;
    residueCount: number;
    visible: boolean;
    onToggleVisibility: () => void;
    onFocus: () => void;
    onDownload: () => void;
    // Residue Grid props
    residues: any[];
    nomenclature_map: Record<string, string>;
    onResidueClick: (residue: any) => void;
    onResidueHover: (residue: any) => void;
}

export const BindingSiteEntity: React.FC<BindingSiteEntityProps> = ({
    chemicalId,
    residueCount,
    visible,
    onToggleVisibility,
    onFocus,
    onDownload,
    residues,
    nomenclature_map,
    onResidueClick,
    onResidueHover,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [groupByChain, setGroupByChain] = useState(true);

    return (
        <EntityCard
            icon={<Inbox size={16} />}
            title={
                <div className="flex items-center gap-2">
                    <span>{chemicalId} Binding Site</span>
                    <span className="text-sm text-gray-500">
                        ({residueCount} interacting residues)
                    </span>
                </div>
            }
            controls={
                <div className="flex items-center gap-2">
                    <div 
                        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer"
                        onClick={() => setGroupByChain(!groupByChain)}
                    >
                        {groupByChain ? <CheckSquare size={14} /> : <Square size={14} />}
                        <span className="text-xs text-gray-600">Group by chain</span>
                    </div>
                    <IconButton
                        icon={<Focus size={16} />}
                        onClick={onFocus}
                        title="Focus binding site"
                    />
                    <IconButton
                        icon={visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        onClick={onToggleVisibility}
                        title={`${visible ? 'Hide' : 'Show'} binding site`}
                        active={visible}
                    />
                    <IconButton
                        icon={<Download size={16} />}
                        onClick={onDownload}
                        title="Download binding site data"
                    />
                </div>
            }
            defaultExpanded={isExpanded}
            onExpandToggle={setIsExpanded}
        >
            {residues.length > 0 && (
                <ResidueGrid
                    residues={residues}
                    nomenclature_map={nomenclature_map}
                    onResidueClick={onResidueClick}
                    onResidueHover={onResidueHover}
                    groupByChain={groupByChain}
                />
            )}
        </EntityCard>
    );
};