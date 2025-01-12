'use client';
import {Badge} from '@/components/ui/badge';
import {TableHead, TableRow, TableHeader, TableCell, TableBody, Table} from '@/components/ui/table';
import {
    BindingSite,
    BindingSiteChain,
    LigandTransposition,
    Polymer,
    ribxz_api,
    useRoutersRouterStructListLigandsQuery
} from '@/store/ribxz_api/ribxz_api';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from '@/components/ui/resizable';
import {
    NonpolymericLigand,
    RibosomeStructure,
    useRoutersRouterStructStructureProfileQuery,
    useRoutersRouterStructStructurePtcQuery
} from '@/store/ribxz_api/ribxz_api';
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

// interface TaxaDropdownProps {
//     count: number;
//     species: string[];
// }

// function LigandTaxonomyDropdown(props: {count: number; species: LigandAssociatedTaxa}) {
//     return (
//         <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//                 <Button variant="outline" className="w-20">
//                     {props.count}
//                 </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className=" max-h-60 overflow-y-scroll">
//                 <p className="italic ">
//                     {props.species.toSorted().map((spec, i) => (
//                         <DropdownMenuItem key={i}>{spec[1]}</DropdownMenuItem>
//                     ))}
//                 </p>
//             </DropdownMenuContent>
//         </DropdownMenu>
//     );
// }

// function LigandStructuresDropdown(props: {count: number; structures: LigandAssociatedStructure[]; info: LigandInfo}) {
//     const router = useRouter();
//     return (
//         <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//                 <Button variant="outline" className="w-40">
//                     {props.count}
//                 </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="max-h-80 overflow-y-scroll">
//                 {props.structures
//                     .toSorted((s1, s2) => Number(s1.src_organism_names[0] > s2.src_organism_names[0]))
//                     .map((struct, i) => (
//                         <DropdownMenuItem key={i}>
//                             <Link
//                                 href={{
//                                     pathname: `/structures/${struct.parent_structure}`,
//                                     query: {ligand: props.info.chemicalId}
//                                 }}>
//                                 <Badge className="w-60 flex justify-between items-center cursor-pointer">
//                                     {struct.parent_structure}
//                                     <div className="italic text-white flex gap-2 flex-row">
//                                         {struct.src_organism_names[0].split(' ').slice(0, 2).join(' ')}
//                                         <TaxonomyDot
//                                             className={`w-2 h-2 ${(() => {
//                                                 if (struct.superkingdom == 2) return 'fill-green-500';
//                                                 else if (struct.superkingdom == 2157) return 'fill-orange-500';
//                                                 else if (struct.superkingdom === 2759) return 'fill-blue-500';
//                                             })()}`}
//                                         />
//                                     </div>
//                                 </Badge>
//                             </Link>
//                         </DropdownMenuItem>
//                     ))}
//             </DropdownMenuContent>
//         </DropdownMenu>
//     );
// }

// const createLigandAndBindingSite = async (
//     molstarInstance: any,  // Replace with your actual MolStar instance type
//     dispatch: any,         // Replace with your actual dispatch type
//     params: {
//         instanceId: MolstarInstanceId,
//         rcsbId: RCSB_ID,
//         chemicalId: string,
//         radius?: number
//     }
// ) => {
//     const { instanceId, rcsbId, chemicalId, radius = 5 } = params;

//     const refs = await molstarInstance.create_ligand_and_surroundings(chemicalId, radius);

//         return refs;
//     }

//     return undefined;
// }

type LigandAssociatedTaxa = Array<[string, number]>;
type LigandRowProps = [LigandInfo, LigandAssociatedStructure[], LigandAssociatedTaxa];

// const DownloadDropdown = ({
//     residues,
//     disabled,
//     filename
// }: {
//     residues: ResidueSummary[];
//     disabled: boolean;
//     filename: string;
// }) => {
//     const handleDownloadCSV = () => {
//         var data = residues.map(residue => {
//             return [
//                 residue.auth_seq_id,
//                 residue.label_comp_id,
//                 residue.auth_asym_id,
//                 residue.polymer_class,
//                 residue.rcsb_id
//             ];
//         });

//         const csvContent = data.map(row => row.join(',')).join('\n');

//         // Create a Blob with the CSV content
//         const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
//         // Create a download link
//         const link = document.createElement('a');
//         if (link.download !== undefined) {
//             const url = URL.createObjectURL(blob);
//             link.setAttribute('href', url);
//             link.setAttribute('download', `${filename}`);
//             link.style.visibility = 'hidden';
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//         }
//     };

//     return (
//         <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//                 <Button variant="outline" size="sm" disabled={disabled}>
//                     <DownloadIcon className="mr-2 h-4 w-4" />
//                     Download
//                 </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//                 <DropdownMenuItem onClick={handleDownloadCSV}>CSV</DropdownMenuItem>
//             </DropdownMenuContent>
//         </DropdownMenu>
//     );
// };

// const LigandPredictionNucleotides = (
//     lp: LigandTransposition
// ): {
//     auth_asym_id: string;
//     auth_seq_id: number;
// }[] => {
//     if (lp === null) {
//         return [];
//     }
//     var chain_residue_tuples = [];
//     for (var chain of lp.constituent_chains) {
//         for (let res of chain.target.target_bound_residues) {
//             chain_residue_tuples.push({
//                 auth_asym_id: chain.target.auth_asym_id,
//                 auth_seq_id: res.auth_seq_id
//             });
//         }
//     }

//     return chain_residue_tuples;
// };

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

    // const {data: data_tgt, nomenclatureMap: nomenclatureMap_tgt, isLoading: isLoading_tgt} = useRibosomeStructureWithNomenclature(current_selected_target?.rcsb_id!)

    // const toggleLowerPanel = () => {
    //     setShowLowerPanel(prev => !prev);
    //     if (lowerPanelRef.current && upperPanelRef.current) {
    //         if (showLowerPanel) {
    //             lowerPanelRef.current.collapse();
    //             upperPanelRef.current.resize(100);
    //         } else {
    //             lowerPanelRef.current.expand();
    //             upperPanelRef.current.resize(50);
    //             lowerPanelRef.current.resize(50);
    //         }
    //     }
    // };

    // const [checked, setChecked] = useState(false);
    // const [showLowerPanel, setShowLowerPanel] = useState(false);

    const {isPredictionPanelOpen} = usePanelContext();
    const lowerPanelRef = React.useRef<ImperativePanelHandle>(null);
    const upperPanelRef = React.useRef<ImperativePanelHandle>(null);

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
