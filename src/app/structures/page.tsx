"use client"
import { Input } from "@/components/ui/input"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CardContent, Card } from "@/components/ui/card"
import StructureCard from "./structure-card"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RibosomeStructure, useRoutersRouterStructListStructuresQuery } from "@/store/ribxz_api/ribxz_api"
import { useEffect } from "react"
import FilterSidebar from "./filters"
import { SheetDemo } from "@/components/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"




export default function StructureCatalogue() {
  const { data, isLoading }: { data: RibosomeStructure[], isLoading: boolean } = useRoutersRouterStructListStructuresQuery()
  return (
    <div className="max-w-screen max-h-screen min-h-screen p-4 flex flex-col flex-grow  outline ">
      <h1 className="text-2xl font-bold mb-6 " >Ribosome Structures</h1>

      <div className="grow"  >

        <div className="grid grid-cols-12 gap-4 min-h-[90vh]    ">

          <div className="col-span-3  flex flex-col min-h-full pr-4">
            <FilterSidebar />
            <SheetDemo />

            <div className="grow"> PAGINATION</div>

            <div className="flex justify-center space-x-2">
              <Button className="bg-[#eaeaea] text-xs">1</Button>
              <Button className="bg-[#eaeaea] text-xs">2</Button>
              <Button className="bg-[#eaeaea] text-xs">3</Button>
              <Button className="bg-[#eaeaea] text-xs">4</Button>
              <Button className="bg-[#eaeaea] text-xs">5</Button>
              <span>...</span>
              <Button className="bg-[#eaeaea] text-xs">56</Button>
              <Button className="bg-[#eaeaea] text-xs">{`>`}</Button>
            </div>
          </div>

          <div className="col-span-9 scrollbar-hidden">
            <ScrollArea className=" max-h-[90vh] overflow-y-scroll scrollbar-hidden" scrollHideDelay={1} >
            <div className=" gap-4 flex  flex-wrap  p-1 scrollbar-hidden"  >
              {isLoading === false ? data.slice(0, 18).map(struct => <StructureCard _={struct} key={struct.rcsb_id} />) : null}
            </div>
          </ScrollArea>
          </div>



        </div>
      </div>
    </div>
  )
}


