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
import { useParams } from 'next/navigation'
import { transform } from "@/store/molstar/functions"
import ChainPicker from "@/components/chain_picker"
import FilterSidebar from "../structures/filters"

// StateTransforms
// https://github.com/molstar/molstar/issues/1074
// https://github.com/molstar/molstar/issues/1112
// https://github.com/molstar/molstar/issues/1121



// -----------
// -----------
function PlusIcon() {
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
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}

export default function StructurePage() {

    const { rcsb_id } = useParams<{ rcsb_id: string; }>()
    const molstarNodeRef = useRef<HTMLDivElement>(null);
    const dispatch = useAppDispatch();
    const ctx = useAppSelector(state => state.molstar.ui_plugin)!

    useEffect(() => { dispatch(initiatePluginUIContext({ parent_element: molstarNodeRef.current! })) }, [molstarNodeRef, dispatch])

    const { data, error, isLoading: isLoading_struct_data } = useRoutersRouterStructStructureProfileQuery({ rcsbId: rcsb_id })
    const [test_active, test_active_set] = useState<boolean>(false)

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className={"rounded-lg border " + (test_active ? 'bg-black' : 'bg-white')}  >
                <ResizablePanel defaultSize={25} >

                    <Card className="h-full flex flex-col">
                        <CardHeader>

                            <p className="text-gray-500 text-sm">Please select chains to superimpose by clicking the "+" button.</p>
                            <CardTitle>{data?.rcsb_id}</CardTitle>
                            <p className="text-gray-500 text-sm">{data?.citation_title}</p>
                        </CardHeader>

                        <CardContent className="flex-grow overflow-auto">
                            <div className="flex flex-col gap-4">
                                <FilterSidebar  disable={{'Search': true}}/>

                            </div>


                            <div className="grid gap-2">
                                <div key={1} className="border rounded-sm p-1 px-4 text font-bold">Chain 1</div>
                                <div key={2} className="border rounded-sm p-1 px-4 text font-bold">Chain 1</div>
                                <div key={3} className="border rounded-sm p-1 px-4 text font-bold">Chain 1</div>

                            </div>
                        </CardContent>

                        <ChainPicker />
                        <CardFooter className="flex justify-between">
                        </CardFooter>

                    </Card>
                    {/* <Separa */}
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


