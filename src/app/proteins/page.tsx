"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { create_ligand, create_ligand_surroundings, highlightChain, removeHighlight, selectChain } from "@/store/molstar/functions"
import { NonpolymericLigand, Polymer, Protein } from "@/store/ribxz_api/ribxz_api"
import { useAppSelector } from "@/store/store"
import Link from "next/link"
import { HoverMenu } from "../structures/page"
import { FilterSidebar, StructuresPagination } from "../structures/filters"
import { SidebarMenu } from "@/components/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"


export default function StructureComponents({ proteins, ligands, rnas }: { proteins: Protein[], ligands: NonpolymericLigand[], rnas: Polymer[] }) {
    return (
    <div className="max-w-screen max-h-screen min-h-screen p-4 flex flex-col flex-grow  outline ">
      <HoverMenu />
      <h1 className="text-2xl font-bold mb-6 " >Proteins</h1>
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
                {/* {current_structures.map((struct: RibosomeStructure) => <StructureCard _={struct} key={struct.rcsb_id} />)} */}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>

    )
}