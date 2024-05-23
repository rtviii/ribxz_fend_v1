"use client"
import { Input } from "@/components/ui/input"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CardContent, Card } from "@/components/ui/card"
import StructureCard from "./structure-card"
import { useEffect, useState } from "react"
import { StructuresPagination, FilterSidebar } from "./filters"
import { SidebarMenu } from "@/components/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store/store';
import { useAppSelector } from "@/store/store"
import { RibosomeStructure, ribxz_api, useRoutersRouterStructFilterListQuery } from "@/store/ribxz_api/ribxz_api"
import { Filters } from "@/store/slices/ui_state"



function useDebounce(value: Partial<Filters>, delay: number): Partial<Filters> {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


export const LoadingSpinner = () => {
  <svg
      xmlns          = "http://www.w3.org/2000/svg"
      width          = "24"
      height         = "24"
      viewBox        = "0 0 24 24"
      fill           = "none"
      stroke         = "currentColor"
      strokeWidth    = "2"
      strokeLinecap  = "round"
      strokeLinejoin = "round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
}


export default function StructureCatalogue() {
  const [triggerRefetch, { data, error }] = ribxz_api.endpoints.routersRouterStructFilterList.useLazyQuery()

  // const { data, isLoading, error } = useAutoRefetch();
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.ui.filters)
  const debounced_filters = useDebounce(filters, 250)

  useEffect(() => {
    //? This garbage is needed to send a all filter params as one url string. If typed, rtk autogen infers the types as body args, which forces the query to be a POST, which is, mildly, a pain in the
    console.log("New filters:");
    console.log({...debounced_filters});
    
    triggerRefetch({
      year          : filters.year.map(x => x === null || x === 0? null : x.toString()).join(','),
      resolution    : filters.resolution.map(x => x === null || x === 0 ? null : x.toString()).join(','),
      hostTaxa      : filters.host_taxa.length == 0 ? ''                                     : filters.host_taxa.map(x => x === null ? null : x.toString()).join(','),
      sourceTaxa    : filters.source_taxa.length == 0 ? ''                                   : filters.source_taxa.map(x => x === null ? null : x.toString()).join(','),
      polymerClasses: filters.polymer_classes.length == 0 ? ''                               : filters.polymer_classes.join(','),
      search        : filters.search === null ? ''                                           : filters.search
    })
  }, [debounced_filters]);

  return (
    <div className="max-w-screen max-h-screen min-h-screen p-4 flex flex-col flex-grow  outline ">
      <h1 className="text-2xl font-bold mb-6 " >Ribosome Structures</h1>
      <div className="grow"  >

        <div className="grid grid-cols-12 gap-4 min-h-[90vh]    ">
          <div className="col-span-3  flex flex-col min-h-full pr-4">
            <FilterSidebar />
            <SidebarMenu />
            <div className="p-1 my-4 rounded-md border w-full">
              <StructuresPagination />
            </div>
          </div>
          <div className="col-span-9 scrollbar-hidden">

            <ScrollArea className=" max-h-[90vh] overflow-y-scroll scrollbar-hidden" scrollHideDelay={1} >
              <div className=" gap-4 flex  flex-wrap  p-1 scrollbar-hidden"  >
                {data === undefined ?  null : data['structures'].map(( struct:RibosomeStructure ) => <StructureCard   _={struct} key={struct.rcsb_id} />) }
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}


