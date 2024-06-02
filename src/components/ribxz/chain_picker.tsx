"use client"
import { Button } from "@/components/ui/button"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { Input } from "@/components/ui/input"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { ChainsByStruct, PolymerByStruct, RibosomeStructure } from "@/store/ribxz_api/ribxz_api"
import { superimpose_add_chain, superimpose_set_chain_search, superimpose_set_struct_search } from "@/store/slices/molstar_state"
import { Separator } from "@radix-ui/react-select"
import { set_filter } from "@/store/slices/ui_state"


const ChainSelection = ({ structure }: { structure: RibosomeStructure }) => {

    const dispatch = useAppDispatch();
    const search_val = useAppSelector(state => state.molstar.superimpose.chain_search)!
    const polymers = [...structure.proteins, ...structure.rnas, ...structure.other_polymers]

    return <div className="border rounded-lg p-1 max-h-64 overflow-y-auto scrollbar-hide flex items-center justify-between hover:bg-slate-200">
        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
                <span className="min-w-full cursor-pointer px-1 text-sm">{structure.rcsb_id}</span>
            </HoverCardTrigger>
            <HoverCardContent side="right">
                <div className="chain-picker grid gap-1 max-h-64 overflow-y-auto">

                    <div className="text-xs items-center gap-2">
                        <Input placeholder="Search" value={search_val} onChange={(e) => { dispatch(superimpose_set_chain_search(e.target.value)) }} />
                    </div>
                    <Separator />
                    {polymers
                        .toSorted((a: PolymerByStruct, b: PolymerByStruct) => {
                            if (a.nomenclature.length < 1 || b.nomenclature.length < 1) return 0
                            else if (a.nomenclature[0] < b.nomenclature[0]) return -1
                            else return 1
                        })
                        .filter(p => {
                            if (p.nomenclature.length < 1) return p.auth_asym_id.toLowerCase().includes(search_val.toLowerCase())
                            else return p.nomenclature[0].toLowerCase().includes(search_val.toLowerCase()) || p.auth_asym_id.toLowerCase().includes(search_val.toLowerCase())
                        })
                        .map(p =>
                            <div key={p.auth_asym_id}
                                onClick={() => { dispatch(superimpose_add_chain({ polymer: p, rcsb_id: structure.rcsb_id })) }}
                                className="border rounded-sm p-0.5 px-2 text-sm flex justify-between hover:cursor-pointer hover:bg-slate-200">
                                <span>{p.auth_asym_id}</span>
                                <span>{p.nomenclature[0]}</span>
                            </div>)}
                </div>
            </HoverCardContent>
        </HoverCard>
    </div>
}

export default function ChainPicker({ children }: { children?: React.ReactNode }) {

    const dispatch = useAppDispatch();
    const search_val = useAppSelector(state => state.molstar.superimpose.struct_search)!
    const current_structures = useAppSelector(state => state.ui.data.current_structures)
    const filters = useAppSelector(state => state.ui.filters)

    return (
        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild >
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-4" side="right">
                <div className="chain-picker grid gap-2">
                    <div className="flex items-center gap-2">
                        <Input placeholder="Search"
                            value={filters.search}
                            onChange={(e) => {
                                dispatch(set_filter({ filter_type: "search", value: e.target.value }))
                            }} />
                    </div>
                    {
                        current_structures
                            .map(S => <ChainSelection structure={S} key={S.rcsb_id} />)
                    }
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