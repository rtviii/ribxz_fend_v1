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
import { DownloadIcon, EyeIcon } from "lucide-react"
import { AuthorsHovercard } from "@/components/ribxz/authors_hovercard"
import { contract_taxname } from "@/my_utils"

const LigandThumbnail = ({ data }: { data: NonpolymericLigand }) => {
    const ctx = useContext(MolstarContext)
    return <div key={data.chemicalId} className="hover:bg-slate-200 relative hover:cursor-pointer hover:border-white border rounded-md p-4 text-xs" onClick={
        () => {
            ctx?.create_ligand(data.chemicalId)
            ctx?.create_ligand_and_surroundings(data.chemicalId, 10)
        }
    }>
        <div className="absolute top-4 right-4 text-sm  text-green-600">LIGAND</div>
        <h4 className="font-semibold">{data.chemicalId}</h4>
        <p>{data.chemicalName}</p>
    </div>

}

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


const StructureInfoDashboard = ({ data, isLoading }: { data: RibosomeStructure, isLoading: boolean }) => {
    return <div className="grid grid-cols-2 gap-4">
        <p className="text-xs text-gray-500 px-3 mb-2 ">{data?.citation_title}</p>
        {data?.citation_rcsb_authors ?
            <div>
                <h4 className="text text-sm font-medium">Authors</h4>
                <AuthorsHovercard authors={data?.citation_rcsb_authors} />
            </div> : null}
        <div>
            <h4 className="text text-sm font-medium">Deposition Year</h4>
            <p className="text-xs mt-1">{data?.citation_year}</p>
        </div>

        <div>
            <h4 className="text text-sm font-medium">Experimental Method</h4>
            <ExpMethodBadge expMethod={data?.expMethod} resolution={data.resolution} />
        </div>

        <div>
            <h4 className="text text-sm font-medium">Resolution</h4>
            <p className="text-xs mt-1">{data?.resolution + " Å"} </p>
        </div>

        <div>
            <h4 className="text text-sm font-medium">Source Organism</h4>
            <p className="text-xs mt-1"> {data?.src_organism_names.join(", ")} </p>
        </div>
        {data?.host_organism_names && data.host_organism_names.length > 0 ?
            <div>
                <h4 className="text text-sm font-medium">Host Organism</h4>
                <p className="text-xs mt-1">{data?.host_organism_names[0]} </p>
            </div> : null}
    </div>

}
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

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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

const LandmarkItem = ({ title, description, longDescription }) => {
   
    const  ctx             = useContext(MolstarContext)
    const { rcsb_id } =     useParams<{ rcsb_id: string; }>()
    return <Accordion type = "single" collapsible className = "w-full">
       
        <AccordionItem value={title} className="border rounded-md overflow-hidden p-4">
            <AccordionTrigger className="hover:no-underline ">
                <div className="flex items-center justify-between w-full">
                    <div className="text-left">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="text-xs text-gray-500 italic">{description}</p>
                    </div>
                    <div className="flex items-center space-x-2 mr-4">
                        <DownloadIcon className="h-5 w-5 text-gray-500 cursor-pointer hover:bg-slate-200 hover:border "  onClick={(e)=>{e.stopPropagation()}}/>
                        <EyeIcon      className="h-5 w-5 text-gray-500 cursor-pointer hover:bg-slate-200 hover:border "  onClick={(e)=>{e.stopPropagation(); ctx?.renderPLY(rcsb_id)}}
                        
                            
                            />
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <p className="text-sm text-gray-700">{longDescription}</p>
            </AccordionContent>
        </AccordionItem>
    </Accordion>
};

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
                    {/* <div className="space-y-4"> */}
                        {landmarks.map((landmark, index) => (
                            <LandmarkItem key={index} {...landmark} />
                        ))}
                    {/* </div> */}



                </ScrollArea>
            </TabsContent>

            <TabsContent value="ligands">
                <ScrollArea className="h-[70vh] p-4">
                    <div className="grid grid-cols-2 gap-2">
                        {data?.nonpolymeric_ligands
                            .filter(ligand => !ligand.chemicalName.toLowerCase().includes("ion"))
                            .map((ligand, i) => (
                                <LigandThumbnail data={ligand} key={i} />
                            ))
                        }
                    </div>
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
