"use client"
import { CardTitle, CardHeader, CardContent, CardFooter, Card, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
import { MolstarNode, } from "@/store/molstar/lib"
import { Skeleton } from "@/components/ui/skeleton"
import {  RibosomeStructure, useRoutersRouterStructStructureProfileQuery } from "@/store/ribxz_api/ribxz_api"
import { initiatePluginUIContext, download_struct } from "@/store/slices/molstar_state"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { useParams } from 'next/navigation'
import StructureComponents from "./components_table"
import { transform } from "@/store/molstar/functions"
import { useEffect, useRef, useState } from "react"

// StateTransforms
// https://github.com/molstar/molstar/issues/1074
// https://github.com/molstar/molstar/issues/1112
// https://github.com/molstar/molstar/issues/1121

// -----------
// -----------

export default function StructurePage({data}:{data:RibosomeStructure}) {

    const {rcsb_id}      = useParams<{ rcsb_id: string;}>()
    const molstarNodeRef = useRef<HTMLDivElement>(null);
    const dispatch       = useAppDispatch();
    const ctx            = useAppSelector(state => state.molstar.ui_plugin)!

    useEffect(()=>{ dispatch(initiatePluginUIContext({ parent_element: molstarNodeRef.current!, initiate_with_structure:rcsb_id })) },[molstarNodeRef, dispatch])
    const [test_active, test_active_set]                   = useState<boolean>(false)
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className={"rounded-lg border " + (test_active ? 'bg-black' : 'bg-white')}  >
                <ResizablePanel defaultSize={25} >
                <Button onClick={()=>{transform(ctx)}} > select current</Button>
                {/* <ChainPicker/> */}

                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>{data?.rcsb_id}</CardTitle>
                            <p className="text-gray-500 text-sm">{data?.citation_title}</p>
                        </CardHeader>

                        <CardContent className="flex-grow overflow-auto">
                            <Tabs defaultValue="info" >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="info">Info</TabsTrigger>
                                    <TabsTrigger value="components">Substructures</TabsTrigger>
                                </TabsList>
                                <TabsContent value="info">
                                    <div className="mt-4">
                                        <img alt={`${data?.rcsb_id}`} className="mb-4" height="200" src="/ribosome.gif" style={{ aspectRatio: "300/200", objectFit: "cover", }} width="300" />
                                        <div className="flex flex-col gap-4">
                                            <div className="flex justify-between">
                                                <strong>Source Organism:</strong>
                                                <p className="overflow-ellipsis overflow-hidden hover:overflow-visible">
                                                    {data?.src_organism_names}
                                                </p>
                                            </div>
                                            <div className="flex justify-between">
                                                <strong>Host Organism:</strong>
                                                <p className="overflow-ellipsis overflow-hidden hover:overflow-visible">
                                                    {data?.host_organism_names}
                                                </p>
                                            </div>
                                            <div className="flex justify-between">
                                                <strong>Resolution:</strong>
                                                <p>{data?.resolution} Å</p>
                                            </div>
                                            <div className="flex justify-between">
                                                <strong>Experimental Method:</strong>
                                                <p>{data?.expMethod}</p>
                                            </div>
                                            <div className="flex justify-between">
                                                <strong>Authors:</strong>
                                                <p className="overflow-ellipsis overflow-hidden hover:overflow-visible">
                                                    {data?.citation_rcsb_authors}
                                                </p>
                                            </div>
                                            <div className="flex justify-between">
                                                <strong>Year:</strong>
                                                <p>{data?.citation_year}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-between">
                                        {/* <Button variant="outline">Visualize</Button> */}
                                        <Button>Download</Button>
                                    </div>
                                </TabsContent>
                                <TabsContent value="components">

                                     <StructureComponents ligands={data.nonpolymeric_ligands} proteins={data.proteins} rnas={data.rnas}/>

                                </TabsContent>
                            </Tabs>
                            <div className="flex flex-col gap-4">
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            {/* <Button variant="outline">Log query</Button>
                            <Button></Button> */}
                        </CardFooter>
                    </Card>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={75}>
                    <div className="flex flex-col gap-4">
                        <MolstarNode ref={molstarNodeRef} />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>


        </div>
    )
}


