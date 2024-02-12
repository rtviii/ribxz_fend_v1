"use client"
import { CardTitle, CardHeader, CardContent, CardFooter, Card, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
import {  MolstarNode, MySpec, } from "@/molstar_lib/wip/basic_wrapper"
import { createRef, useEffect, useRef, useState } from "react";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { useGetStructureProfileQuery } from "@/store/structure/structure";
import { createPluginUI } from "molstar/lib/mol-plugin-ui";
import { Polymer, RibosomeStructure, ribxz_api, useRbxzBendApiStructureRouterStructureProfileQuery  } from "@/store/ribxz_api"
import { Skeleton } from "@/components/ui/skeleton"
// import { RibxzMolstar } from "@/molstar_lib/ribxz_molstar"


function PolymerItem({v}:{v:Polymer}){
                                return <TableRow key={v.auth_asym_id} className="space-x-1 space-y-0.5">
                                    <TableCell className="text-xs">{v.auth_asym_id}</TableCell>
                                    <TableCell className="text-xs">{v.entity_poly_seq_one_letter_code_can}</TableCell>
                                    <TableCell className="text-xs">{v.src_organism_ids}</TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <OptionIcon className="text-gray-500" />
                                        </div>
                                    </TableCell>
                                </TableRow> }

function ComponentsTableCard({structure_profile}:{structure_profile:RibosomeStructure}) {

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


export default function StructurePage() {

    const molstarNodeRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        (async () => {
                  window.molstar = await createPluginUI(molstarNodeRef.current as HTMLDivElement, MySpec);
            const data           = await window.molstar.builders.data.download({ url: "https://files.rcsb.org/download/3PTB.pdb" }, { state: { isGhost: true } });
            const trajectory     = await window.molstar.builders.structure.parseTrajectory(data, "pdb");
            await window.molstar.builders.structure.hierarchy.applyPreset(trajectory, "default");


            // const wrapper      = await BasicWrapper.init('molstar-wrapper')
            // const molstar_data = await  wrapper.plugin.builders.data.download({ url: "https://files.rcsb.org/download/3PTB.pdb" }, { state: { isGhost: true } });
            // const trajectory   = await wrapper.plugin.builders.structure.parseTrajectory(molstar_data, "pdb");
            // await wrapper.plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
        })()

        return () => {
            window.molstar?.dispose();
            window.molstar = undefined;
        };
    }, []);

    const {data, error, isLoading} = useRbxzBendApiStructureRouterStructureProfileQuery({rcsbId:"3j7z"})
    const [test_active, test_active_set] = useState<boolean>(false)

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className={ "rounded-lg border "+ (test_active ? 'bg-black' : 'bg-white') }  >
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
                                        <img alt={`${data?.rcsb_id}`} className="mb-4" height="200" src="/placeholder.svg" style={{ aspectRatio: "300/200", objectFit: "cover", }} width="300" />
                                        <div className="flex flex-col gap-4">
                                            <div className="flex justify-between">
                                                <strong>Species:</strong>
                                                <p className="overflow-ellipsis overflow-hidden hover:overflow-visible">
                                                    Pseudomonas aeruginosa PAO1
                                                </p>
                                            </div>
                                            <div className="flex justify-between">
                                                <strong>Resolution:</strong>
                                                <p>2.6 Å</p>
                                            </div>
                                            <div className="flex justify-between">
                                                <strong>Experimental Method:</strong>
                                                <p>ELECTRON MICROSCOPY</p>
                                            </div>
                                            <div className="flex justify-between">
                                                <strong>Authors:</strong>
                                                <p className="overflow-ellipsis overflow-hidden hover:overflow-visible">John Doe, Jane Smith</p>
                                            </div>
                                            <div className="flex justify-between">
                                                <strong>Year:</strong>
                                                <p>2022</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-between">

                                        <Button variant="outline">Visualize</Button>
                                        <Button>Download</Button>

                                    </div>

                                </TabsContent>

                                <TabsContent value="components">
                                    {isLoading ? <Skeleton/> : (data !== undefined ? <ComponentsTableCard structure_profile={data}/> : null)}

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


