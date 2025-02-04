'use client';
import {Card} from '@/components/ui/card';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from '@/components/ui/resizable';
import {
    RibosomeStructure,
} from '@/store/ribxz_api/ribxz_api';
import PolymersTable from '@/components/ribxz/polymer_table';
import {ReactNode, use, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {SidebarMenu} from '@/components/ribxz/sidebar_menu';
import {MolstarNode} from '@/components/mstar/spec';
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
import {useMolstarInstance, useMolstarService} from '@/components/mstar/mstar_service';
import {useRibosomeStructureWithNomenclature} from '@/components/ribxzhooks';

const DownloadDropdown = ({rcsb_id}: {rcsb_id: string}) => {
    const handleCifDownload = () => {
        const link = document.createElement('a');
        link.href = `https://files.rcsb.org/download/${rcsb_id}.cif`;
        link.download = `${rcsb_id}.cif` || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <DownloadIcon className=" h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={handleCifDownload}>
                    <code className="text-blue-600 cursor-pointer">{rcsb_id}.mmcif</code>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const InfoRow = ({title, value}: {title: string; value: ReactNode}) => (
    <div className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
        <h4 className="text-xs font-medium text-gray-600">{title}</h4>
        <div className="text-xs text-gray-800">{value}</div>
    </div>
);

const StructureHeader = ({data, isLoading}: {data: RibosomeStructure; isLoading: boolean}) => {
    return (
        <div className="flex items-center justify-between  px-3 py-2">
            <div className="flex items-center space-x-2 overflow-hidden">
                <span className="font-medium">{data?.rcsb_id}</span>
                <span className="italic text-xs truncate max-w-[150px]"></span>
                <ExpMethodBadge
                    className="text-xs"
                    expMethod={data?.expMethod}
                    resolution={data?.resolution?.toFixed(2)}
                />
            </div>
        </div>
    );
};

interface MolecularComponentBadgeProps {
    id: string;
    name: string;
    type: 'protein' | 'rna' | 'ligand' | 'ion' | 'other' | 'non-id-polymer';
    isSelected: boolean;
    onClick: () => void;

    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const MolecularComponentBadge: React.FC<MolecularComponentBadgeProps> = ({
    id,
    name,
    type,
    isSelected,
    onMouseEnter,
    onMouseLeave,
    onClick
}) => {
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'protein':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            case 'rna':
                return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'non-id-polymer':
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
            case 'ligand':
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
            case 'ion':
                return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        }
    };

    return (
        <button
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
                getTypeColor(type),
                isSelected ? 'ring-2 ring-offset-1 ring-blue-500' : '',
                'cursor-pointer'
            )}>
            {name}
        </button>
    );
};

const StructureInfoTab = ({data, isLoading}: {data: RibosomeStructure; isLoading: boolean}) => {
    if (isLoading) return <div className="text-xs">Loading...</div>;
    return (
        // <Accordion type="multiple" defaultValue={['info']} className="w-full space-y-2">
        <div className="border border-gray-200 rounded-md shadow-inner bg-slate-100 p-2">
            <h3 className="text-sm  font-semibold mb-2">
                <span>{data.rcsb_id.toUpperCase()}</span>
            </h3>
            <p className="text-xs text-gray-500 mb-1 ">{data?.citation_title}</p>
            <div className="space-y-0">
                {data?.citation_rcsb_authors && (
                    <InfoRow title="Authors" value={<AuthorsHovercard authors={data.citation_rcsb_authors} />} />
                )}
                <InfoRow title="Deposition Year" value={parseDateString(data.deposition_date).year} />
                <InfoRow
                    title="Experimental Method"
                    value={<ExpMethodBadge expMethod={data?.expMethod} resolution={data.resolution} />}
                />
                <InfoRow title="Resolution" value={`${data?.resolution} Å`} />
                <InfoRow title="Source Organism" value={data?.src_organism_names.join(', ')} />
                {data?.host_organism_names?.length > 0 && (
                    <InfoRow title="Host Organism" value={data.host_organism_names[0]} />
                )}
            </div>
        </div>
        // </Accordion>
    );
};

