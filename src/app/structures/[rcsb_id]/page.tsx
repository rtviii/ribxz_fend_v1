'use client'
import { CardTitle, CardHeader, CardContent, CardFooter, Card, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
import { NonpolymericLigand, RibosomeStructure, useRoutersRouterStructStructureProfileQuery, useRoutersRouterStructStructurePtcQuery } from "@/store/ribxz_api/ribxz_api"
import { useParams, useSearchParams } from 'next/navigation'
import PolymersTable from "@/components/ribxz/polymer_table"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { SidebarMenu } from "@/components/ribxz/sidebar_menu"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { MolstarRibxz } from "@/components/mstar/molstar_wrapper_class"
import { MolstarNode } from "@/components/mstar/lib"
import { MolstarContext } from "@/components/ribxz/molstar_context"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { ExpMethodBadge } from "@/components/ribxz/exp_method_badge"
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
import { contract_taxname } from "@/my_utils"
import { Plus, Minus } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { LandmarkItem, LigandItem } from "./structural_component"

// const LigandThumbnail = ({ data }: { data: NonpolymericLigand }) => {
//     const ctx = useContext(MolstarContext)
//     return <div key={data.chemicalId} className="hover:bg-slate-200 relative hover:cursor-pointer hover:border-white border rounded-md p-4 text-xs" onClick={
//         () => {
//             ctx?.create_ligand(data.chemicalId)
//             ctx?.create_ligand_and_surroundings(data.chemicalId, 10)
//         }
//     }>
//         <div className="absolute top-4 right-4 text-sm  text-green-600">LIGAND</div>
//         <h4 className="font-semibold">{data.chemicalId}</h4>
//         <p>{data.chemicalName}</p>
//     </div>

// }

// const LandmarkItem = ({ title, description, longDescription, imageUrl }) => {
//     const ctx = useContext(MolstarContext);
//     const { rcsb_id } = useParams();
//     const [isHoverOpen, setIsHoverOpen] = useState(false);

//     return (
//         <Accordion type="single" collapsible className="w-full">
//             <AccordionItem value={title} className="border rounded-md overflow-hidden">
//                 <AccordionTrigger className="hover:no-underline py-2 px-4">
//                     <div className="flex items-center justify-between w-full">
//                         <div className="flex items-center space-x-2 text-left">
//                             <h3 className="text-base font-semibold">{title}</h3>
//                             <p className="text-xs text-gray-500 italic">{description}</p>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                             <DownloadIcon
//                                 className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700"
//                                 onClick={(e) => { e.stopPropagation(); ctx?.renderPTC(rcsb_id); }}
//                             />
//                             <EyeIcon
//                                 className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700"
//                                 onClick={(e) => { e.stopPropagation(); ctx?.renderPLY(rcsb_id); }}
//                             />
//                             <Popover open={isHoverOpen} onOpenChange={setIsHoverOpen}>
//                                 <PopoverTrigger asChild>
//                                     <InfoIcon
//                                         className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700"
//                                         onClick={(e) => { e.stopPropagation(); setIsHoverOpen(!isHoverOpen); }}
//                                     />
//                                 </PopoverTrigger>
//                                 <PopoverContent className="w-80">
//                                     <div className="flex flex-col space-y-2">
//                                         <img src={imageUrl} alt={title} className="w-full h-40 object-cover rounded" />
//                                         <p className="text-sm text-gray-700">{longDescription}</p>
//                                     </div>
//                                 </PopoverContent>
//                             </Popover>
//                         </div>
//                     </div>
//                 </AccordionTrigger>
//                 <AccordionContent className="px-4 py-2">
//                     <p className="text-sm text-gray-700">{longDescription}</p>
//                 </AccordionContent>
//             </AccordionItem>
//         </Accordion>
//     );
// };

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

const InfoRow = ({ title, value }) => (
    <div className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
        <h4 className="text-xs font-medium text-gray-600">{title}</h4>
        <div className="text-xs text-gray-800">{value}</div>
    </div>
);

const InfoSectionAccordion = ({ title, children, isActive }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`border-b border-gray-200 ${!isActive ? 'opacity-50' : ''}`}>
            <button
                className="flex justify-between items-center w-full py-2 px-4 text-left text-xs font-medium"
                onClick={() => isActive && setIsOpen(!isOpen)}
                disabled={!isActive}
            >

                {title}
                {isActive && (isOpen ? <Minus size={14} /> : <Plus size={14} />)}
            </button>
            {isOpen && isActive && (
                <div className="px-4 pb-2 text-xs">{children}</div>
            )}
        </div>
    );
};



