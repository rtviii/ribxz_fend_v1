"use client"
import { CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
import { useEffect, useRef, useState } from "react";
import { Polymer, RibosomeStructure, ribxz_api, useRoutersRouterStructOverviewQuery, useRoutersRouterStructStructureProfileQuery } from "@/store/ribxz_api/ribxz_api"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { useParams } from 'next/navigation'
// import ChainPicker from "@/components/ribxz/chainPicker"
import { StructureFiltersComponent } from "@/components/filters/structure_filters_component"
import { Button } from "@/components/ui/button";
import { SidebarMenu } from "@/components/ribxz/sidebar_menu";
import { MolstarNode } from "@/components/mstar/lib";
import { MolstarRibxz } from "@/components/mstar/molstar_ribxz";
import { MolstarContext } from "@/components/mstar/molstar_context";
import { Structure } from "molstar/lib/mol-model/structure";
import { Select } from "antd";
import { GlobalStructureSelection } from "@/components/ribxz/ribxz_structure_selection";


const ChainSelection = ({ polymers }: { polymers: Polymer[] }) => {

    const [selectedItems, setSelectedItems] = useState<Polymer[]>([]);
    const filteredOptions: Polymer[] = polymers.filter((o) => !selectedItems.includes(o));

    return (
        <Select
            mode="multiple"
            placeholder="Inserted are removed"
            value={selectedItems}
            onChange={setSelectedItems}
            style={{ width: '100%' }}
            options={filteredOptions.map((item) => ({
                value: item.auth_asym_id,
                label: item.auth_asym_id,
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

    useEffect(() => {
        console.log("Fired off download struct");
        ctx?.upload_mmcif_structure("5afi")
    }, [ctx])

    const [rcsb_id, set_rcsb_id] = useState<string | null>(null)
    useEffect(() => {
        set_rcsb_id(rcsb_id_param)
    }, [rcsb_id_param])



    const [refetch_profile, _]           = ribxz_api.endpoints.routersRouterStructStructureProfile.useLazyQuery()
    const [test_active, test_active_set] = useState<boolean>(false)
    const [profile_data, setProfileData] = useState<RibosomeStructure | null>(null)


    useEffect(() => {
        if (rcsb_id == null) { return }
        (async () => {
            const data = await refetch_profile({ rcsbId: rcsb_id }).unwrap()
            setProfileData(data)
        })();


    }, [rcsb_id])





    const current_structures = useAppSelector(state => state.ui.data.current_structures)
    const { data: structs_overview, isLoading: structs_overview_Loading, isError: structs_overview_Error } = useRoutersRouterStructOverviewQuery()



    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden">
            <SidebarMenu />
            <ResizablePanelGroup direction="horizontal" className={"rounded-lg border " + (test_active ? 'bg-black' : 'bg-white')}  >
                <ResizablePanel defaultSize={25} >

                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <GlobalStructureSelection />
                            <Button onClick={() => {
                                ctx?.tunnel_geoemetry("someurl")
                            }}>Render PLY</Button>

                        </CardHeader>
                        <CardContent className="flex-grow overflow-auto space-y-8 items-center">
                            {/* <Filters /> */}
                            <MolstarContext.Provider value={ctx}>
                                {/* <ChainPicker> */}
                                <Button className=" min-w-full bg-black text-white hover:bg-gray-700  font-medium rounded-md text-sm p-2.5 text-center inline-flex items-center justify-center w-10 h-10">
                                </Button>
                                {/* </ChainPicker> */}
                            </MolstarContext.Provider>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                        </CardFooter>

                    </Card>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={75}>
                    <MolstarNode ref={molstarNodeRef} />
                </ResizablePanel>
            </ResizablePanelGroup>


        </div>
    )
}