const SelectionAndStructureActions = ({nomenclature_map}: {nomenclature_map: Record<string, string> | null}) => {
    const dispatch = useAppDispatch();
    const state = useAppSelector(s => s);
    const rcsb_id = Object.keys(state.mstar_refs.instances.main.rcsb_id_components_map)[0];
    const selected_polymers = useAppSelector(state => state.structure_page.selected);
    const service = useMolstarInstance('main');
    const [newBookmarkName, promptForNewBookmark] = useUserInputPrompt('Enter a name for the new bookmark:');
    const [bindingSiteName, promptForBindingSiteName] = useUserInputPrompt('Enter a name for the binding site object:');
    const createNewSelection = async () => {
        const name = promptForNewBookmark();
        dispatch(snapshot_selection({[name]: selected_polymers}));
    };
    const createBindingSite = async () => {
        const bsite_name = promptForBindingSiteName();
        selected_polymers;
    };
    return service === null ? (
        <>Loading... </>
    ) : (
        <div className="space-x-1">
            <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-6 px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700"
                onClick={() => {
                    // ctx?.toggle_visibility_by_ref();
                }}>
                Toggle Structure
            </Button>

            <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-6 px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700"
                onClick={() => {
                    // ctx?.select_multiple_polymers(selected_polymers, 'remove');
                    dispatch(clear_selection(null));
                    service.viewer?.ctx.managers.structure.selection.clear();
                }}>
                Clear Selection
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-6 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-gray-600"
                onClick={() => {
                    createNewSelection();
                }}>
                Create New Selection
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-6 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-gray-600"
                onClick={() => {
                    createBindingSite();
                }}>
                Create Binding Site
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-6 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-gray-600"
                onClick={() => {
                    service?.controller.landmarks.ptc(rcsb_id);
                }}>
                Render PTC
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-6 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-gray-600"
                onClick={() => {
                    service?.viewer.landmarks.tunnel_geometry(rcsb_id);
                }}>
                Render Tunnel Geometry
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-6 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-gray-600"
                onClick={() => {
                    service?.controller.landmarks.constriction_site(rcsb_id);
                }}>
                Render Constriction
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-6 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-gray-600"
                onClick={() => {
                    service?.controller.mute_polymers(rcsb_id);
                }}>
                Mute Polymers
            </Button>

            <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-6 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-gray-600"
                onClick={() => {
                    service?.controller.experimental.half_cylinder_residues(nomenclature_map);
                }}>
                HalfCylinder Residues
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-6 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-gray-600"
                onClick={() => {
                    service?.controller.experimental.cylinder_residues(nomenclature_map);
                }}>
                Cylinder Residues
            </Button>
        </div>
    );
};

export default function StructurePage({params}: {params: Promise<{rcsb_id: string}>}) {
    const {rcsb_id} = use(params);
    const {data, nomenclatureMap, isLoading} = useRibosomeStructureWithNomenclature(rcsb_id);

    const [leftPanelWidth, setLeftPanelWidth] = useState(25);

    const molstarNodeRef = useRef<HTMLDivElement>(null);
    const {viewer, controller, isInitialized} = useMolstarService(molstarNodeRef, 'main');
    const [nomMap, setNomMap] = useState<Record<string, string> | null>(null);

    useEffect(() => {
        if (!isInitialized || !data) return;
        controller?.loadStructure(rcsb_id, nomenclatureMap!);
    }, [isInitialized, data]);

    const resizeObserver = useCallback(() => {
        return new ResizeObserver(entries => {
            for (let entry of entries) {
                setLeftPanelWidth(entry.contentRect.width);
            }
        });
    }, []);

    const leftPanelRef = useCallback(
        (node: HTMLElement | null) => {
            if (node !== null) {
                const observer = resizeObserver();
                observer.observe(node);
                return () => {
                    observer.disconnect();
                };
            }
        },
        [resizeObserver]
    );


    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <BookmarkedSelections leftPanelWidth={leftPanelWidth} />
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={25}>
                    <Card
                        className="h-full flex flex-col border-0 rounded-none p-2 outline-red-600 space-y-2 py-4"
                        ref={leftPanelRef}>
                        <div className="sticky top-0 space-y-2  ">
                            <SelectionAndStructureActions nomenclature_map={nomMap} />
                            <StructureInfoTab data={data!} isLoading={isLoading} />
                        </div>
                        <div className="h-full  overflow-hidden p-2 bg-slate-100  rounded-sm shadow-inner">
                            {data ? (
                            <ComponentsEasyAccessPanel data={data} isLoading={isLoading} />
                            ) : <span>Loading..</span>}
                        </div>
                    </Card>
                </ResizablePanel>
                <ResizableHandle className="w-px bg-gray-200" />
                <ResizablePanel defaultSize={75}>
                    <MolstarNode ref={molstarNodeRef} />
                </ResizablePanel>
            </ResizablePanelGroup>
            <SidebarMenu />
        </div>
    );
}
