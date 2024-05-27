"use client"
import { CardTitle, CardHeader, CardContent, CardFooter, Card, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
import { MolstarNode, } from "@/store/molstar/lib"
import { Skeleton } from "@/components/ui/skeleton"
import { RibosomeStructure, useRoutersRouterStructStructureProfileQuery } from "@/store/ribxz_api/ribxz_api"
import { initiatePluginUIContext, download_struct } from "@/store/slices/molstar_state"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { useParams } from 'next/navigation'
import StructureComponents from "./components_table"
import { create_ligand, transform } from "@/store/molstar/functions"
import { useEffect, useRef, useState } from "react"
import { SidebarMenu } from "@/components/sidebar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

// StateTransforms
// https://github.com/molstar/molstar/issues/1074
// https://github.com/molstar/molstar/issues/1112
// https://github.com/molstar/molstar/issues/1121

// -----------
// -----------

export default function StructurePage() {

    const { rcsb_id } = useParams<{ rcsb_id: string; }>()
    const molstarNodeRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    const { data, isLoading, error } = useRoutersRouterStructStructureProfileQuery({ rcsbId: rcsb_id })

    const ctx = useAppSelector(state => state.molstar.ui_plugin)
    useEffect(() => {
        dispatch(initiatePluginUIContext({
            parent_element: molstarNodeRef.current!, initiate_with_structure: rcsb_id
        }))
    }, [molstarNodeRef, dispatch])

    useEffect(() => {
        console.log(data);
    }, [data])

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            {/* <Button onClick={() => { structure_sel(ctx!,'1')   }}>structure func</Button> */}
            <Button onClick={() => { create_ligand(ctx!, 'ERY') }}>lignad func</Button>
            <ResizablePanelGroup direction="horizontal" className="rounded-lg border ">
                <ResizablePanel defaultSize={25} >
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
                                                    {data?.src_organism_names[0]}
                                                </p>
                                            </div>
                                            {
                                                data?.host_organism_names.length < 1 ?
                                                    null :
                                                    <div className="flex justify-between">
                                                        <strong>Host Organism:</strong>
                                                        <p className="overflow-ellipsis overflow-hidden hover:overflow-visible">
                                                            {data?.host_organism_names[0]}

                                                        </p>
                                                    </div>
                                            }
                                            <div className="flex justify-between">
                                                <strong>Resolution:</strong>
                                                <p>{data?.resolution} Å</p>
                                            </div>
                                            <div className="flex justify-between">
                                                <strong>Experimental Method:</strong>
                                                <p>{data?.expMethod}</p>
                                            </div>
                                            {data?.citation_rcsb_authors ? null :
                                                <div className="relative flex justify-between items-center mt-1">
                                                    <strong>Authors:</strong>
                                                    <HoverCard>
                                                        <HoverCardTrigger asChild>
                                                            <span className="group-hover:bg-gray-100 dark:group-hover:bg-gray-800 rounded-md px-2 py-1 transition-colors z-10" title="Full list of authors" >

                                                                <span style={{ fontStyle: "italic" }}>{data?.citation_rcsb_authors[0]}</span>
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
                                                </div>
                                            }
                                            <div className="flex justify-between">
                                                <strong>Year:</strong>
                                                <p>{data?.citation_year}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-between">
                                    </div>
                                </TabsContent>
                                <TabsContent value="components">
                                    {!isLoading ? <StructureComponents ligands={data.nonpolymeric_ligands} proteins={data.proteins} rnas={data.rnas} /> : null}
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


            <SidebarMenu />
        </div>
    )
}


