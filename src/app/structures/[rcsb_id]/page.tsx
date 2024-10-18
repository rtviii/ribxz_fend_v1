'use client'
import { CardTitle, CardHeader, CardContent, CardFooter, Card, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
import { RibosomeStructure, useRoutersRouterStructStructureProfileQuery, useRoutersRouterStructStructurePtcQuery } from "@/store/ribxz_api/ribxz_api"
import { useParams, useSearchParams } from 'next/navigation'
import PolymersTable from "@/components/ribxz/polymer_table"
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react"
import { SidebarMenu } from "@/components/ribxz/sidebar_menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { MolstarRibxz } from "@/components/mstar/molstar_wrapper_class"
import { MolstarNode } from "@/components/mstar/lib"
import { MolstarContext } from "@/components/ribxz/molstar_context"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { ExpMethodBadge } from "@/components/ribxz/exp_method_badge"
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { DownloadIcon, EyeIcon, InfoIcon } from "lucide-react"
import { AuthorsHovercard } from "@/components/ribxz/authors_hovercard"
import { contract_taxname, parseDateString } from "@/my_utils"
import { Plus, Minus } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { LandmarkItem, LigandItem } from "./structural_component"
import { LandmarkActions, downloadPlyFile } from "@/app/landmarks/types"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { set_tunnel_shape_loci } from "@/store/slices/rcsb_id_state"

const DownloadDropdown = ({ rcsb_id }: { rcsb_id: string }) => {
    const handleCifDownload = () => {
        const link = document.createElement('a');
        link.href = `https://files.rcsb.org/download/${rcsb_id}.cif`;
        link.download = `${rcsb_id}.cif` || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DropdownMenu >
            <DropdownMenuTrigger asChild >
                <Button variant="outline" size="sm" >
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

const InfoRow = ({ title, value }: { title: string, value: ReactNode }) => (
    <div className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
        <h4 className="text-xs font-medium text-gray-600">{title}</h4>
        <div className="text-xs text-gray-800">{value}</div>
    </div>
);

const StructureActionsDashboard = ({ data, isLoading }) => {
    if (isLoading) return <div className="text-xs">Loading...</div>;
    return (
        <div className="space-y-2">
            <h3 className="text-sm font-semibold">Actions</h3>
            <button className="w-full text-left text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded">
                Download Structure
            </button>
            <button className="w-full text-left text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded">
                View in 3D
            </button>
            <button className="w-full text-left text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded">
                Analyze Sequence
            </button>
        </div>
    );
};
const StructureEasyAccessPanel = ({ data, isLoading }) => {
  // Example components - replace with actual data from your API
  const exampleComponents = [
    { id: '1', name: 'uL22', type: 'protein' },
    { id: '2', name: 'uL23', type: 'protein' },
    { id: '3', name: '23S rRNA', type: 'rna' },
    { id: '4', name: 'ATP', type: 'ligand' },
    { id: '5', name: 'Mg2+', type: 'ion' },
    { id: '6', name: 'uS8', type: 'protein' },
    { id: '7', name: '5S rRNA', type: 'rna' },
    { id: '8', name: 'GTP', type: 'ligand' },
  ];

  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

  const toggleComponent = (id: string) => {
    setSelectedComponents(prev =>
      prev.includes(id)
        ? prev.filter(compId => compId !== id)
        : [...prev, id]
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'protein':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'rna':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'ligand':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'ion':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (isLoading) return <div className="text-xs">Loading components...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Structure Components</h3>
      <div className="flex flex-wrap gap-2">
        {exampleComponents.map(component => (
          <Badge
            key={component.id}
            variant="outline"
            className={`cursor-pointer transition-colors ${
              getTypeColor(component.type)
            } ${
              selectedComponents.includes(component.id)
                ? 'ring-2 ring-offset-1 ring-blue-500'
                : ''
            }`}
            onClick={() => toggleComponent(component.id)}
          >
            {component.name}
          </Badge>
        ))}
      </div>
      <div className="text-xs text-gray-500">
        Selected: {selectedComponents.length} component(s)
      </div>
    </div>
  );
};
const StructureInfoDashboard = ({ data, isLoading }: { data: RibosomeStructure, isLoading: boolean }) => {
    if (isLoading) return <div className="text-xs">Loading...</div>;
    return (
        <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-2">{data?.citation_title}</p>

            <div className="space-y-0">
                {data?.citation_rcsb_authors && (
                    <InfoRow title="Authors" value={<AuthorsHovercard authors={data.citation_rcsb_authors} />} />
                )}

                <InfoRow title="Deposition Year" value={parseDateString(data.deposition_date).year} />
                <InfoRow title="Experimental Method" value={<ExpMethodBadge expMethod={data?.expMethod} resolution={data.resolution} />} />
                <InfoRow title="Resolution" value={`${data?.resolution} Å`} />
                <InfoRow title="Source Organism" value={data?.src_organism_names.join(", ")} />

                {data?.host_organism_names?.length > 0 && (
                    <InfoRow title="Host Organism" value={data.host_organism_names[0]} />
                )}
            </div>

            <div className="mt-4">

                                        <StructureActionsDashboard data={data!} isLoading={isLoading} />
                <StructureEasyAccessPanel data={data!} isLoading={isLoading} />
            </div>
        </div>
    );
};
const StructureHeader = ({ data, isLoading }: { data: RibosomeStructure, isLoading: boolean }) => {
    return <div className="flex items-center justify-between  px-3 py-2">
        <div className="flex items-center space-x-2 overflow-hidden">
            <span className="font-medium">{data?.rcsb_id}</span>
            <span className="italic text-xs truncate max-w-[150px]">
                {/* {contract_taxname(data?.src_organism_names?.[0])} */}
            </span>
            <ExpMethodBadge
                className="text-xs"
                expMethod={data?.expMethod}
                resolution={data?.resolution?.toFixed(2)}
            />
        </div>
        <TabsList className="bg-transparent border-0">
            <TabsTrigger value="components" className="text-xs py-1 px-2">Components</TabsTrigger>
            <TabsTrigger value="info" className="text-xs py-1 px-2">Info</TabsTrigger>
        </TabsList>

    </div>
}

const landmarks = {
    "PTC": {
        title: "PTC",
        description: "Peptidyl Transferase Center",
        longDescription: "The PTC is the active site of the ribosome where peptide bond formation occurs."
    },
    "NPET": {
        title: "NPET",
        description: "Nascent Peptide Exit Tunnel",
        longDescription: "The NPET is a channel through which newly synthesized proteins exit the ribosome."
    },
};

const TunnelLandmarkComponent: React.FC<{ rcsb_id: string, ctx: MolstarRibxz }> = ({ rcsb_id, ctx }) => {
    const tunnel_loci = useAppSelector(state => state.structure_page.tunnel.loci)
    const dispatch = useAppDispatch();
    const defaultTunnelActions: LandmarkActions = {
        download: (rcsb_id: string) => { downloadPlyFile(`${process.env.NEXT_PUBLIC_DJANGO_URL}/structures/tunnel_geometry?rcsb_id=${rcsb_id}&is_ascii=true`, `${rcsb_id}_tunnel_geometry.ply`) },
        render: async (rcsb_id: string, ctx) => { const tunnel_loci = await ctx?.renderPLY(rcsb_id); console.log("Returned loci:", tunnel_loci); dispatch(set_tunnel_shape_loci(tunnel_loci)) },
        on_click: () => { console.log(tunnel_loci); ctx.ctx.managers.structure.selection.fromLoci('add', tunnel_loci[0]); ctx.ctx.managers.camera.focusLoci(tunnel_loci) },
    };
    return <LandmarkItem  {...landmarks["NPET"]} rcsb_id={rcsb_id} landmark_actions={defaultTunnelActions} />;
};

const StructureComponentsDashboard = ({ data, isLoading }: { data: RibosomeStructure, isLoading: boolean }) => {
    const ctx = useContext(MolstarContext)

    if (isLoading) {
        return <div>Loading...</div>
    }
    else {

        return <Tabs defaultValue="polymers">
            <TabsList className="grid w-full grid-cols-3  p-0.5 h-7 mb-2">
                <TabsTrigger value="polymers" className="text-xs py-1 px-2">Polymers  </TabsTrigger>
                <TabsTrigger value="landmarks" className="text-xs py-1 px-2">Landmarks </TabsTrigger>
                <TabsTrigger value="ligands" className="text-xs py-1 px-2">Ligands   </TabsTrigger>
            </TabsList>

            <TabsContent value="polymers">
                {!isLoading ? <PolymersTable polymers={[...data.proteins, ...data.rnas, ...data.other_polymers]} connect_to_molstar_ctx={true} /> : null}
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
                            return <LigandItem
                                ligandData={ligand}
                                key={i}
                                title={ligand.chemicalId}
                                description={ligand.pdbx_description}
                            // longDescription={ligand.SMILES}
                            // imageUrl={ligand.imageUrl} // You'll need to add this to your landmarks data
                            />
                        })
                    }
                </ScrollArea>
            </TabsContent>
        </Tabs>
    }
}

export default function StructurePage({ params }: { params: { rcsb_id: string } }) {

    const { rcsb_id } = useParams<{ rcsb_id: string; }>()
    const searchParams = useSearchParams()
    const ligand_param = searchParams.get('ligand')
    const ptc = searchParams.get('ptc')

    const { data: ptc_data, isLoading: ptc_data_IsLoading, error: ptc_error } = useRoutersRouterStructStructurePtcQuery({ rcsbId: rcsb_id })
    const { data, isLoading, error } = useRoutersRouterStructStructureProfileQuery({ rcsbId: rcsb_id })
    const [method, setMethod] = useState<undefined | string>()



    const molstarNodeRef = useRef<HTMLDivElement>(null);
    const [ctx, setCtx] = useState<MolstarRibxz | null>(null)
    useEffect(() => {
        (async () => {
            const x = new MolstarRibxz
            await x.init(molstarNodeRef.current!)
            setCtx(x)
        })()
    }, [])

    useEffect(() => {
        console.log("Fired off download struct");

        ctx?.download_struct(rcsb_id)
            .then(({ ctx, struct_representation }) => {
                if (ligand_param != null) {
                    ctx.create_ligand(ligand_param!)
                }
            })
    }, [ctx, ligand_param, rcsb_id])

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <MolstarContext.Provider value={ctx}>
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={25}>
                        <Card className="h-full flex flex-col border-0 rounded-none">
                            <Tabs defaultValue="info" className="w-full">

                                <StructureHeader data={data!} isLoading />
                                <CardContent className="flex-grow overflow-hidden p-0 pt-2">
                                    <TabsContent value="components">
                                        <StructureComponentsDashboard data={data!} isLoading={isLoading} />
                                    </TabsContent>

                                    <TabsContent value="info" className="px-3">
                                        <StructureInfoDashboard data={data!} isLoading={isLoading} />
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>
                    </ResizablePanel>

                    <ResizableHandle className="w-px bg-gray-200" />

                    <ResizablePanel defaultSize={75}>
                        <MolstarNode ref={molstarNodeRef} />
                    </ResizablePanel>
                </ResizablePanelGroup>

            </MolstarContext.Provider>
            <SidebarMenu />
        </div>
    )
}
