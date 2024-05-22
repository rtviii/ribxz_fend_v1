"use client"
import { Input } from "@/components/ui/input"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CardContent, Card } from "@/components/ui/card"
import StructureCard from "./structure-card"
import { useEffect } from "react"
import { StructuresPagination, FilterSidebar } from "./filters"
import { SidebarMenu } from "@/components/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useAppSelector } from "@/store/store"
import { useRoutersRouterStructFilterListMutation } from "@/store/ribxz_api/ribxz_api"

 
const useAutoRefetch = () => {

  const filters                                     = useAppSelector((state: RootState) => state.ui.filters)
  const [updateStructs, { data, isLoading, error }] = useRoutersRouterStructFilterListMutation();

  useEffect(() => {
    updateStructs({
      bodyParams: filters.bodyParams,
      search: filters.search,
    });
  }, [filters, updateStructs]);

  return { data, isLoading, error };
};







export default function StructureCatalogue() {






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
                {/* {isLoading === false ? data.slice(0, 18).map(struct => <StructureCard _={struct} key={struct.rcsb_id} />) : null} */}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}


