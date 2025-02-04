'use client';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from '@/components/ui/resizable';
import _ from 'lodash';
import {createContext, useContext, useEffect, useRef, useState} from 'react';
import {MolstarNode, MolstarNode_secondary} from '@/components/mstar/spec';
import React from 'react';
import {ImperativePanelHandle} from 'react-resizable-panels';
import {PanelProvider, usePanelContext} from './panels_context';
import {useMolstarService} from '@/components/mstar/mstar_service';
import {Switch} from '@/components/ui/switch';
import LigandSelection from './ligand_selection';
import CurrentBindingSiteInfoPanel from './source_bsite';
import BindingSitePredictionPanel from './target_bsite';
import {GlobalStructureSelection} from '@/components/ribxz/ribxz_structure_selection';
import {set_ligands_radius, set_selected_target_structure} from '@/store/slices/slice_ligands';
import {Label} from '@/components/ui/label';
import BindingSiteControlPanel from './controls_selections';
import TabbedBindingSite from './tabbed_bsites';
import {cn} from '@/components/utils';
import FloatingMenu from '@/components/ribxz/menu_floating';

interface LigandInfo {
    chemicalId: string;
    chemicalName: string;
    formula_weight: number;
    pdbx_description: string;
    drugbank_id?: string;
    drugbank_description?: string;
}

interface LigandAssociatedStructure {
    parent_structure: string;
    src_organism_ids: number[];
    src_organism_names: string[];
    superkingdom: number;
}

type LigandAssociatedTaxa = Array<[string, number]>;
type LigandRowProps = [LigandInfo, LigandAssociatedStructure[], LigandAssociatedTaxa];

export default function Ligands() {
    return (
        <PanelProvider>
            <LigandsPageWithoutContext />
        </PanelProvider>
    );
}

function LigandsPageWithoutContext() {
    const dispatch = useAppDispatch();

    const molstarNodeRef = useRef<HTMLDivElement>(null);
    const molstarNodeRef_secondary = useRef<HTMLDivElement>(null);

    const mstar_service_main = useMolstarService(molstarNodeRef, 'main');
    const mstar_service_aux = useMolstarService(molstarNodeRef_secondary, 'auxiliary');

    const lowerPanelRef = React.useRef<ImperativePanelHandle>(null);
    const upperPanelRef = React.useRef<ImperativePanelHandle>(null);

    const {isPredictionPanelOpen, togglePredictionPanel} = usePanelContext();
    useEffect(() => {
        if (lowerPanelRef.current && upperPanelRef.current) {
            if (!isPredictionPanelOpen) {
                lowerPanelRef.current.collapse();
                upperPanelRef.current.resize(100);
            } else {
                lowerPanelRef.current.expand();
                upperPanelRef.current.resize(50);
                lowerPanelRef.current.resize(50);
            }
        }
    }, [isPredictionPanelOpen]);
    const current_ligand = useAppSelector(state => state.ligands_page.current_ligand);
    const bsite_radius = useAppSelector(state => state.ligands_page.radius);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={30} minSize={20}>
                    <div className="h-full p-4">
                        <BindingSiteControlPanel
                            isPredictionEnabled={isPredictionPanelOpen}
                            onPredictionToggle={togglePredictionPanel}
                            onTargetStructureChange={rcsb_id => {
                                dispatch(set_selected_target_structure(rcsb_id));
                            }}
                        />
                        <div className="mt-4">
                            <TabbedBindingSite isPredictionEnabled={isPredictionPanelOpen} />
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={50} minSize={30}>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={50} minSize={20} ref={upperPanelRef}>
                            <div className="h-full bg-background p-2">
                                <MolstarNode ref={molstarNodeRef} />
                            </div>
                        </ResizablePanel>

                        <ResizableHandle
                            className={cn(
                                'h-2 bg-gray-200 hover:bg-gray-300 transition-colors',
                                !isPredictionPanelOpen && 'hidden'
                            )}
                        />

                        <ResizablePanel ref={lowerPanelRef} defaultSize={50} minSize={0} collapsible>
                            <div className="h-full p-2">
                                <MolstarNode_secondary ref={molstarNodeRef_secondary} />
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>

            <FloatingMenu/>
        </div>
    );
}
