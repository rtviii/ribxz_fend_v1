'use client';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from '@/components/ui/resizable';
import _ from 'lodash';
import {createContext, useContext, useEffect, useRef, useState} from 'react';
import {MolstarNode, MolstarNode_secondary} from '@/components/mstar/spec';
import React from 'react';
import {SidebarMenu} from '@/components/ribxz/sidebar_menu';
import {ImperativePanelHandle} from 'react-resizable-panels';
import {PanelProvider, usePanelContext} from './panels_context';
import {useMolstarService} from '@/components/mstar/mstar_service';
import LigandSelection from './ligand_selection';
import CurrentBindingSiteInfoPanel from './source_bsite';
import BindingSitePredictionPanel from './target_bsite';

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

    const molstarNodeRef           = useRef<HTMLDivElement>(null);
    const molstarNodeRef_secondary = useRef<HTMLDivElement>(null);

    const mstar_service_main = useMolstarService(molstarNodeRef, 'main');
    const mstar_service_aux  = useMolstarService(molstarNodeRef_secondary, 'auxiliary');

    const {isPredictionPanelOpen} = usePanelContext();
    const lowerPanelRef           = React.useRef<ImperativePanelHandle>(null);
    const upperPanelRef           = React.useRef<ImperativePanelHandle>(null);

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

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={30} minSize={20}>
                    <div className="h-full p-4">
                        <LigandSelection />
                        <CurrentBindingSiteInfoPanel />
                        <BindingSitePredictionPanel />
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={50} minSize={30}>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={50} minSize={20} ref={upperPanelRef}>
                            <div className="h-full bg-background p-2 ">
                                <MolstarNode ref={molstarNodeRef} />
                            </div>
                        </ResizablePanel>
                        <ResizableHandle className="h-2 bg-gray-200 hover:bg-gray-300 transition-colors" />
                        <ResizablePanel ref={lowerPanelRef} defaultSize={50} minSize={0} collapsible>
                            <div className="h-full  p-2">
                                <MolstarNode_secondary ref={molstarNodeRef_secondary} />
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>

            <SidebarMenu />
        </div>
    );
}
