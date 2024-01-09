"use client"
import { CardTitle, CardHeader, CardContent, CardFooter, Card, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
import { BasicWrapper, MolstarNode, MySpec, } from "@/molstar_lib/molstar_plugin"
import { createRef, useEffect, useRef, useState } from "react";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { useGetStructureProfileQuery } from "@/state/structure/structure";
import { RibosomeStructure } from "@/ribosome_types";
import { select_multiple } from "@/molstar_lib/functions";
import { createPluginUI } from "molstar/lib/mol-plugin-ui";


function ComponentsTableCard() {
    return (
        <Card className="w-full max-w-screen-md mx-auto">
            <CardContent>
                <div className="flex justify-between items-center py-2">
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
                <div className="overflow-auto h-[500px]">
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
                            <TableRow className="space-x-1 space-y-0.5">
                                <TableCell className="text-xs">J</TableCell>
                                <TableCell className="text-xs">240</TableCell>
                                <TableCell className="text-xs">E.coli</TableCell>
                                <TableCell>
                                    <div className="flex space-x-2">
                                        <OptionIcon className="text-gray-500" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

function OptionIcon(props:any) {
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
        const data           = await window.molstar.builders.data.download( { url: "https://files.rcsb.org/download/3PTB.pdb" },  { state: { isGhost: true } } );
        const trajectory     = await window.molstar.builders.structure.parseTrajectory(data, "pdb");
        await window.molstar.builders.structure.hierarchy.applyPreset( trajectory, "default" );
    })()

    return () => {
      window.molstar?.dispose();
      window.molstar = undefined;
    };
  }, []);

  const { data, error, isLoading } = useGetStructureProfileQuery('3j7z')

    return (


         <div className="flex flex-col h-screen w-screen overflow-hidden">
            <ResizablePanelGroup
                direction="horizontal"
                className=" rounded-lg border"
            >

                <ResizablePanel defaultSize={50}>


                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>7UNW Pseudomonas aeruginosa PAO1</CardTitle>
                            <p className="text-gray-500 text-sm">
                                Compact IF2 allows initiator tRNA accommodation into the P site and gates the ribosome to elongation
                            </p>
                        </CardHeader>

                        <CardContent className="flex-grow overflow-auto">
                            <Tabs defaultValue="account" >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="info">Info</TabsTrigger>
                                    <TabsTrigger value="components">Substructures</TabsTrigger>
                                </TabsList>

                                <TabsContent value="info">


                                    <div className="mt-4">
                                        <img
                                            alt="Biomolecule 123"
                                            className="mb-4"
                                            height="200"
                                            src="/placeholder.svg"
                                            style={{
                                                aspectRatio: "300/200",
                                                objectFit: "cover",
                                            }}
                                            width="300"
                                        />
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
                                    <ComponentsTableCard />
                                </TabsContent>

                            </Tabs>
                            <div className="flex flex-col gap-4">



                            </div>
                        </CardContent>

                        {/* <CardFooter className="flex justify-between">
                            <Button variant="outline">Visualize</Button>
                            <Button>Download</Button>
                        </CardFooter> */}
                    </Card>

                </ResizablePanel>
                <ResizableHandle />

                <ResizablePanel defaultSize={50}>

                    <div className="flex flex-col gap-4">

              <MolstarNode ref={molstarNodeRef} />
                    </div>

                </ResizablePanel>

            </ResizablePanelGroup>


</div>
        // <div className="flex flex-col h-screen overflow-hidden">

        //     <div className="flex flex-col md:flex-row h-full">
        //         <div className="md:w-1/3 h-full flex-resize">
        //         </div>





        //          <div className="md:w-2/3 h-full">
        //             <div className="w-full h-full bg-gray-200">

        //                 <div className="flex flex-col gap-4">
        //                     molstar

        //                     <div />
        //                 </div>
        //             </div>
        //         </div> 
        //     </div>
        // </div>
    )
}


