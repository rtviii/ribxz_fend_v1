"use client"
import { Input } from "@/components/ui/input"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CardContent, Card } from "@/components/ui/card"
import StructureCard from "@/components/ribxz/structure-card"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RibosomeStructure, useRoutersRouterStructListStructuresQuery } from "@/store/ribxz_api/ribxz_api"
import { useEffect } from "react"
import FilterSidebar from "./filters"





export default function StructureCatalogue() {

  const { data, isLoading } = useRoutersRouterStructListStructuresQuery()

  return (
    <div className="container mx-auto my-8 p-4">

      <h1 className="text-4xl font-bold mb-6" >Ribosome Structures</h1>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-3  border-gray-200 pr-4">
          <FilterSidebar />


        </div>

        <div className="col-span-9 pl-4">
          <div className="grid grid-cols-3 gap-2 mb-6">

            {isLoading === false ? data.map(struct => <StructureCard _={struct} key={struct.rcsb_id} />) : null}

          </div>
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
      </div>
    </div>
  )
}


