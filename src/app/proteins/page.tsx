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
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { PolymerTableRow } from "../[rcsb_id]/components_table"
import { useState } from "react"

function PolymerInput() {


    return <div className="grid w-full items-center gap-1.5  mb-2 border p-2 rounded-md">

        <div>
        </div>
        <Label htmlFor="input" className="font-bold text-lg mb-2"> Polymer Class</Label>
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="flex items-center">
                <Input className="focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-900 rounded-sm justify-self-center" id="input" placeholder="Enter a choice" type="text" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
                <DropdownMenuLabel>Available Choices</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Option 1</DropdownMenuItem>
                <DropdownMenuItem>Option 2</DropdownMenuItem>
                <DropdownMenuItem>Option 3</DropdownMenuItem>
                <DropdownMenuItem>Option 4</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>

}




export default function PolymersPage() {
    const [tabstate, setTabState] = useState("structure")



    return (
        // This needs two tabs "by structure" and "by polymer Class"
        <div className="max-w-screen max-h-screen min-h-screen p-4 flex flex-col flex-grow  outline ">
            <HoverMenu />
            <h1 className="text-2xl font-bold mb-6 ">Polymers</h1>
            <div className="grow"  >
                <div className="grid grid-cols-12 gap-4 min-h-[90vh]    ">
                    <div className="col-span-3  flex flex-col min-h-full pr-4">
                        <PolymerInput />

                        <FilterSidebar />
                        <SidebarMenu />
                        <div className="p-1 my-4 rounded-md border w-full">
                            <StructuresPagination />
                        </div>
                    </div>
                    <div className="col-span-9 scrollbar-hidden">
                        <ScrollArea className=" max-h-[90vh] overflow-y-scroll scrollbar-hidden" scrollHideDelay={1} >
                            <div className=" gap-4 flex  flex-wrap  p-1 scrollbar-hidden"  >
                            <Tabs defaultValue="info"  >
                                <TabsList className="grid w-full grid-cols-2">

                                    {/* TODO: Add tooltip what each means */}
                                    <TabsTrigger className="w-full" value="components">By Polymer Class</TabsTrigger>
                                    <TabsTrigger className="w-full" value="info">By Structure</TabsTrigger>
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