"use client"
import { CardTitle, CardHeader, CardContent, CardFooter, Card, CardDescription } from "@/components/ui/card"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
import { MolstarNode, } from "@/store/molstar/lib"
import { createRef, useEffect, useRef, useState } from "react";
import { ChainsByStruct, Polymer, PolymerByStruct, RibosomeStructure, useRoutersRouterStructStructureProfileQuery } from "@/store/ribxz_api/ribxz_api"
import { initiatePluginUIContext, download_struct } from "@/store/slices/molstar_state"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { useParams } from 'next/navigation'
import ChainPicker from "@/components/chain_picker"
import FilterSidebar from "../structures/filters"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button";
import { useRoutersRouterStructChainsByStructQuery } from '@/store/ribxz_api/ribxz_api'

function PlusIcon() {
    return (
        <svg
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

    const { rcsb_id }               = useParams<{ rcsb_id: string; }>()
    const molstarNodeRef            = useRef<HTMLDivElement>(null);
    const dispatch                  = useAppDispatch();
    const ctx                       = useAppSelector(state => state.molstar.ui_plugin)!
    const active_superimpose_chains = useAppSelector(state => state.molstar.superimpose.active_chains)!

    const { data:chains_by_struct, isLoading:isLoading_chains_by_struct }:{chains_by_struct:ChainsByStruct[], isLoading_chains_by_struct:boolean} = useRoutersRouterStructChainsByStructQuery()

    
    
    useEffect(() => { dispatch(initiatePluginUIContext({ parent_element: molstarNodeRef.current! })) }, [molstarNodeRef, dispatch])
    useEffect(() => {console.log(chains_by_struct)}, [chains_by_struct]);

    const { data, error, isLoading: isLoading_struct_data } = useRoutersRouterStructStructureProfileQuery({ rcsbId: rcsb_id })
    const [test_active, test_active_set] = useState<boolean>(false)

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className={"rounded-lg border " + (test_active ? 'bg-black' : 'bg-white')}  >
                <ResizablePanel defaultSize={25} >

                    <Card className="h-full flex flex-col">
                        <CardHeader>

                            <CardTitle>{data?.rcsb_id}</CardTitle>
                            <p className="text-gray-500 text-sm">{data?.citation_title}</p>
                        </CardHeader>

                        <CardContent className="flex-grow overflow-auto space-y-8 items-center">
                            <div className="flex flex-col gap-4">
                                <FilterSidebar disable={{ 'Search': true, Sort: true, PolymerClass: true }} />
                            </div>


                            <Separator className="my-4" />
                            <p className="text-gray-500 p-1">Please select chains to superimpose from the "+" menu</p>
                            <ChainPicker  chains_by_struct={isLoading_chains_by_struct ?  [] :chains_by_struct}>
                                <Button className=" min-w-full bg-black text-white hover:bg-gray-700  font-medium rounded-md text-sm p-2.5 text-center inline-flex items-center justify-center w-10 h-10">
                                    <PlusIcon className="text-white" />
                                </Button>
                            </ChainPicker>

                            <div className="flex flex-col gap-2">
                            {active_superimpose_chains.map((chain:PolymerByStruct)=><span className="border " key={chain.auth_asym_id}>{chain.auth_asym_id}</span>)}
                            </div>

                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button className="min-w-full group gap-2 text-white flex-col flex hover:bg-gray-800 focus:outline-none  font-medium rounded-md text-sm  text-center  items-center justify-center w-10 h-24">
                                <p className="font-bold">Superimpose</p>
                                <div className="grid grid-cols-3 gap-8 group-hover:gap-0 transition-all duration-200 ease-in-out  w-30">
                                    <div className="w-6 h-6 bg-blue-500     rounded-sm transition-transform duration-300 ease-in-out transform group-hover:translate-x-4  group-hover:skew-y-12 group-hover:skew-x-12 group-hover:translate-y-2" />
                                    <div className="w-6 h-6 bg-red-500      rounded-sm transition-transform duration-300 ease-in-out transform group-hover:translate-x-0  group-hover:skew-y-12 group-hover:skew-x-12 group-hover:translate-y-2 " />
                                    <div className="w-6 h-6 bg-yellow-500   rounded-sm transition-transform duration-300 ease-in-out transform group-hover:-translate-x-4 group-hover:skew-y-12 group-hover:skew-x-12 group-hover:translate-y-2 " />
                                </div>
                            </Button>
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


