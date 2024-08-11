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
import { useDebouncePagination } from "@/my_utils"



export default function StructureCatalogue() {
  const current_structures = useAppSelector((state) => state.ui.data.current_structures)

  const current_page = useAppSelector(state => state.ui.pagination.current_structures_page )
  // const total_pages = useAppSelector(state => {
  //   if (props.slice_type === 'polymers') { return state.ui.pagination.total_polymers_pages }
  //   else if (props.slice_type === 'structures') { return state.ui.pagination.total_structures_pages }
  // })!


  const debounced_page_state       = useDebouncePagination(current_page, 250)
  const [triggerStructuresRefetch] = ribxz_api.endpoints.routersRouterStructFilterList.useLazyQuery()
  const filter_state               = useAppSelector((state) => state.ui.filters)
  useEffect(() => {
      triggerStructuresRefetch({
        page: current_page,
        year: filter_state.year.map(x => x === null || x === 0 ? null : x.toString()).join(','),
        resolution: filter_state.resolution.map(x => x === null || x === 0 ? null : x.toString()).join(','),
        hostTaxa: filter_state.host_taxa.length == 0 ? '' : filter_state.host_taxa.map(x => x === null ? null : x.toString()).join(','),
        sourceTaxa: filter_state.source_taxa.length == 0 ? '' : filter_state.source_taxa.map(x => x === null ? null : x.toString()).join(','),
        polymerClasses: filter_state.polymer_classes.length == 0 ? '' : filter_state.polymer_classes.join(','),
        search: filter_state.search === null ? '' : filter_state.search,

      }).unwrap()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced_page_state])

  // TODO: this logic should be in the corresponding structure component (keep filters/pagination general)
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
              <div className=" gap-4 flex  flex-wrap   scrollbar-hidden"  >
                {current_structures.map((struct: RibosomeStructure) => <StructureCard _={struct} key={struct.rcsb_id} />)}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}



