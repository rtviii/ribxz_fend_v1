"use client"
import { CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
import { useEffect, useRef, useState } from "react";
import { Polymer, ribxz_api, useRoutersRouterStructOverviewQuery, useRoutersRouterStructStructureProfileQuery } from "@/store/ribxz_api/ribxz_api"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { useParams } from 'next/navigation'
import ChainPicker from "@/components/ribxz/chainPicker"
import { Filters } from "@/components/ribxz/filters"
import { Button } from "@/components/ui/button";
import { SidebarMenu } from "@/components/ribxz/sidebar_menu";
import { MolstarNode } from "@/components/mstar/lib";
import { MolstarRibxz } from "@/components/mstar/molstar_wrapper_class";
import { MolstarContext } from "@/components/ribxz/molstar_context";
import { Structure } from "molstar/lib/mol-model/structure";
import { Select } from "antd";


const ChainSelection = ({ polymers }: { polymers: Polymer[] }) => {

    console.log(polymers);

    const OPTIONS = ['Apples', 'Nails', 'Bananas', 'Helicopters'];
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const filteredOptions = OPTIONS.filter((o) => !selectedItems.includes(o));

    useEffect(() => {
        console.log(polymers);
    }, [polymers])

    return (
        <Select
            mode="multiple"
            placeholder="Inserted are removed"
            value={selectedItems}
            onChange={setSelectedItems}
            style={{ width: '100%' }}
            options={filteredOptions.map((item) => ({
                value: item,
                label: item,
            }))}
        />
    );

}

function StructureSelection() {
    // TODO: Reset filters when you get here.
}

export default function Vis() {

    const { rcsb_id: rcsb_id_param } = useParams<{ rcsb_id: string; }>()
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


    const [rcsb_id, set_rcsb_id] = useState<string | null>(null)
    useEffect(() => {
        set_rcsb_id(rcsb_id_param)
    }, [rcsb_id_param])

    const { data, error, isLoading: isLoading_struct_data } = useRoutersRouterStructStructureProfileQuery({ rcsbId: rcsb_id_param })
    const [refetch_profile, _] = ribxz_api.endpoints.routersRouterStructStructureProfile.useLazyQuery()
    const [test_active, test_active_set] = useState<boolean>(false)


    const current_structures = useAppSelector(state => state.ui.data.current_structures)
    const { data: structs_overview, isLoading: structs_overview_Loading, isError: structs_overview_Error } = useRoutersRouterStructOverviewQuery()



    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <SidebarMenu />
            <ResizablePanelGroup direction="horizontal" className={"rounded-lg border " + (test_active ? 'bg-black' : 'bg-white')}  >
                <ResizablePanel defaultSize={25} >

                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <Select
                                showSearch
                                placeholder="Select a person"
                                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                onChange={(value) => { set_rcsb_id(value['rcsb_id']); refetch_profile({ rcsbId: value['rcsb_id'] }) }}
                                options={structs_overview && structs_overview.map((d: any) => ({
                                    value: d['rcsb_id'],
                                    label: d['rcsb_id'],
                                }))}
                            />
                            <ChainSelection polymers={data ? [...data?.proteins, ...data?.rnas] as Polymer[] : []} />
                            {/* Chain selection tray -- choose multiple elemnts by polymer rows -- fetch the structure from model server */}
                            {/* create separate components for each selected chain */}


                            <p>TODO:</p>
                            <p> - chain selector </p>
                            <p> - landmarks for that structure </p>
                            <p> - "visualize" button </p>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-auto space-y-8 items-center">
                            {/* <Filters /> */}
                            <MolstarContext.Provider value={ctx}>
                                <ChainPicker>
                                    <Button className=" min-w-full bg-black text-white hover:bg-gray-700  font-medium rounded-md text-sm p-2.5 text-center inline-flex items-center justify-center w-10 h-10">
                                    </Button>
                                </ChainPicker>
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


