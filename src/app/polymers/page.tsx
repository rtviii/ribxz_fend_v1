"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HoverMenu } from "../structures/page"
import { Filters, StructuresPagination } from "@/components/ribxz/filters"
import { SidebarMenu } from "@/components/ribxz/sidebar_menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { useAppSelector } from "@/store/store"

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
  const [tab, setTab]    = useState("by_polymer_class");
  const onTabChange      = (value: string) => { setTab(value); }

  const current_polymers = useAppSelector((state) => state.ui.data.current_polymers)

    useEffect(() => {

    })
    return (
        // This needs two tabs "by structure" and "by polymer Class"
        <div className="max-w-screen max-h-screen min-h-screen p-4 flex flex-col flex-grow  outline ">
            <HoverMenu />
            <h1 className="text-2xl font-bold mb-6 ">Polymers</h1>
            <div className="grow"  >
                <div className="grid grid-cols-12 gap-4 min-h-[90vh]    ">
                    <div className="col-span-3  flex flex-col min-h-full pr-4">
                        <PolymerInput />
                        <Filters />
                        <SidebarMenu />
                        <div className="p-1 my-4 rounded-md border w-full">
                            <StructuresPagination />
                        </div>
                    </div>
                    <div className="col-span-9 scrollbar-hidden">
                        <ScrollArea className=" max-h-[90vh] overflow-y-scroll scrollbar-hidden" scrollHideDelay={1} >
                            <div className=" gap-4 flex  flex-wrap  p-1 scrollbar-hidden"  >

                                <Tabs defaultValue="by_polymer_class" value={tab} onValueChange={onTabChange}>
                                    <TabsList className="grid w-full grid-cols-2">

                                        {/* TODO: Add tooltip what each means */}
                                        <TabsTrigger className="w-full" value="by_polymer_class">By Polymer Class</TabsTrigger>
                                        <TabsTrigger className="w-full" value="by_structure" >By Structure</TabsTrigger>
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