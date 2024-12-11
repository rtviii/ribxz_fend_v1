import React, {useContext, useState} from 'react';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Settings, Eye, Download, Filter} from 'lucide-react';
import PolymerComponentRow from './polymer_component';
import {set_id_to_selection} from '@/store/slices/slice_structure_page';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {MolstarContext} from '@/components/mstar/molstar_context';
import {RibosomeStructure} from '@/store/ribxz_api/ribxz_api';
import {MolstarStateController} from '@/components/mstar/mstar_controller';

const ComponentsEasyAccessPanel = ({data, isLoading}: {data: RibosomeStructure; isLoading: boolean}) => {
    const [currentView, setCurrentView] = useState<'Polymers' | 'Landmarks' | 'Ligands'>('Polymers');
    const ctx = useContext(MolstarContext);
    const dispatch = useAppDispatch();
    const selected_polymers = useAppSelector(state => state.structure_page.selected);

    const state   = useAppSelector(state => state);
    const rcsb_id = Object.keys(state.mstar_refs.rcsb_id_components_map)[0];


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
            <div className="h-12 flex items-center justify-between  bg-gray-100 border-b">
                <div className="flex items-center gap-2">
                    <Select value={currentView} onValueChange={value => setCurrentView(value as typeof currentView)}>
                        <SelectTrigger className="h-8 w-28 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Polymers">Polymers</SelectItem>
                            <SelectItem value="Landmarks">Landmarks</SelectItem>
                            <SelectItem value="Ligands">Ligands</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <TooltipProvider>
                    <div className="flex items-center gap-2">
                        {/* <Tooltip>
                            <TooltipTrigger asChild>
                                <button 
                                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                                    onClick={() => console.log('Filter clicked')}
                                >
                                    <Filter size={16} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Filter components</p>
                            </TooltipContent>
                        </Tooltip> */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => {
                                        if (ctx) {
                                            const msc = new MolstarStateController(ctx, dispatch, state);
                                            msc.polymers.restoreAllVisibility(rcsb_id);
                                        }
                                    }}
                                    className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">
                                    <Eye size={16} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Show all components</TooltipContent>
                        </Tooltip>
                        {/* <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                                    onClick={() => console.log('Download clicked')}>
                                    <Download size={16} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Download selection</p>
                            </TooltipContent>
                        </Tooltip> */}
                        {/* <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                                    onClick={() => console.log('Settings clicked')}>
                                    <Settings size={16} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View settings</p>
                            </TooltipContent>
                        </Tooltip> */}
                    </div>
                </TooltipProvider>
            </div>
            <ScrollArea className="flex-1">{renderContent()}</ScrollArea>
        </div>
    );
};

export default ComponentsEasyAccessPanel;
