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
import {useSearchParams} from 'next/navigation';
import PolymersTable from '@/components/ribxz/polymer_table';
import {ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {SidebarMenu} from '@/components/ribxz/sidebar_menu';
import {MolstarRibxz} from '@/components/mstar/molstar_ribxz';
import {MolstarNode} from '@/components/mstar/lib';
import {MolstarContext} from '@/components/mstar/molstar_context';
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
import {Accordion} from '@/components/ui/accordion';
import {LandmarkItem, LigandItem} from './structural_component';
import {LandmarkActions, downloadPlyFile} from '@/app/landmarks/types';
import {useAppDispatch, useAppSelector} from '@/store/store';
import {
    clear_selection,
    set_id_to_selection,
    set_tunnel_shape_loci,
    snapshot_selection
} from '@/store/slices/slice_structure_page';
import {cn} from '@/components/utils';
import {useUserInputPrompt} from './user_input_prompt';
import {ribxzMstarv2} from '@/components/mstar/mstarv2';
import {MolstarStateController} from '@/components/mstar/ribxz_controller';

const sort_by_polymer_class = (a: Polymer, b: Polymer): number => {
    if (a.nomenclature.length === 0 || b.nomenclature.length === 0) {
        return 0;
    }
    const [, prefixA, numberA] = a.nomenclature[0].match(/([a-zA-Z]+)(\d*)/) || [];
    const [, prefixB, numberB] = b.nomenclature[0].match(/([a-zA-Z]+)(\d*)/) || [];

    if (prefixA !== prefixB) {
        return prefixA.localeCompare(prefixB);
    }

    const numA = numberA ? parseInt(numberA, 10) : 0;
    const numB = numberB ? parseInt(numberB, 10) : 0;
    return numA - numB;
};

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
            <TabsList className="bg-transparent border-0">
                <TabsTrigger value="components" className="text-xs py-1 px-2">
                    Components
                </TabsTrigger>
                <TabsTrigger value="info" className="text-xs py-1 px-2">
                    Info
                </TabsTrigger>
            </TabsList>
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

const StructureControlTab = ({data, isLoading}: {data: RibosomeStructure; isLoading: boolean}) => {
    if (isLoading) return <div className="text-xs">Loading...</div>;
    return (
        <Accordion type="multiple" defaultValue={['info']} className="w-full space-y-2">
            <div className="border border-gray-200 rounded-md shadow-inner bg-slate-100 p-2">
                <h3 className="text-sm  font-semibold mb-2">
                    <span>Info</span>
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
            <StructureEasyAccessPanel data={data} isLoading={isLoading} />
        </Accordion>
    );
};
const StructureComponentsTab = ({data, isLoading}: {data: RibosomeStructure; isLoading: boolean}) => {
    const ctx = useContext(MolstarContext);

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

const availableLandmarks = {
    PTC: {
        title: 'PTC',
        description: 'Peptidyl Transferase Center',
        longDescription: 'The PTC is the active site of the ribosome where peptide bond formation occurs.'
    },
    NPET: {
        title: 'NPET',
        description: 'Nascent Peptide Exit Tunnel',
        longDescription: 'The NPET is a channel through which newly synthesized proteins exit the ribosome.'
    }
};

const TunnelLandmarkComponent: React.FC<{
    rcsb_id: string;
    ctx: ribxzMstarv2;
}> = ({rcsb_id, ctx}) => {
    const tunnel_loci = useAppSelector(state => state.structure_page.tunnel.loci);
    const dispatch = useAppDispatch();
    const defaultTunnelActions: LandmarkActions = {
        download: (rcsb_id: string) => {
            downloadPlyFile(
                `${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/tunnel_geometry?rcsb_id=${rcsb_id}&is_ascii=true`,
                `${rcsb_id}_tunnel_geometry.ply`
            );
        },
        render: async (rcsb_id: string, ctx) => {
            const tunnel_loci = await ctx?.tunnel_geoemetry(rcsb_id);
            console.log('Returned loci:', tunnel_loci);
            dispatch(set_tunnel_shape_loci(tunnel_loci));
        },
        on_click: () => {
            console.log(tunnel_loci);
            // ctx.ctx.managers.structure.selection.fromLoci('add', tunnel_loci[0]);
            // ctx.ctx.managers.camera.focusLoci(tunnel_loci);
        }
    };
    return <LandmarkItem {...availableLandmarks['NPET']} rcsb_id={rcsb_id} landmark_actions={defaultTunnelActions} />;
};

const StructureEasyAccessPanel = ({data, isLoading}: {data: RibosomeStructure; isLoading: boolean}) => {
    const ctx = useContext(MolstarContext);
    const dispatch = useAppDispatch();
    const selected_polymers = useAppSelector(state => state.structure_page.selected);
    const toggleComponent = (id: string) => {
        dispatch(set_id_to_selection(id));
    };
    const [newBookmarkName, promptForNewBookmark] = useUserInputPrompt('Enter a name for the new bookmark:');
    const [bindingSiteName, promptForBindingSiteName] = useUserInputPrompt('Enter a name for the binding site object:');

    if (isLoading) return <div className="text-xs">Loading components...</div>;

    const createNewSelection = async () => {
        const name = promptForNewBookmark();
        // await ctx?.create_multiple_polymers(selected_polymers, name);
        dispatch(snapshot_selection({[name]: selected_polymers}));
    };

    const createBindingSite = async () => {
        const bsite_name = promptForBindingSiteName();
        selected_polymers;
        // const expr = ctx?.expression_polymers_selection(selected_polymers);
        // await ctx?.create_neighborhood_selection_from_expr(expr!);

        // await ctx?.create_multiple_polymers(selected_polymers, name)
        // dispatch(snapshot_selection({[ name ]:selected_polymers}))
    };
    return (
        <div className="space-y-4 shadow-inner bg-slate-100 p-2 border-gray-200 rounded-md">
            <h3 className="text-sm  font-semibold">
                <span>Structure Components</span>
            </h3>

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
                        ctx?.ctx.managers.structure.selection.clear();
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
            </div>
            <div className="flex flex-wrap gap-2">
                {data.rnas
                    .filter(r => r.assembly_id === 0)
                    .map(component => (
                        <MolecularComponentBadge
                            key={component.auth_asym_id}
                            id={component.auth_asym_id}
                            name={component.nomenclature[0] || component.auth_asym_id}
                            type={'rna'}
                            isSelected={selected_polymers.includes(component.auth_asym_id)}
                            onClick={() => {
                                toggleComponent(component.auth_asym_id);
                                // ctx?.select_chain(
                                //     component.auth_asym_id,
                                //     selected_polymers.includes(component.auth_asym_id) ? 'remove' : 'add'
                                // );
                            }}
                            // onMouseEnter={ctx ? () => ctx.highlightChain(component.auth_asym_id) : undefined}
                            // onMouseLeave={ctx ? () => ctx.removeHighlight() : undefined}
                        />
                    ))}

                {data.proteins

                    .filter(r => r.assembly_id === 0)
                    .toSorted(sort_by_polymer_class)
                    .map(component => (
                        <MolecularComponentBadge
                            key={component.auth_asym_id}
                            id={component.auth_asym_id}
                            name={component.nomenclature[0] || component.auth_asym_id}
                            type={'protein'}
                            isSelected={selected_polymers.includes(component.auth_asym_id)}
                            onClick={() => {
                                // toggleComponent(component.auth_asym_id);
                                // ctx?.select_chain(
                                //     component.auth_asym_id,
                                //     selected_polymers.includes(component.auth_asym_id) ? 'remove' : 'add'
                                // );
                            }}
                            onMouseEnter={ctx ? () => ctx.highlightChain(component.auth_asym_id) : undefined}
                            onMouseLeave={ctx ? () => ctx.removeHighlight() : undefined}
                        />
                    ))}
                {data.other_polymers
                    .filter(r => r.assembly_id === 0)
                    .map(component => (
                        <MolecularComponentBadge
                            key={component.auth_asym_id}
                            id={component.auth_asym_id}
                            name={component.nomenclature[0] || component.auth_asym_id}
                            type={'non-id-polymer'}
                            isSelected={selected_polymers.includes(component.auth_asym_id)}
                            onClick={() => toggleComponent(component.auth_asym_id)}
                        />
                    ))}
            </div>
            <div className="text-xs text-gray-500">Selected: {selected_polymers.length} component(s)</div>

            <div>
                <Button
                    onClick={() => {
                        (async () => {
                            // await ctx?.create_neighborhood_selection_from_expr(ctx?.select_expression('j'));
                        })();
                    }}></Button>
            </div>
        </div>
    );
};
const BookmarkTab = ({label, onClick}: {label: string; onClick: () => void}) => (
    <div className="group">
        <div
            onClick={onClick}
            className="
      px-2 pr-4 py-1 bg-white border border-gray-200 rounded-r-md shadow-sm cursor-pointer
      hover:bg-gray-50 text-[10px] w-10 overflow-hidden
      transition-all duration-250 ease-in-out
      group-hover:w-auto group-hover:max-w-[200px]
    ">
            <span className="block truncate">{label}</span>
        </div>
    </div>
);

export default function StructurePage({params}: {params: {rcsb_id: string}}) {
    const molstarNodeRef = useRef<HTMLDivElement>(null);
    const {rcsb_id} = params;
    const [leftPanelWidth, setLeftPanelWidth] = useState(25);
    const state = useAppSelector(state => state);
    const dispatch = useAppDispatch();

    const [ctx, setCtx] = useState<ribxzMstarv2 | null>(null);
    const [msc, setMsc] = useState<MolstarStateController | null>(null);

    const {data, isLoading, error} = useRoutersRouterStructStructureProfileQuery({rcsbId: rcsb_id});

    const searchParams = useSearchParams();
    const ligand_param = searchParams.get('ligand');
    const ptc = searchParams.get('ptc');
    const {
        data: ptc_data,
        isLoading: ptc_data_IsLoading,
        error: ptc_error
    } = useRoutersRouterStructStructurePtcQuery({rcsbId: rcsb_id});
    const [method, setMethod] = useState<undefined | string>();

    const selections = useAppSelector(state => state.structure_page.saved_selections);

    const bookmarks = Object.keys(selections);

    // !Autoload structure
    useEffect(() => {
        (async () => {
            const x = new ribxzMstarv2();
            await x.init(molstarNodeRef.current!);
            const y = new MolstarStateController(x);
            setCtx(x);
            setMsc(y);
        })();
    }, []);

    useEffect(() => {
        if (data === undefined) {
            return;
        }
        console.log('Running this usefeeftct');

        const nomenclature_map = ([...data?.proteins, ...data?.rnas, ...data?.other_polymers] as Polymer[]).reduce(
            (prev: Record<string, string>, current: Polymer) => {
                prev[current.auth_asym_id] = current.nomenclature.length > 0 ? current.nomenclature[0] : '';
                return prev;
            },
            {}
        );
        msc?.loadStructure(dispatch, rcsb_id, nomenclature_map);
    }, [ctx, data]);

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
            <div
                className="absolute top-4 left-0 z-10 flex flex-col space-y-2"
                style={{transform: `translateX(${leftPanelWidth}px)`}}>
                {bookmarks.map((bookmark, index) => (
                    <BookmarkTab
                        key={index}
                        label={bookmark}
                        onClick={() => {
                            ctx?.ctx.managers.structure.selection.clear();
                            // ctx?.select_multiple_polymers(selections[bookmark], 'add');
                        }}
                    />
                ))}
            </div>

            <MolstarContext.Provider value={ctx}>
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={25}>
                        <div ref={leftPanelRef} className="h-full">
                            <Card className="h-full flex flex-col border-0 rounded-none">
                                <Tabs defaultValue="info" className="w-full">
                                    <Button
                                        onClick={() => {
                                            console.log(state);
                                        }}>
                                        {' '}
                                        log state
                                    </Button>
                                    <StructureHeader data={data!} isLoading={isLoading} />
                                    <CardContent className="flex-grow overflow-hidden p-0 pt-2">
                                        <TabsContent value="components">
                                            <StructureComponentsTab data={data!} isLoading={isLoading} />
                                        </TabsContent>
                                        <TabsContent value="info" className="px-3">
                                            <StructureControlTab data={data!} isLoading={isLoading} />
                                        </TabsContent>
                                    </CardContent>
                                </Tabs>
                            </Card>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle className="w-px bg-gray-200" />

                    <ResizablePanel defaultSize={75}>
                        <MolstarNode ref={molstarNodeRef} />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </MolstarContext.Provider>
            <SidebarMenu />
        </div>
    );
}
