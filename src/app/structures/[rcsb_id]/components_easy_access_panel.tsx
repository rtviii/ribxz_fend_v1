import React, { useContext, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue 
} from '@/components/ui/select';
import PolymerComponentRow from './polymer_component';
import { set_id_to_selection } from '@/store/slices/slice_structure_page';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { MolstarContext } from '@/components/mstar/molstar_context';
import { RibosomeStructure } from '@/store/ribxz_api/ribxz_api';

const ComponentsEasyAccessPanel = ({data, isLoading}: {data: RibosomeStructure; isLoading: boolean}) => {
    const [currentView, setCurrentView] = useState<'Polymers' | 'Landmarks' | 'Ligands'>('Polymers');
    const ctx = useContext(MolstarContext);
    const dispatch = useAppDispatch();
    const selected_polymers = useAppSelector(state => state.structure_page.selected);

    const toggleComponent = (id: string) => {
        dispatch(set_id_to_selection(id));
    };

    if (isLoading) return <div className="text-xs">Loading components...</div>;

    const renderContent = () => {
        switch (currentView) {
            case 'Polymers':
                return (
                    <div className="space-y-1">
                        {[...data.rnas, ...data.proteins, ...data.other_polymers]
                            .filter(r => r.assembly_id === 0)
                            .map(component => (
                                <PolymerComponentRow
                                    polymer={component}
                                    key={component.auth_asym_id}
                                    isSelected={selected_polymers.includes(component.auth_asym_id)}
                                    onToggleSelect={toggleComponent}
                                    onToggleVisibility={() => {}}
                                />
                            ))}
                    </div>
                );
            case 'Landmarks':
                return (
                    <div className="space-y-1">
                        <div className="text-sm text-gray-500">Landmarks view (to be implemented)</div>
                    </div>
                );
            case 'Ligands':
                return (
                    <div className="space-y-1">
                        <div className="text-sm text-gray-500">Ligands view (to be implemented)</div>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="h-8 flex items-center px-1">
                <Select value={currentView} onValueChange={(value) => setCurrentView(value as typeof currentView)}>
                    <SelectTrigger className="h-6 w-24 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Polymers">Polymers</SelectItem>
                        <SelectItem value="Landmarks">Landmarks</SelectItem>
                        <SelectItem value="Ligands">Ligands</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <ScrollArea className="flex-1">
                {renderContent()}
            </ScrollArea>
        </div>
    );
};

export default ComponentsEasyAccessPanel;