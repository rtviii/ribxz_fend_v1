import React, {useContext, useRef, useState} from 'react';
import {cn} from '@/components/utils';
import {Eye, EyeOff, Square, CheckSquare, Focus, ScanSearch} from 'lucide-react';
import {Polymer} from '@/store/ribxz_api/ribxz_api';
import ribxzPolymerColorScheme from '@/components/mstar/providers/colorscheme';
import {Color} from 'molstar/lib/mol-util/color';
import {MolstarContext} from '@/components/mstar/molstar_context';
import {MolstarStateController} from '@/components/mstar/mstar_controller';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {useStructureHover, useStructureSelection} from '@/store/molstar/context_interactions';
import {PolymerComponent, selectComponentById} from '@/store/molstar/slice_refs';
import {SequenceViewerTrigger} from '@/app/components/sequence_viewer';
import { molstarInstance, useMolstarViewer } from '@/components/mstar/mstar_service';
export type ResidueData = [string, number];

interface PolymerComponentRowProps {
    polymer           : Polymer;
    isSelected        : boolean;
    onToggleSelect    : (id: string) => void;
    onToggleVisibility: (id: string) => void;
}

const PolymerComponentRow: React.FC<PolymerComponentRowProps> = ({polymer}) => {
  const polyComponent = useAppSelector(state => selectComponentById(state, polymer.auth_asym_id) ) as PolymerComponent;
  const polymerState = useAppSelector(state => state.polymer_states.statesByPolymer[polymer.auth_asym_id] );
  
  // Use the shared instance from context
  const molstar = useContext(MolstarContext);
  const {controller:msc, viewer:ctx} =  molstarInstance!



    const {isChainHovered} = useStructureHover(polymer.auth_asym_id);

    const onToggleVisibility = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (ctx) {
            msc.polymers.setPolymerVisibility(polymer.parent_rcsb_id, polymer.auth_asym_id, !polymerState.visible);
        }
    };

    const onToggleSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (ctx) {
            msc.polymers.selectPolymerComponent(polymer.parent_rcsb_id, polymer.auth_asym_id, !polymerState?.selected);
        }
    };
    const onIsolate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (ctx) {
            msc.polymers.isolatePolymer(polymer.parent_rcsb_id, polymer.auth_asym_id);
        }
    };

    const onClick = () => {
        ctx && msc.polymers.focusPolymerComponent(polymer.parent_rcsb_id, polymer.auth_asym_id);
    };

    const onMouseEnter = () => {
        ctx && msc.polymers.highlightPolymerComponent(polymer.parent_rcsb_id, polymer.auth_asym_id);
    };
    const onMouseLeave = () => {
        ctx?.ctx.managers.interactivity.lociHighlights.clearHighlights();
    };

    const color = polymer.nomenclature.length > 0 ? ribxzPolymerColorScheme[polymer.nomenclature[0]] : 'gray';
    const hexcol = Color.toHexStyle(color);
    const on_hover_styling = 'bg-blue-50/30 border-l-4 border-l-slate-400 bg-slate-200';

    return (
        <div
            className="border-b border-gray-200 last:border-b-0 "
            onMouseLeave={onMouseLeave}
            onMouseEnter={onMouseEnter}
            onClick={onClick}>
            <div
                className={cn(
                    'flex items-center justify-between rounded-md px-2 transition-colors hover:cursor-pointer py-1  hover:border-l-4 hover:border-l-slate-400 hover:bg-slate-200',
                    isChainHovered ? on_hover_styling : ''
                )}>
                <div className="flex items-center space-x-2">
                    <div
                        style={{backgroundColor: hexcol}}
                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold transition-colors ${
                            color === 'gray' ? 'text-black' : 'text-white'
                        }`}>
                        {polymer.nomenclature.length > 0 ? polymer.nomenclature[0] : polymer.auth_asym_id}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {polyComponent && (
                        <SequenceViewerTrigger
                            auth_asym_id={polymer.auth_asym_id}
                            sequence={polyComponent.sequence}
                            metadata={{
                                type: polymer.entity_poly_polymer_type === 'RNA' ? 'Polynucleotide' : 'Polypeptide',
                                chain_title:
                                    polymer.nomenclature.length > 1 ? polymer.nomenclature[0] : polymer.auth_asym_id
                            }}
                            onSelectionChange={selection => {
                                console.log('Selection changed:', selection);
                            }}
                        />
                    )}
                    <button className={cn('rounded-full p-1 text-gray-500')} onClick={onIsolate} title="Isolate view">
                        <ScanSearch size={14} />
                    </button>

                    <button className={cn('rounded-full p-1 text-gray-500')} onClick={onToggleVisibility}>
                        {polymerState?.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>

                    <button
                        className={cn('rounded-full p-1 text-gray-500', polymerState?.selected ? 'text-blue-500' : '')}
                        onClick={onToggleSelection}>
                        {polymerState?.selected ? <CheckSquare size={14} /> : <Square size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PolymerComponentRow;
