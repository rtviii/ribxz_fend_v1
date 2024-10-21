'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StructureFiltersComponent, Group, useDebounceFilters } from "@/components/ribxz/structure_filters"
// import { PaginationElement } from '@/components/ribxz/pagination_element'
import { SidebarMenu } from "@/components/ribxz/sidebar_menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Suspense, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/store"
import React from 'react';
import { Select } from 'antd';
import { PolymerClassOption, groupedOptions } from "@/components/ribxz/filters_protein_class_options"
import { Protein, Rna, ribxz_api, useRoutersRouterStructPolymerClassesNomenclatureQuery, useRoutersRouterStructPolymersByPolymerClassQuery } from "@/store/ribxz_api/ribxz_api"
import PolymersTable from "@/components/ribxz/polymer_table"
import { useSearchParams } from "next/navigation"
import PolymerFiltersComponent from "@/components/ribxz/polymers_filters"



interface PolymerInputProps {
    isDisabled?: boolean
}

function PolymerInput(props: PolymerInputProps) {
    const [polymerClassOptions, setPolymerClassOptions] = useState<any>([]);
    const dispatch = useAppDispatch();
    const current_polymer_class = useAppSelector((state) => state.polymers_page.filters.current_polymer_class)
    const { data: nomenclature_classes, isLoading: nomenclature_classes_is_loading } = useRoutersRouterStructPolymerClassesNomenclatureQuery();
    useEffect(() => { if (nomenclature_classes !== undefined) { setPolymerClassOptions(groupedOptions(nomenclature_classes)) } }, [nomenclature_classes, nomenclature_classes_is_loading]);



    return <div className="flex flex-col items-center border rounded-sm pb-2 pr-2 pl-2 pt-2 mb-4">
        <Label htmlFor="input" className={`font-bold text-md mb-2   ${props.isDisabled ? "disabled-text" : ""} `}> Polymer Class</Label>
        <Select
            className="w-full max-h-82"
            showSearch={true}
            value={current_polymer_class}
            options={polymerClassOptions}
            onChange={(value) => {
                // dispatch(set_current_polymer_class(value))
            }}
            disabled={props.isDisabled}
        />

    </div>
}

export default function PolymersPage() {
    const [tab, setTab] = useState("by_polymer_class");
    const dispatch = useAppDispatch();
    const onTabChange = (value: string) => { setTab(value); }
    const current_polymers = useAppSelector((state) => state.polymers_page.current_polymers)

    // const [triggerPolymersRefetch_byPolymerClass] = ribxz_api.endpoints.routersRouterStructPolymersByPolymerClass.useLazyQuery()
    // const [triggerPolymersRefetch_byStructure]    = ribxz_api.endpoints.routersRouterStructPolymersByStructure.useLazyQuery()

    const filter_state = useAppSelector((state) => state.polymers_page.filters)
    const debounced_filters = useDebounceFilters(filter_state, 250)

    // const current_polymer_class = useAppSelector((state) => state.ui.polymers.current_polymer_class)
    // const current_polymer_page  = useAppSelector((state) => state.ui.pagination.current_polymers_page)

    const searchParams = useSearchParams()
    const class_param = searchParams.get('class')



    return (
        <Suspense fallback={<div>suspense</div>}>
            <div className="max-w-screen max-h-screen min-h-screen p-4 flex flex-col flex-grow  outline ">
                <h1 className="text-2xl font-bold mb-6 ">Polymers</h1>
                <div className="grow"  >
                    <div className="grid grid-cols-12 gap-4 min-h-[90vh]    ">
                        <div className="col-span-3  flex flex-col min-h-full pr-4 space-y-4">
                            <StructureFiltersComponent />
                            <PolymerFiltersComponent />
                            <SidebarMenu />
                        </div>
                        <div className="col-span-9 scrollbar-hidden">
                            <PolymersTable polymers={current_polymers} />
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    )
}
export const dynamic = 'force-dynamic'