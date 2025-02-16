'use client';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {cn} from '@/components/utils';
import {Eye, EyeOff, Square, CheckSquare, Focus, ScanSearch} from 'lucide-react';
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

    const color            = polymer.nomenclature.length > 0 ? PolymerColorschemeWarm[polymer.nomenclature[0]] : Color(0xfafafa);
    const hexcol           = Color.toHexStyle(color);
    const textColor        = getContrastColor(hexcol);
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
                                type       : polymer.entity_poly_polymer_type === 'RNA' ? 'Polynucleotide': 'Polypeptide',
                                chain_title: polymer.nomenclature.length > 1 ? polymer.nomenclature[0]    : polymer.auth_asym_id
                            }}
                            onSelectionChange={selection => {
                            }}
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
                </div>
            </div>
            {/* </PolymerTooltipWrapper> */}
        </div>
    );
};
export default PolymerComponentRow;
