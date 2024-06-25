"use client"
import { CardTitle, CardHeader, CardContent, CardFooter, Card, CardDescription } from "@/components/ui/card"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
import { createContext, createRef, useEffect, useRef, useState } from "react";
import { ChainsByStruct, Polymer, PolymerByStruct, RibosomeStructure, useRoutersRouterStructStructureProfileQuery } from "@/store/ribxz_api/ribxz_api"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { useParams } from 'next/navigation'
import StructureSelection from "@/components/ribxz/chain_picker"
import { Filters } from "@/components/ribxz/filters"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button";
import { useRoutersRouterStructChainsByStructQuery } from '@/store/ribxz_api/ribxz_api'
import { Label } from "@/components/ui/label";
import { SidebarMenu } from "@/components/ribxz/sidebar_menu";
import { MolstarNode } from "@/components/mstar/lib";
import { MolstarRibxz } from "@/components/mstar/molstar_wrapper_class";
import { MolstarContext } from "@/components/ribxz/molstar_context";
import { superimpose_pop_chain, superimpose_select_pivot_chain } from "@/store/slices/molstar_state";

export default function Vis() {

    const { rcsb_id } = useParams<{ rcsb_id: string; }>()
    const dispatch = useAppDispatch();

    const molstarNodeRef = useRef<HTMLDivElement>(null);
    const [ctx, setCtx] = useState<MolstarRibxz | null>(null)
    useEffect(() => {
        (async () => {
            const x = new MolstarRibxz
            await x.init(molstarNodeRef.current!)
            setCtx(x)
        })()
    }, [])

    const { data, error, isLoading: isLoading_struct_data } = useRoutersRouterStructStructureProfileQuery({ rcsbId: rcsb_id })
    const [test_active, test_active_set] = useState<boolean>(false)

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <SidebarMenu />
            <ResizablePanelGroup direction="horizontal" className={"rounded-lg border " + (test_active ? 'bg-black' : 'bg-white')}  >
                <ResizablePanel defaultSize={25} >

                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <p> - select structure widget (search bar + icon)</p>
                            <p> - chain selector </p>
                            <p> - landmarks </p>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-auto space-y-8 items-center">
                                <Filters />
                            <MolstarContext.Provider value={ctx}>
                                <StructureSelection>
                                    <Button className=" min-w-full bg-black text-white hover:bg-gray-700  font-medium rounded-md text-sm p-2.5 text-center inline-flex items-center justify-center w-10 h-10">
                                    </Button>
                                </StructureSelection>
                            </MolstarContext.Provider>
                        </CardContent>
                        <CardFooter className="flex justify-between">
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


