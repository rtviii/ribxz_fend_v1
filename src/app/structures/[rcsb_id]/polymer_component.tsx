'use client';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {cn} from '@/components/utils';
import {Eye, EyeOff, Square, CheckSquare, Focus, ScanSearch, DownloadIcon, DotSquare, Ellipsis} from 'lucide-react';
import {Polymer} from '@/store/ribxz_api/ribxz_api';
import PolymerColorschemeDarkTemple from '@/components/mstar/providers/colorschemes/colorscheme_darktemple';
import {Color} from 'molstar/lib/mol-util/color';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {PolymerComponent, selectComponentById} from '@/store/molstar/slice_refs';
import {SequenceViewerTrigger} from '@/app/components/sequence_viewer';
import {selectPolymerStateByAuthId} from '@/store/slices/slice_polymer_states';
import PolymerColorschemeWarm from '@/components/mstar/providers/colorschemes/colorscheme_warm';
import {getContrastColor} from '@/my_utils';
import {useMolstarInstance} from '@/components/mstar/mstar_service';
import {GearIcon} from '@radix-ui/react-icons';
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip';
import { useRoutersRouterPolymersGetPolymerDataQuery } from '@/store/ribxz_api/ribxz_api';


const DownloadMenu = ({ polymer, molstarViewer, className }) => {
    // Skip the automatic data fetching
    const [isDownloading, setIsDownloading] = useState(false);
    
    // Get polymer component reference from Redux state
    const polymerComponent = useAppSelector(state =>
        selectComponentById(state, {
            instanceId: 'main',
            componentId: polymer.auth_asym_id
        })
    );

    const downloadOptions = [
        {
            extension: 'fasta',
            label: 'Download',
            onClick: async () => {
                if (isDownloading) return;
                setIsDownloading(true);
                try {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_DJANGO_URL}/polymers/polymer/?rcsb_id=${polymer.parent_rcsb_id}&auth_asym_id=${polymer.auth_asym_id}&format=fasta`
                    );
                    const data = await response.text();
                    const blob = new Blob([data], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${polymer.parent_rcsb_id}_${polymer.auth_asym_id}.fasta`;
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
            extension: 'json',
            label: 'Download',
            onClick: async () => {
                if (isDownloading) return;
                setIsDownloading(true);
                try {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_DJANGO_URL}/polymers/polymer/?rcsb_id=${polymer.parent_rcsb_id}&auth_asym_id=${polymer.auth_asym_id}&format=json`
                    );
                    const data = await response.json();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${polymer.parent_rcsb_id}_${polymer.auth_asym_id}.json`;
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
                if (molstarViewer && polymerComponent) {
                    // Create selection for this polymer
                    const state = molstarViewer.ctx.state.data;
                    const cell = state.select(polymerComponent.ref)[0];
                    if (!cell?.obj) return;
                    
                    const loci = molstarViewer.loci_from_ref(polymerComponent.ref);
                    if (!loci) return;

                    // Select the polymer
                    molstarViewer.ctx.managers.structure.selection.clear();
                    molstarViewer.ctx.managers.structure.selection.fromLoci('add', loci);

                    // Download the selection
                    await molstarViewer.downloads.downloadSelection(
                        `${polymer.parent_rcsb_id}_${polymer.auth_asym_id}.cif`
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





  
export type ResidueData = [string, number];

interface PolymerComponentRowProps {
    polymer: Polymer;
}

const PolymerComponentRow: React.FC<PolymerComponentRowProps> = ({polymer}) => {
    const polyComponent = useAppSelector(state =>
        selectComponentById(state, {
            instanceId: 'main',
            componentId: polymer.auth_asym_id
        })
    );

    const polymerState = useAppSelector(state => selectPolymerStateByAuthId(state, polymer.auth_asym_id));

    const service = useMolstarInstance('main');
    const ctx = service?.viewer;
    const msc = service?.controller;

    const onToggleVisibility = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (ctx) {
            msc?.polymers.setPolymerVisibility(polymer.parent_rcsb_id, polymer.auth_asym_id, !polymerState.visible);
        }
    };

    const onToggleSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (ctx) {
            msc?.polymers.selectPolymerComponent(polymer.parent_rcsb_id, polymer.auth_asym_id, !polymerState?.selected);
        }
    };

    const onIsolate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (ctx) {
            msc?.polymers.isolatePolymer(polymer.parent_rcsb_id, polymer.auth_asym_id);
        }
    };

    const onClick = () => {
        ctx && msc?.polymers.focusPolymerComponent(polymer.parent_rcsb_id, polymer.auth_asym_id);
    };

    const onMouseEnter = () => {
        ctx && msc?.polymers.highlightPolymerComponent(polymer.parent_rcsb_id, polymer.auth_asym_id);
    };

    const onMouseLeave = () => {
        ctx?.ctx.managers.interactivity.lociHighlights.clearHighlights();
    };

    const color = polymer.nomenclature.length > 0 ? PolymerColorschemeWarm[polymer.nomenclature[0]] : Color(0xfafafa);
    const hexcol = Color.toHexStyle(color);
    const textColor = getContrastColor(hexcol);
    const on_hover_styling = 'bg-blue-50/30 border-l-4 border-l-slate-400 bg-slate-200';

    return (
        <div
            className="border-b border-gray-200 last:border-b-0"
            onMouseLeave={onMouseLeave}
            onMouseEnter={onMouseEnter}
            onClick={onClick}>
            {/* <PolymerTooltipWrapper polymer={polymer}> */}
            <div
                className={cn(
                    'flex items-center justify-between rounded-md px-2 transition-colors hover:cursor-pointer py-1 hover:border-l-4 hover:border-l-slate-400 hover:bg-slate-200',
                    polymerState?.hovered ? on_hover_styling : ''
                )}>
                <div className="flex items-center space-x-2">
                    <div className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-semibold transition-colors">
                        {polymer.auth_asym_id}
                    </div>
                    {polymer.nomenclature.length > 0 && (
                        <div
                            style={{
                                backgroundColor: hexcol,
                                color: textColor
                            }}
                            className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-semibold transition-colors">
                            {polymer.nomenclature[0]}
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                    {polyComponent && (
                        <SequenceViewerTrigger
                            auth_asym_id={polymer.auth_asym_id}
                            sequence={polyComponent.sequence}
                            metadata={{
                                type: polymer.entity_poly_polymer_type === 'RNA' ? 'Polynucleotide' : 'Polypeptide',
                                chain_title:
                                    polymer.nomenclature.length > 1 ? polymer.nomenclature[0] : polymer.auth_asym_id
                            }}
                            onSelectionChange={selection => {}}
                        />
                    )}
                    <button className={cn('rounded-full p-1 text-gray-500')} onClick={onIsolate} title="Isolate view">
                        <ScanSearch size={14} />
                    </button>

                    <button
                        className={cn('rounded-full p-1', polymerState?.visible ? 'text-blue-400' : 'text-gray-300')}
                        onClick={onToggleVisibility}>
                        {polymerState?.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>

                    <button
                        className={cn('rounded-full p-1 text-gray-500', polymerState?.selected ? 'text-blue-500' : '')}
                        onClick={onToggleSelection}>
                        {polymerState?.selected ? <CheckSquare size={14} /> : <Square size={14} />}
                    </button>

                    <DownloadMenu polymer={polymer} molstarViewer={ctx} className={polymerState?.selected ? 'text-blue-500' : ''} />
                </div>
            </div>
            {/* </PolymerTooltipWrapper> */}
        </div>
    );
};
export default PolymerComponentRow;
