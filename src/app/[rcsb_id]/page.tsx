"use client"
import { CardTitle, CardHeader, CardContent, CardFooter, Card, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
import { useRouter } from 'next/router'
import { MolstarNode, } from "@/store/molstar/lib"
import { createRef, useEffect, useRef, useState } from "react";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { Skeleton } from "@/components/ui/skeleton"
import { Polymer, RibosomeStructure, useRoutersRouterStructStructureProfileQuery } from "@/store/ribxz_api/ribxz_api"
import { initiatePluginUIContext, download_struct } from "@/store/slices/molstar_state"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18';
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms"
import { DefaultPluginUISpec, PluginUISpec } from "molstar/lib/mol-plugin-ui/spec"
import { PluginConfig } from "molstar/lib/mol-plugin/config"
import { highlightChain, removeHighlight, select_current_struct } from "@/store/molstar/functions"
import { useParams } from 'next/navigation'
import StructureComponents from "./components_table"

// StateTransforms
// https://github.com/molstar/molstar/issues/1074
// https://github.com/molstar/molstar/issues/1112
// https://github.com/molstar/molstar/issues/1121

function PolymerItem({ v }: { v: Polymer }) {
    return <TableRow key={v.auth_asym_id} className="space-x-1 space-y-0.5">
        <TableCell className="text-xs">{v.auth_asym_id}</TableCell>
        <TableCell className="text-xs">{v.entity_poly_seq_one_letter_code_can}</TableCell>
        <TableCell className="text-xs">{v.src_organism_ids}</TableCell>
        <TableCell>
            <div className="flex space-x-2">
                <OptionIcon className="text-gray-500" />
            </div>
        </TableCell>
    </TableRow>
}

function ComponentsTableCard({ structure_profile }: { structure_profile: RibosomeStructure }) {

    return (
        <Card className="w-full max-w-screen">
            <CardContent>
                <div className="flex justify-between w-full items-center py-2">
                    <div className="flex space-x-2">
                        <Input className="block w-56 text-sm" placeholder="Filter proteins..." />
                        <Select>
                            <SelectTrigger id="columns">
                                <SelectValue placeholder="Columns" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectItem value="chainId">Chain ID</SelectItem>
                                <SelectItem value="sequenceLength">Sequence Length</SelectItem>
                                <SelectItem value="organism">Organism</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-auto w-full h-full">
                    <Table>
                        <TableHeader>
                            <TableRow className="space-x-1 space-y-0.5">
                                <TableHead className="text-xs">Chain ID</TableHead>
                                <TableHead className="text-xs">Sequence Length</TableHead>
                                <TableHead className="text-xs">Organism</TableHead>
                                <TableHead className="text-xs" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {structure_profile.proteins.map(v => <PolymerItem v={v} key={v.auth_asym_id} />)}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

function OptionIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 3h6l6 18h6" />
            <path d="M14 3h7" />
        </svg>
    )
}


// -----------
// -----------

export default function StructurePage() {

    const {rcsb_id} = useParams<{ rcsb_id: string;}>()
    const molstarNodeRef = useRef<HTMLDivElement>(null);

        
    const dispatch       = useAppDispatch();
    const ctx            = useAppSelector(state => state.molstar.ui_plugin)

    useEffect(()=>{ dispatch(initiatePluginUIContext(molstarNodeRef.current!)) },[molstarNodeRef, dispatch])

    const { data, error, isLoading:isLoading_struct_data }     = useRoutersRouterStructStructureProfileQuery({rcsbId:rcsb_id})
    const [test_active, test_active_set] = useState<boolean>(false)
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className={"rounded-lg border " + (test_active ? 'bg-black' : 'bg-white')}  >
                <ResizablePanel defaultSize={25} >

                {/* <Button onClick={()=>{dispatch(download_struct({plugin:ctx!, rcsb_id}))}}>downlado</Button> */}
                {/* <Button onClick={()=>{select_current_struct(ctx)}} > select current</Button> */}

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
                                        <Button variant="outline">Visualize</Button>
                                        <Button>Download</Button>
                                    </div>
                                </TabsContent>
                                <TabsContent value="components">

                                    {isLoading_struct_data ? <Skeleton /> : (data !== undefined ? 
                                    // <ComponentsTableCard structure_profile={data} /> 
                                    <StructureComponents ligands={data.nonpolymeric_ligands} proteins={data.proteins} rnas={data.rnas}/>
                                    : null)}

                                </TabsContent>
                            </Tabs>
                            <div className="flex flex-col gap-4">
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline">Log query</Button>
                            <Button></Button>
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


