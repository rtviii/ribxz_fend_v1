import React, {useContext, useState} from 'react';
import {cn} from '@/components/utils';

import {Eye, EyeOff, Square, CheckSquare} from 'lucide-react';
import {Polymer} from '@/store/ribxz_api/ribxz_api';
import ribxzPolymerColorScheme from '@/components/mstar/providers/colorscheme';
import {Color} from 'molstar/lib/mol-util/color';
import {MolstarContext} from '@/components/mstar/molstar_context';

interface PolymerComponentRowProps {
    polymer: Polymer;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onToggleVisibility: (id: string) => void;
}

const PolymerComponentRow: React.FC<PolymerComponentRowProps> = ({
    polymer,
    isSelected,
    onToggleSelect,
    onToggleVisibility
}) => {
    const [showContent, setShowContent] = useState(false);
    const ctx = useContext(MolstarContext);

    const color = polymer.nomenclature.length > 0 ? ribxzPolymerColorScheme[polymer.nomenclature[0]] : 'gray';
    const hexcol = Color.toHexStyle(color);

    return (
        <div className="border-b border-gray-200 last:border-b-0 py-1">
            <div
                className={cn(
                    'flex items-center justify-between rounded-md px-2 transition-colors',
                    isSelected ? 'bg-blue-50' : 'hover:bg-gray-100'
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
                            'rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700',
                            showContent ? 'text-blue-500' : ''
                        )}
                        onClick={() => setShowContent(prev => !prev)}>
                        {showContent ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                        className={cn(
                            'rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700',
                            isSelected ? 'text-blue-500' : ''
                        )}
                        onClick={() => onToggleSelect(polymer.auth_asym_id)}>
                        {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                    </button>
                </div>
            </div>
            {showContent && <div className="mt-2">{/* Render the "content" view here */}</div>}
        </div>
    );
};

export default PolymerComponentRow;
