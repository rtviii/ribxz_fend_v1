"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HoverMenu } from "../structures/page"
import { Filters, Group, StructuresPagination } from "@/components/ribxz/filters"
import { SidebarMenu } from "@/components/ribxz/sidebar_menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/store"
import React from 'react';
import { Select } from 'antd';
import { PolymerClassOption, groupedOptions } from "@/components/ribxz/filters_protein_class_options"
import { set_current_polymer_class } from "@/store/slices/ui_state"
import { useRoutersRouterStructPolymerClassesNomenclatureQuery } from "@/store/ribxz_api/ribxz_api"




function PolymerInput() {

  const [polymerClassOptions, setPolymerClassOptions] = useState<PolymerClassOption[]>([]);
  const dispatch          = useAppDispatch();
  const { data: nomenclature_classes, isLoading: nomenclature_classes_is_loading } = useRoutersRouterStructPolymerClassesNomenclatureQuery();
  useEffect(() => {
    if (!nomenclature_classes_is_loading) {
      setPolymerClassOptions(groupedOptions(nomenclature_classes))
    }
  }, [nomenclature_classes, nomenclature_classes_is_loading]);


    const handleChange = (value: string) => {
        console.log(`selected ${value}`);
    };
    return <div className="flex flex-col items-center border rounded-sm pb-2 pr-2 pl-2 pt-2 mb-4">
        <Label htmlFor="input" className="font-bold text-md mb-2   "> Polymer Class</Label>
      <Select<PolymerClassOption>
            defaultValue=""
            className="w-full"
            onChange={handleChange}
            components={{ Group }}
            instanceId={"current_polymer_class"}
            options={polymerClassOptions}
            onChange={(value) => { dispatch(set_current_polymer_class(value.value)) }}
        />

        </div>
}

export default function PolymersPage() {
    const [tab, setTab] = useState("by_polymer_class");
    const onTabChange = (value: string) => { setTab(value); }

    const current_polymers = useAppSelector((state) => state.ui.data.current_polymers)

    useEffect(() => {
        console.log("Got polymers");
        console.log(current_polymers);
    }, [current_polymers])

    return (
        // This needs two tabs "by structure" and "by polymer Class"
        <div className="max-w-screen max-h-screen min-h-screen p-4 flex flex-col flex-grow  outline ">
            <HoverMenu />
            <h1 className="text-2xl font-bold mb-6 ">Polymers</h1>
            <div className="grow"  >
                <div className="grid grid-cols-12 gap-4 min-h-[90vh]    ">
                    <div className="col-span-3  flex flex-col min-h-full pr-4">
                        <PolymerInput />
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
                                        components by  polymer class
                                    </TabsContent>
                                    <TabsContent value="by_structure">
                                        components by structrre
                                    </TabsContent>
                                </Tabs>

                                {/* <PolymerTableRow/> */}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>

    )
}