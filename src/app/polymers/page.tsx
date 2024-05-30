"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HoverMenu } from "../structures/page"
import { Filters, Group, StructuresPagination } from "@/components/ribxz/filters"
import { SidebarMenu } from "@/components/ribxz/sidebar_menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/store"
import React from 'react';
import { Select } from 'antd';
import { PolymerClassOption, groupedOptions } from "@/components/ribxz/filters_protein_class_options"
import { set_current_polymer_class } from "@/store/slices/ui_state"
import { useRoutersRouterStructPolymerClassesNomenclatureQuery } from "@/store/ribxz_api/ribxz_api"
import PolymersTable from "@/components/ribxz/polymer_table"



interface PolymerInputProps {
    isDisabled?: boolean
}


function PolymerInput(props: PolymerInputProps) {

    const [polymerClassOptions, setPolymerClassOptions] = useState<PolymerClassOption[]>([]);
    const dispatch = useAppDispatch();
    const { data: nomenclature_classes, isLoading: nomenclature_classes_is_loading } = useRoutersRouterStructPolymerClassesNomenclatureQuery();
    useEffect(() => {
        if (!nomenclature_classes_is_loading) {
            setPolymerClassOptions(groupedOptions(nomenclature_classes))
        }
    }, [nomenclature_classes, nomenclature_classes_is_loading]);

    return <div className="flex flex-col items-center border rounded-sm pb-2 pr-2 pl-2 pt-2 mb-4">
        <Label htmlFor="input" className={`font-bold text-md mb-2   ${props.isDisabled ? "disabled-text" : ""} `}> Polymer Class</Label>
        <Select<PolymerClassOption >
            defaultValue={null}
            className="w-full max-h-64"
            components={{ Group }}
            options={polymerClassOptions}
            onChange={(value) => {
                dispatch(set_current_polymer_class(value))
            }}
            disabled={props.isDisabled}
        />

    </div>
}

export default function PolymersPage() {
    const [tab, setTab] = useState("by_polymer_class");
    const onTabChange = (value: string) => { setTab(value); }

    const current_polymers = useAppSelector((state) => state.ui.data.current_polymers)

    return (
        // This needs two tabs "by structure" and "by polymer Class"
        <div className="max-w-screen max-h-screen min-h-screen p-4 flex flex-col flex-grow  outline ">
            <HoverMenu />
            <h1 className="text-2xl font-bold mb-6 ">Polymers</h1>
            <div className="grow"  >
                <div className="grid grid-cols-12 gap-4 min-h-[90vh]    ">
                    <div className="col-span-3  flex flex-col min-h-full pr-4">
                        <PolymerInput isDisabled={tab == "by_structure"} />
                        <Filters disabled_whole={tab == "by_polymer_class"} />
                        <SidebarMenu />
                        <div className="p-1 my-4 rounded-md border w-full">
                            <StructuresPagination />
                        </div>
                    </div>
                    <div className="col-span-9 scrollbar-hidden">
                        <ScrollArea className=" max-h-[90vh] overflow-y-scroll scrollbar-hidden" scrollHideDelay={1} >
                            <div className=" gap-4 flex  flex-wrap  p-1 scrollbar-hidden"  >
                                <Tabs defaultValue="by_polymer_class" value={tab} onValueChange={onTabChange}>
                                    <TabsList className="grid w-full grid-cols-2">

                                        {/* TODO: Add tooltip what each means */}
                                        <TabsTrigger className="w-full" value="by_polymer_class">By Polymer Class</TabsTrigger>
                                        <TabsTrigger className="w-full" value="by_structure" >By Structure</TabsTrigger>

                                    </TabsList>

                                    <TabsContent value="by_polymer_class">
                                        <PolymersTable 
                                        proteins={current_polymers.filter(p => p.entity_poly_polymer_type ==='Protein')} 
                                        rnas={current_polymers.filter(p=>p.entity_poly_polymer_type === 'RNA')}/>
                                    </TabsContent>
                                    <TabsContent value="by_structure">
                                        <PolymersTable 
                                        proteins={current_polymers.filter(p => p.entity_poly_polymer_type ==='Protein')} 
                                        rnas={current_polymers.filter(p=>p.entity_poly_polymer_type === 'RNA')}/>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>

    )
}