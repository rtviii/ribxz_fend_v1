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
import { Separator } from "@/components/ui/separator"
import Image from 'next/image'
import { MolstarContext } from "@/components/ribxz/molstar_context"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { ExpMethodBadge } from "@/components/ribxz/exp_method_badge"

// StateTransforms
// https://github.com/molstar/molstar/issues/1074
// https://github.com/molstar/molstar/issues/1112
// https://github.com/molstar/molstar/issues/1121

const LigandThumbnail = ({ data }: { data: NonpolymericLigand }) => {
    const ctx = useContext(MolstarContext)
    return <div key={data.chemicalId} className="hover:bg-slate-200 relative hover:cursor-pointer hover:border-white border rounded-md p-4 text-xs" onClick={
        () => {
            ctx?.create_ligand(data.chemicalId)
            ctx?.create_ligand_surroundings(data.chemicalId)
        }
    }>
        <div className="absolute top-4 right-4 text-sm  text-green-600">LIGAND</div>
        <h4 className="font-semibold">{data.chemicalId}</h4>
        <p>{data.chemicalName}</p>
    </div>

}

// export async function generateStaticParams(){
//     return [{rcsb_id: "3J7Z"}, {rcsb_id:"3J7Y"}]

// }

export default function StructurePage({ params }: { params: { rcsb_id: string } }) {

    const { rcsb_id } = useParams<{ rcsb_id: string; }>()
    const searchParams = useSearchParams()
    const ligand_param = searchParams.get('ligand')
    const ptc = searchParams.get('ptc')
    // const ptc          = "True"


    const { data: ptc_data, isLoading: ptc_data_IsLoading, error: ptc_error } = useRoutersRouterStructStructurePtcQuery({ rcsbId: rcsb_id })
    const { data, isLoading, error } = useRoutersRouterStructStructureProfileQuery({ rcsbId: rcsb_id })
    const [method, setMethod] = useState<undefined | string>()


    ptc_data as any

    const molstarNodeRef = useRef<HTMLDivElement>(null);
    const [ctx, setCtx] = useState<MolstarRibxz | null>(null)
    useEffect(() => {
        console.log("Page mounted. Initializing Molstar Plugin UI Context");
        (async () => {
            const x = new MolstarRibxz
            await x.init(molstarNodeRef.current!)
            setCtx(x)
        })()
    }, [])

    useEffect(() => {
        ctx?.download_struct(rcsb_id)
            .then((ctx) => {
                if (ligand_param != null) {
                    ctx.create_ligand(ligand_param!)
                }
            })
    }, [ctx, ligand_param, rcsb_id])

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className=" ">
                <ResizablePanel defaultSize={25} >
                    <Card className="h-full flex flex-col ">
                        <CardHeader>
                            <CardTitle>{data?.rcsb_id}</CardTitle>
                            <p className="text-gray-500 text-xs">{data?.citation_title}</p>
                        </CardHeader>

                        <MolstarContext.Provider value={ctx}>
                            <CardContent className="flex-grow overflow-hidden">
                                <Tabs defaultValue="info" >
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="info">Structure Info</TabsTrigger>
                                        <TabsTrigger value="components">Polymers</TabsTrigger>
                                    </TabsList>



                                    <TabsContent value="info" className=" h-[80vh] ">
                                        {/* <Image alt={`${data?.rcsb_id}`} className="mb-4" height="200" src="/sping.gif" style={{ aspectRatio: "300/200", objectFit: "cover", }} width="300" /> */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {data?.citation_rcsb_authors ?
                                                <div>
                                                    <h4 className="text text-sm font-medium">Authors</h4>
                                                    <HoverCard>
                                                        <HoverCardTrigger asChild>
                                                            <span className="group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md text-xs   transition-colors z-10" title="Full list of authors"  >
                                                                <span style={{ fontStyle: "italic" }} >{data?.citation_rcsb_authors[0]}</span>
                                                                <span style={{
                                                                    cursor: "pointer",
                                                                    display: 'inline-block',
                                                                    width: '15px',
                                                                    height: '15px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: '#cccccc',
                                                                    textAlign: 'center',
                                                                    lineHeight: '15px',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '14px',
                                                                    color: 'white'
                                                                }}>+</span>



                                                            </span>

                                                        </HoverCardTrigger>
                                                        <HoverCardContent className="w-80 grid grid-cols-2 gap-2 z-50">
                                                            {
                                                                data?.citation_rcsb_authors.map((author) => {
                                                                    return <div key={author} className="flex items-center gap-2">
                                                                        <div>
                                                                            <div className="font-medium">{author}</div>
                                                                            <div className="text-sm text-gray-500 dark:text-gray-400">Co-Author</div>
                                                                        </div>
                                                                    </div>
                                                                })}
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                </div> : null}


                                            <div>
                                                <h4 className="text text-sm font-medium">Deposition Year</h4>
                                                <p className="text-xs mt-1">{data?.citation_year}</p>
                                            </div>

                                            <div>
                                                <h4 className="text text-sm font-medium">Experimental Method</h4>
                                                <ExpMethodBadge expMethod={data?.expMethod} />
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


                                        {/* <Separator className="my-2" /> */}
                                        <h3 className=" font-medium my-2 text-gray-600">Ligands <span className="text-xs font-semibold text-gray-600">| </span>Landmarks</h3>
                                        <ScrollArea className="p-2 h-[55vh] overflow-auto rounded-sm no-scrollbar border-l border-r border-t ">
                                            <div>
                                                {
                                                    ptc_data !== undefined || data?.nonpolymeric_ligands.filter(ligand => !ligand.chemicalName.toLowerCase().includes("ion")) ?
                                                        <>

                                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                                {
                                                                    ptc_data ?
                                                                        <div className="hover:bg-slate-200 relative hover:cursor-pointer hover:border-white border rounded-md p-4"
                                                                            onClick={() => {
                                                                                var auth_asym_id = (ptc_data as any)['LSU_rRNA_auth_asym_id']
                                                                                var ptc_query = [auth_asym_id, (ptc_data as any)['site_9_residues'].map((r: any) => { return r[1] })]
                                                                                ctx?.select_multiple_residues([ptc_query as [string, number[]]])
                                                                            }} >

                                                                            <div className="absolute top-4 right-4 text-sm  text-blue-600">LANDMARK</div>
                                                                            <h4 className="font-semibold text-xs">PTC</h4>
                                                                            <p className="text-xs" >Peptidyl Transferase Center</p>
                                                                        </div> : null
                                                                }
                                                                {
                                                                    data?.nonpolymeric_ligands
                                                                        .filter(ligand => !ligand.chemicalName.toLowerCase().includes("ion"))
                                                                        .map((ligand, i) => {
                                                                            return <>
                                                                                <LigandThumbnail data={ligand} key={i} />
                                                                            </>
                                                                        }
                                                                        )

                                                                }

                                                            </div>
                                                        </> : null

                                                }
                                            </div>

                                        </ScrollArea>
                                    </TabsContent>



                                    <TabsContent value="components">
                                        {!isLoading ? <PolymersTable proteins={data?.proteins!} rnas={data?.rnas!} connect_to_molstar_ctx={true} /> : null}
                                    </TabsContent>
                                </Tabs>

                            </CardContent>
                        </MolstarContext.Provider>
                    </Card>
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={75}>
                    <div className="flex flex-col gap-4">
                        <MolstarNode ref={molstarNodeRef} />
                    </div>
                </ResizablePanel>



            </ResizablePanelGroup>
            <SidebarMenu />
        </div>
    )
}
