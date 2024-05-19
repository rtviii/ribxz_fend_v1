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
import StructureComponents from "./components_table"
import { transform } from "@/store/molstar/functions"
import { dynamicSuperpositionTest } from "@/store/molstar/dynamic_superpos"

// StateTransforms
// https://github.com/molstar/molstar/issues/1074
// https://github.com/molstar/molstar/issues/1112
// https://github.com/molstar/molstar/issues/1121



// -----------
// -----------

export default function StructurePage() {

    const {rcsb_id} = useParams<{ rcsb_id: string;}>()
    const molstarNodeRef = useRef<HTMLDivElement>(null);

        
    const dispatch       = useAppDispatch();
    const ctx            = useAppSelector(state => state.molstar.ui_plugin)!

    useEffect(()=>{ dispatch(initiatePluginUIContext(molstarNodeRef.current!)) },[molstarNodeRef, dispatch])

    const { data, error, isLoading:isLoading_struct_data }     = useRoutersRouterStructStructureProfileQuery({rcsbId:rcsb_id})
    const [test_active, test_active_set] = useState<boolean>(false)
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className={"rounded-lg border " + (test_active ? 'bg-black' : 'bg-white')}  >
            <Button onClick={()=>{ctx.clear()}}>clear ctx</Button>
            <Button onClick={()=>{dynamicSuperpositionTest(ctx, ['1tqn', '2hhb', '4hhb'], 'HEM');}}>dyanmic</Button>
                <ResizablePanel defaultSize={25} ></ResizablePanel>
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


