"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filters, Group, useDebounceFilters } from "@/components/ribxz/filters"
import { PaginationElement } from '@/components/ribxz/pagination_element'
import { SidebarMenu } from "@/components/ribxz/sidebar_menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/store"
import React from 'react';
import { Select } from 'antd';
import { PolymerClassOption, groupedOptions } from "@/components/ribxz/filters_protein_class_options"
import { pagination_set_page, set_current_polymer_class, set_current_polymers } from "@/store/slices/ui_state"
import { ribxz_api, useRoutersRouterStructPolymerClassesNomenclatureQuery, useRoutersRouterStructPolymersByPolymerClassQuery } from "@/store/ribxz_api/ribxz_api"
import PolymersTable from "@/components/ribxz/polymer_table"
import { TableRow } from "@/components/ui/table"
import { useSearchParams } from "next/navigation"
import { PolymerType } from "molstar/lib/mol-model/structure/model/types"



interface PolymerInputProps {
    isDisabled?: boolean
}

function PolymerInput(props: PolymerInputProps) {
    const [polymerClassOptions, setPolymerClassOptions] = useState<PolymerClassOption[]>([]);
    const dispatch = useAppDispatch();
    const current_polymer_class = useAppSelector((state) => state.ui.polymers.current_polymer_class)
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
            className="w-full max-h-82"
            showSearch={true}
            components={{ Group }}
            value={current_polymer_class as CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum}
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

    const dispatch = useAppDispatch();
    const onTabChange = (value: string) => { setTab(value); }
    const current_polymers = useAppSelector((state) => state.ui.data.current_polymers)
    //! -----------

    // const current_polymers = useAppSelector((state) => state.ui.data.current_polymers)

    const [triggerPolymersRefetch_byPolymerClass] = ribxz_api.endpoints.routersRouterStructPolymersByPolymerClass.useLazyQuery()
    const [triggerPolymersRefetch_byStructure ]   = ribxz_api.endpoints.routersRouterStructPolymersByStructure.useLazyQuery()

    const filter_state      = useAppSelector((state) => state.ui.filters)
    const debounced_filters = useDebounceFilters(filter_state, 250)

    const current_polymer_class = useAppSelector((state) => state.ui.polymers.current_polymer_class)
    const current_polymer_page  = useAppSelector((state) => state.ui.pagination.current_polymers_page)
    const pagination_poly       = useAppSelector((state) => state.ui.pagination)


    const searchParams = useSearchParams()
    const class_param = searchParams.get('class')

    useEffect(() => {
        if ( class_param != null) {
            dispatch(set_current_polymer_class(class_param as CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum  ))
        }
    }, [class_param, dispatch])


    useEffect(() => {
        if (tab == "by_polymer_class") {
            if (current_polymer_class != null) {
                triggerPolymersRefetch_byPolymerClass({ polymerClass: current_polymer_class, page: current_polymer_page })
            }
            else {
                dispatch(set_current_polymers([]))
            }
        }
        else if (tab == "by_structure") {
            triggerPolymersRefetch_byStructure({
                page          : current_polymer_page,
                year          : filter_state.year.map(x => x === null || x === 0 ? null : x.toString()).join(','),
                resolution    : filter_state.resolution.map(x => x === null || x === 0 ? null : x.toString()).join(','),
                hostTaxa      : filter_state.host_taxa.length == 0 ? ''                                                : filter_state.host_taxa.map(x => x === null ? null : x.toString()).join(','),
                sourceTaxa    : filter_state.source_taxa.length == 0 ? ''                                              : filter_state.source_taxa.map(x => x === null ? null : x.toString()).join(','),
                polymerClasses: filter_state.polymer_classes.length == 0 ? ''                                          : filter_state.polymer_classes.join(','),
                search        : filter_state.search === null ? ''                                                      : filter_state.search
            }).unwrap()
        }

    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab])

    useEffect(() => {
        dispatch(pagination_set_page({
            set_to_page: 1,
            slice_name: 'polymers'
        }))
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab])


    useEffect(() => {
        if (current_polymer_class != null) {
            triggerPolymersRefetch_byPolymerClass({ polymerClass: current_polymer_class, page: 1 })
        }
        else {
            dispatch(set_current_polymers([]))
        }

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current_polymer_class, current_polymer_page])


    useEffect(() => {
        if (current_polymer_class != null) {
            triggerPolymersRefetch_byPolymerClass({ polymerClass: current_polymer_class, page: current_polymer_page })
        }
        else {
            dispatch(set_current_polymers([]))
        }

        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ current_polymer_page])

    return (
        <div className="max-w-screen max-h-screen min-h-screen p-4 flex flex-col flex-grow  outline ">
            <h1 className="text-2xl font-bold mb-6 ">Polymers</h1>
            <div className="grow"  >
                <div className="grid grid-cols-12 gap-4 min-h-[90vh]    ">
                    <div className="col-span-3  flex flex-col min-h-full pr-4">
                        <PolymerInput isDisabled={tab == "by_structure"} />
                        <Filters disabled_whole={tab == "by_polymer_class"} />
                        <SidebarMenu />
                        <div className="p-1 my-4 rounded-md border w-full">
                            <PaginationElement slice_type={"polymers"} />
                        </div>
                    </div>
                    <div className="col-span-9 scrollbar-hidden">
                        <Tabs defaultValue="by_polymer_class" value={tab} onValueChange={onTabChange} className="w-full  max-h-[90vh] " >
                            <TabsList className="grid w-full grid-cols-2">
                                {/* TODO: Add tooltip what each means */}
                                <TabsTrigger className="w-full" value="by_polymer_class">By Polymer Class</TabsTrigger>
                                <TabsTrigger className="w-full" value="by_structure" >By Structure</TabsTrigger>
                            </TabsList>
                            <TabsContent value="by_polymer_class" >
                                <PolymersTable
                                    proteins={current_polymers.filter(p => p.entity_poly_polymer_type === 'Protein')}
                                    rnas={current_polymers.filter(p => p.entity_poly_polymer_type === 'RNA')} />
                            </TabsContent>
                            <TabsContent value="by_structure" >
                                <PolymersTable
                                    proteins={current_polymers.filter(p => p.entity_poly_polymer_type === 'Protein')}
                                    rnas={current_polymers.filter(p => p.entity_poly_polymer_type === 'RNA')} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>

    )
}