const StructureInfoDashboard = ({ data, isLoading }) => {
    if (isLoading) return <div className="text-xs">Loading...</div>;

    const hasPolymers = data.polymers && data.polymers.length > 0;
    const hasLigands = data.ligands && data.ligands.length > 0;
    const hasLandmarks = data.landmarks && data.landmarks.length > 0;

    return (
        <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-2">{data?.citation_title}</p>

            <div className="space-y-0">
                {data?.citation_rcsb_authors && (
                    <InfoRow
                        title="Authors"
                        value={<AuthorsHovercard authors={data.citation_rcsb_authors} />}
                    />
                )}
                <InfoRow title="Deposition Year" value={data?.citation_year} />
                <InfoRow
                    title="Experimental Method"
                    value={<ExpMethodBadge expMethod={data?.expMethod} resolution={data.resolution} />}
                />
                <InfoRow title="Resolution" value={`${data?.resolution} Å`} />
                <InfoRow title="Source Organism" value={data?.src_organism_names.join(", ")} />
                {data?.host_organism_names?.length > 0 && (
                    <InfoRow title="Host Organism" value={data.host_organism_names[0]} />
                )}
            </div>

            {/* <div className="mt-4">
        <InfoSectionAccordion title="Polymers" isActive={hasPolymers}>
          {hasPolymers && data.polymers.map((polymer, index) => (
            <div key={index} className="mb-1 cursor-pointer hover:underline">
              {polymer.name}
            </div>
          ))}
        </InfoSectionAccordion>
        <InfoSectionAccordion title="Ligands" isActive={hasLigands}>
          {hasLigands && data.ligands.map((ligand, index) => (
            <div key={index} className="mb-1 cursor-pointer hover:underline">
              {ligand.name}
            </div>
          ))}
        </InfoSectionAccordion>
        <InfoSectionAccordion title="Landmarks" isActive={hasLandmarks}>
          {hasLandmarks && data.landmarks.map((landmark, index) => (
            <div key={index} className="mb-1 cursor-pointer hover:underline">
              {landmark.name}
            </div>
          ))}
        </InfoSectionAccordion>
      </div> */}
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


const landmarks = [
    {
        title: "PTC",
        description: "Peptidyl Transferase Center",
        longDescription: "The PTC is the active site of the ribosome where peptide bond formation occurs."
    },
    {
        title: "NPET",
        description: "Nascent Peptide Exit Tunnel",
        longDescription: "The NPET is a channel through which newly synthesized proteins exit the ribosome."
    },
    // {
    //     title: "rRNA Helices",
    //     description: "",
    //     longDescription: "Helices are the defining elements of secondary RNA structure identified with specific geometric and molecular interaction criteria."
    // }, {
    //     title: "SRL",
    //     description: "Sarcin-Ricin Loop",
    //     longDescription: ""
    // },
    // {
    //     title: "A-Site",
    //     description: "",
    //     longDescription: ""
    // }, {
    //     title: "P-Site",
    //     description: "",
    //     longDescription: ""
    // },
    // {
    //     title: "E-Site",
    //     description: "",
    //     longDescription: ""
    // },
    // {
    //     title: "NPET Vestibule",
    //     description: "",
    //     longDescription: ""
    // },

    // Add more landmarks as needed
];




const StructureComponentsDashboard = ({ data, isLoading }: { data: RibosomeStructure, isLoading: boolean }) => {
    // const { data, isLoading, error } = useRoutersRouterStructStructureProfileQuery({ rcsbId: rcsb_id })
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
                    {landmarks.map((landmark, index) => (
                        <LandmarkItem
                            key={index}
                            title={landmark.title}
                            description={landmark.description}
                            longDescription={landmark.longDescription}
                            imageUrl={landmark.imageUrl} // You'll need to add this to your landmarks data
                        />
                    ))}
                </ScrollArea>
            </TabsContent>

            <TabsContent value="ligands">
                <ScrollArea className="h-[90vh] p-4 space-y-2 flex flex-col">
                        {data?.nonpolymeric_ligands
                            // .filter(ligand => !ligand.chemicalName.toLowerCase().includes("ion"))
                            .map((ligand, i) => { 

                              return  <LigandItem
                            key={i}
                            title={ligand.chemicalId}
                            description={ligand.pdbx_description}
                            longDescription={ligand.SMILES}
                            imageUrl={ligand.imageUrl} // You'll need to add this to your landmarks data
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
                            <Tabs defaultValue="components" className="w-full">

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
