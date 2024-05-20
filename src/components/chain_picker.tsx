"use client"
import { Button } from "@/components/ui/button"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { ChainsByStruct, PolymerByStruct } from "@/store/ribxz_api/ribxz_api"
import { superimpose_add_chain } from "@/store/slices/molstar_state"
import { useAppDispatch } from "@/store/store"
import { Separator } from "@radix-ui/react-select"
import { useEffect } from "react"



const ChainSelection = ({ polymers }: { polymers: PolymerByStruct[] }) => {

    const dispatch       = useAppDispatch();
    return <div className="chain-picker grid gap-1 max-h-64 overflow-y-auto">

        <div className="text-xs items-center gap-2">
            <Input placeholder="Search" />
        </div>
        <Separator />
        {polymers
            .toSorted((a: PolymerByStruct, b: PolymerByStruct) => {
                if (a.nomenclature.length < 1 || b.nomenclature.length < 1) return 0
                else if (a.nomenclature[0] < b.nomenclature[0]) return -1
                else return 1
            })
            .map(p =>
                <div key={p.auth_asym_id} 
                onClick={()=>{dispatch(superimpose_add_chain(p))}}
                className="border rounded-sm p-0.5 px-2 text-sm flex justify-between hover:cursor-pointer hover:bg-slate-200">
                    <span>{p.auth_asym_id}</span>
                    <span>{p.nomenclature[0]}</span>
                </div>)}
    </div>

}

const StructureSelection = ({ rcsb_id, polymers }: { rcsb_id: string, polymers: PolymerByStruct[] }) => {
    return <div className="border rounded-lg p-1 max-h-64 overflow-y-auto scrollbar-hide flex items-center justify-between hover:bg-slate-200">
        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
                <span className="min-w-full cursor-pointer px-1 text-sm">{rcsb_id}</span>
            </HoverCardTrigger>
            <HoverCardContent side="right">
                <ChainSelection polymers={polymers} />
            </HoverCardContent>
        </HoverCard>
    </div>
}


export default function ChainPicker({ children, chains_by_struct }: { children?: React.ReactNode, chains_by_struct: ChainsByStruct[] }) {
    return (
        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild >
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-4" side="right">
                <div className="chain-picker grid gap-2">
                    <div className="flex items-center gap-2">
                        <Input placeholder="Search" />
                    </div>
                    {chains_by_struct.map(cbs => <StructureSelection rcsb_id={cbs.rcsb_id} key={cbs.rcsb_id} polymers={cbs.polymers} />)}
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}