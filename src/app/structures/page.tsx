"use client"
import { Input } from "@/components/ui/input"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CardContent, Card } from "@/components/ui/card"
import StructureCard from "../../components/ribxz/structure_card"
import { useEffect, useState } from "react"
import {  Filters, useDebounceFilters } from "@/components/ribxz/filters"
import {PaginationElement} from '@/components/ribxz/pagination_element'
import { SidebarMenu } from "@/components/ribxz/sidebar_menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import { useAppSelector } from "@/store/store"
import { RibosomeStructure, ribxz_api, useRoutersRouterStructFilterListQuery } from "@/store/ribxz_api/ribxz_api"
import { pagination_set_page } from "@/store/slices/ui_state"



export default function StructureCatalogue() {
  const current_structures = useAppSelector((state) => state.ui.data.current_structures)

  // const [triggerStructuresRefetch ] = ribxz_api.endpoints.routersRouterStructFilterList.useLazyQuery()
  // const [triggerPolymersRefetch]    = ribxz_api.endpoints.routersRouterStructPolymersByStructure.useLazyQuery()
  // const struct_state                = useAppSelector((state) => state.ui.data)
  // const filters                     = useAppSelector(state => state.ui.filters)!
  // const debounced_filters           = useDebounceFilters(filters, 250)
  // const dispatch                    = useAppDispatch();


  // useEffect(() => {
  //   //? This garbage is needed to send a all filter params as one url string.
  //   //? If typed, rtk autogen infers the types as body args, which forces the django-ninja query to be a POST, which is, mildly, a pain in the a
  //   triggerStructuresRefetch({
  //     page          : 1,
  //     year          : filters.year.map(x => x === null || x === 0 ? null : x.toString()).join(','),
  //     resolution    : filters.resolution.map(x => x === null || x === 0 ? null : x.toString()).join(','),
  //     hostTaxa      : filters.host_taxa.length == 0 ? ''                                                : filters.host_taxa.map(x => x === null ? null : x.toString()).join(','),
  //     sourceTaxa    : filters.source_taxa.length == 0 ? ''                                              : filters.source_taxa.map(x => x === null ? null : x.toString()).join(','),
  //     polymerClasses: filters.polymer_classes.length == 0 ? ''                                          : filters.polymer_classes.join(','),
  //     search        : filters.search === null ? ''                                                      : filters.search
  //   }).unwrap()

  //   dispatch(pagination_set_page({
  //     set_to_page: 1,
  //     slice_name: 'structures'
  //   }))
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [debounced_filters]);



  return (
    <div className="max-w-screen max-h-screen min-h-screen p-4 flex flex-col flex-grow  outline ">
      {/* <HoverMenu /> */}
      <h1 className="text-2xl font-bold mb-6">Ribosome Structures</h1>
      <div className="grow"  >
        <div className="grid grid-cols-12 gap-4 min-h-[90vh]    ">
          <div className="col-span-3  flex flex-col min-h-full pr-4">
            <Filters />
            <SidebarMenu />
            <div className="p-1 my-4 rounded-md border w-full">
              <PaginationElement  slice_type={ "structures" }/>
            </div>
          </div>
          <div className="col-span-9 scrollbar-hidden">
            <ScrollArea className=" max-h-[90vh] overflow-y-scroll scrollbar-hidden" scrollHideDelay={1} >
              <div className=" gap-4 flex  flex-wrap  p-1 scrollbar-hidden"  >
                {current_structures.map((struct: RibosomeStructure) => <StructureCard _={struct} key={struct.rcsb_id} />)}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}


