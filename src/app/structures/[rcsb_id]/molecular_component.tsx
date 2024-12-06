import React, {useContext, useState} from 'react';
import {cn} from '@/components/utils';

import {Eye, EyeOff, Square, CheckSquare} from 'lucide-react';
import {Polymer} from '@/store/ribxz_api/ribxz_api';
import ribxzPolymerColorScheme from '@/components/mstar/providers/colorscheme';
import {Color} from 'molstar/lib/mol-util/color';
import {MolstarContext} from '@/components/mstar/molstar_context';
import {MolstarStateController} from '@/components/mstar/ribxz_controller';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {useStructureHover, useStructureSelection} from '@/store/molstar/context_interactions';

interface PolymerComponentRowProps {
    polymer: Polymer;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onToggleVisibility: (id: string) => void;
}

const PolymerComponentRow: React.FC<PolymerComponentRowProps> = ({polymer}) => {
    const [showContent, setShowContent] = useState(false);
    const dispatch = useAppDispatch();
    const state = useAppSelector(state => state);

    const {isChainHovered} = useStructureHover(polymer.auth_asym_id);
    const {isChainSelected} = useStructureSelection(polymer.auth_asym_id);

    const ctx = useContext(MolstarContext);
    const msc = new MolstarStateController(ctx!, dispatch, state);

    const [isSelected, setIsSelected] = useState(false);
    const [visible, setVisible] = useState(true);

    const onSelect = () => {
        ctx && msc.polymers.selectPolymerComponent(polymer.parent_rcsb_id, polymer.auth_asym_id, !isSelected);
        setIsSelected(!isSelected);
    };
    const onToggleVisibility = () => {
        ctx && msc.polymers.togglePolymerComponent(polymer.parent_rcsb_id, polymer.auth_asym_id, visible);
        setVisible(!visible);
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
    const on_hover_styling = 'bg-blue-50/30 border-l-4 border-l-slate-400 bg-slate-200'

    return (
        <div
            className="border-b border-gray-200 last:border-b-0 "
            onMouseLeave={onMouseLeave}
            onMouseEnter={onMouseEnter}
            onClick={onClick}>
            <div
                className={cn(
                    'flex items-center justify-between rounded-md px-2 transition-colors hover:cursor-pointer py-1  hover:border-l-4 hover:border-l-slate-400 hover:bg-slate-200',
                    // isSelected ? 'bg-blue-50' : 'hover:bg-gray-100',
                    isChainHovered ?  on_hover_styling : ''
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
                    <button
                        className={cn(
                            'rounded-full p-1 text-gray-500 ',
                            showContent ? 'text-blue-500' : ''
                        )}
                        onClick={e => {
                            e.stopPropagation();

                            onToggleVisibility();
                        }}>
                        {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                        className={cn(
                            'rounded-full p-1 text-gray-500 ',
                            isSelected ? 'text-blue-500' : ''
                        )}
                        onClick={e => {
                            e.stopPropagation();
                            onSelect();
                        }}>
                        {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PolymerComponentRow;
