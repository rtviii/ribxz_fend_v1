import React, { useState } from 'react';
import { Eye, EyeOff, Focus, Inbox, Download, Square, CheckSquare } from 'lucide-react';
import { EntityCard, IconButton } from './entity_base';
import ResidueGrid from './residue_grid';
import { cn } from '@/components/utils';
import { Ellipsis } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ribxzMstarv2 } from '@/components/mstar/mstar_v2';

interface BindingSiteEntityProps {
    chemicalId: string;
    residueCount: number;
    visible: boolean;
    onToggleVisibility: () => void;
    onFocus: () => void;
    onDownload: () => void;
    residues: any[];

    nomenclature_map: Record<string, string>;
    onResidueClick: (residue: any) => void;
    onResidueHover: (residue: any) => void;

    rcsb_id:string;
    ctx_secondary: ribxzMstarv2;
    bsiteVisibility:boolean
}

const BsiteDownloadMenu = ({
    rcsb_id,
    chemicalId,
    residues,
    molstarViewer,
    bsiteRef,
    className,
    radius = 5 // Default radius value
}) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadOptions = [
        {
            extension: 'json',
            label: 'Download',
            onClick: async () => {
                if (isDownloading) return;
                setIsDownloading(true);
                try {
                    // Construct the data object to match your binding site format
                    const bindingSiteData = {
                        purported_binding_site: {
                            chains: residues.reduce((acc, residue) => {
                                const chainIndex = acc.findIndex(c => c.chain_id === residue.auth_asym_id);
                                if (chainIndex === -1) {
                                    acc.push({
                                        chain_id: residue.auth_asym_id,
                                        bound_residues: [residue]
                                    });
                                } else {
                                    acc[chainIndex].bound_residues.push(residue);
                                }
                                return acc;
                            }, [])
                        },
                        metadata: {
                            rcsb_id,
                            chemical_id: chemicalId,
                            radius
                        }
                    };

                    const blob = new Blob([JSON.stringify(bindingSiteData, null, 2)], { type: 'application/json' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${rcsb_id}_${chemicalId}_predicted_bsite.json`;
                    console.log("got rcsb id: ", rcsb_id);
                    
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } catch (error) {
                    console.error('Download failed:', error);
                } finally {
                    setIsDownloading(false);
                }
            }
        },
        {
            extension: 'cif',
            label: 'Download',
            onClick: async () => {
                if (molstarViewer && bsiteRef) {
                    const loci = molstarViewer.loci_from_ref(bsiteRef);
                    console.log("got Loci:", loci);
                    
                    if (!loci) return;

                    // Select the binding site
                    molstarViewer.ctx.managers.structure.selection.clear();
                    molstarViewer.ctx.managers.structure.selection.fromLoci('add', loci);

                    // Download the selection
                    await molstarViewer.downloads.downloadSelection(
                        `${rcsb_id}_${chemicalId}_predicted_bsite.cif`
                    );

                    // Clear the selection
                    molstarViewer.ctx.managers.structure.selection.clear();
                }
            }
        }
    ];


    return (
        <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
                <button
                    className={cn('rounded-full p-1 text-gray-500', className)}
                    onClick={(e) => e.stopPropagation()}>
                    <Ellipsis size={14} />
                </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end" className="p-0 min-w-[140px] bg-gray-50/95 border border-gray-200">
                <div className="flex flex-col py-1">
                    {downloadOptions.map((option) => (
                        <button
                            key={option.extension}
                            disabled={isDownloading}
                            onClick={(e) => {
                                e.stopPropagation();
                                option.onClick();
                            }}
                            className={cn(
                                "px-3 py-1.5 text-sm text-gray-600 text-left hover:bg-slate-100 transition-colors whitespace-nowrap flex items-center justify-between group",
                                isDownloading && "opacity-50 cursor-not-allowed"
                            )}>
                            <span className="group-hover:text-gray-900">{option.label}</span>
                            <code className="ml-2 text-xs font-mono bg-slate-200/80 px-1.5 py-0.5 rounded text-gray-500 group-hover:text-blue-600 group-hover:bg-blue-50">
                                .{option.extension}
                            </code>
                        </button>
                    ))}
                </div>
            </TooltipContent>
        </Tooltip>
    );
};

export default BsiteDownloadMenu;




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
    rcsb_id,
    ctx_secondary,
    bsiteVisibility,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [groupByChain, setGroupByChain] = useState(true);

    return (
        <TooltipProvider>
            <EntityCard
                icon={<Inbox size={16} />}
                title={
                    <div className="flex items-center gap-2">
                        <span className="truncate">{chemicalId} Binding Site</span>
                        <span className="text-sm text-gray-500 shrink-0">({residueCount} interacting residues)</span>
                    </div>
                }
                controls={
                    <div className="flex items-center gap-1 shrink-0">
                        <div
                            className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-gray-100 cursor-pointer text-nowrap"
                            onClick={() => setGroupByChain(!groupByChain)}>
                            {groupByChain ? <CheckSquare size={14} /> : <Square size={14} />}
                            <span className="text-xs text-gray-600">Group by chain</span>
                        </div>
                        <IconButton icon={<Focus size={16} />} onClick={onFocus} title="Focus binding site" />
                        <IconButton
                            icon={visible ? <Eye size={16} /> : <EyeOff size={16} />}
                            onClick={onToggleVisibility}
                            title={`${visible ? 'Hide' : 'Show'} binding site`}
                            active={visible}
                        />
                        <BsiteDownloadMenu
                            rcsb_id={rcsb_id}
                            chemicalId={chemicalId}
                            residues={residues}
                            molstarViewer={ctx_secondary}
                            bsiteRef={`${chemicalId}_bsite_group`}
                            className={bsiteVisibility ? 'text-blue-500' : ''}
                        />
                    </div>
                }
                defaultExpanded={isExpanded}
                onExpandToggle={setIsExpanded}>
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
        </TooltipProvider>
    );
};
