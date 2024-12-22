'use client';
import {CardContent, Card} from '@/components/ui/card';
import {Tabs, TabsList, TabsTrigger, TabsContent} from '@/components/ui/tabs';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from '@/components/ui/resizable';
import {
    Polymer,
    Protein,
    RibosomeStructure,
    Rna,
    useRoutersRouterStructStructureProfileQuery,
    useRoutersRouterStructStructurePtcQuery
} from '@/store/ribxz_api/ribxz_api';
import PolymersTable from '@/components/ribxz/polymer_table';
import {ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {SidebarMenu} from '@/components/ribxz/sidebar_menu';
// import {MolstarRibxz} from '@/components/mstar/__molstar_ribxz';
import {MolstarNode} from '@/components/mstar/spec';
// import {MolstarContext} from '@/components/mstar/__molstar_context';
import {ScrollArea} from '@radix-ui/react-scroll-area';
import {ExpMethodBadge} from '@/components/ribxz/text_aides/exp_method_badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {Button} from '@/components/ui/button';
import {DownloadIcon, EyeIcon, InfoIcon} from 'lucide-react';
import {AuthorsHovercard} from '@/components/ribxz/text_aides/authors_hovercard';
import {parseDateString} from '@/my_utils';
import {LandmarkItem, LigandItem} from './structural_component';
import {LandmarkActions, downloadPlyFile} from '@/app/landmarks/types';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {clear_selection, set_tunnel_shape_loci, snapshot_selection} from '@/store/slices/slice_structure_page';
import {cn} from '@/components/utils';
import {useUserInputPrompt} from './user_input_prompt';
import {ribxzMstarv2} from '@/components/mstar/mstar_v2';
import {MolstarStateController} from '@/components/mstar/mstar_controller';
import {BookmarkedSelections} from './bookmarked_selections.wip';
import PolymerComponentRow from './polymer_component';
import ComponentsEasyAccessPanel from './components_easy_access_panel';
import {MolstarServiceContext, molstarServiceInstance, useMolstarService} from '@/components/mstar/mstar_service';
import { TunnelLandmarkComponent } from './landmark_component';
const StructureComponentsTab = ({data, isLoading}: {data: RibosomeStructure; isLoading: boolean}) => {

    const {controller: msc, viewer: ctx} = molstarServiceInstance!;
    // const ctx = useContext(MolstarContext);

    if (isLoading) {
        return <div>Loading...</div>;
    } else {
        return (
            <Tabs defaultValue="polymers">
                <TabsList className="grid w-full grid-cols-3  p-0.5 h-7 mb-2">
                    <TabsTrigger value="polymers" className="text-xs py-1 px-2">
                        Polymers{' '}
                    </TabsTrigger>
                    <TabsTrigger value="landmarks" className="text-xs py-1 px-2">
                        Landmarks{' '}
                    </TabsTrigger>
                    <TabsTrigger value="ligands" className="text-xs py-1 px-2">
                        Ligands{' '}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="polymers">
                    <ScrollArea className="h-[90vh] p-4 space-y-2 flex flex-col">
                        {!isLoading ? (
                            <PolymersTable polymers={[...data.proteins, ...data.rnas, ...data.other_polymers]} />
                        ) : null}
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="landmarks">
                    <ScrollArea className="h-[90vh] p-4 space-y-2 flex flex-col">
                        <TunnelLandmarkComponent rcsb_id={data.rcsb_id} ctx={ctx!} />
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="ligands">
                    <ScrollArea className="h-[90vh] p-4 space-y-2 flex flex-col">
                        {data?.nonpolymeric_ligands
                            // .filter(ligand => !ligand.chemicalName.toLowerCase().includes("ion"))
                            .map((ligand, i) => {
                                return (
                                    <LigandItem
                                        ligandData={ligand}
                                        key={i}
                                        title={ligand.chemicalId}
                                        description={ligand.pdbx_description}
                                        // longDescription={ligand.SMILES}
                                        // imageUrl={ligand.imageUrl} // You'll need to add this to your landmarks data
                                    />
                                );
                            })}
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        );
    }
};