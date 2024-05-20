import { Button } from "@/components/ui/button"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { ChainsByStruct } from "@/store/ribxz_api/ribxz_api"


const sc_dict = {
    "3J7Z": ["A1", "BF"],
    "5AFI": ["IK", "J4", "KL", "LM", "MN"],
    "5AFS": ["IK", "J4", "KL", "LM", "MN"],
    "5AF4": ["IK", "J4", "KL", "LM", "MN"],
    "5AFG": ["IK", "J4", "KL", "LM", "MN"],
    "5ASI": ["IK", "J4", "KL", "LM", "MN"],
    "5A4I": ["IK", "J4", "KL", "LM", "MN"],
    "54FI": ["IK", "J4", "KL", "LM", "MN"],
    "5VFI": ["IK", "J4", "KL", "LM", "MN"],
}


const ChainSelection = ({ chains }: { chains: string[] }) => {

    return <div className="grid gap-1">
        {chains.map(c => <div key={c} className="border rounded-sm p-0.5 px-2 text-xs">{c}</div>)}
    </div>

}

const StructureSelection = ({ rcsb_id }: { rcsb_id: string }) => {
    return <div className="border rounded-lg p-1 max-h-[500px] overflow-y-auto scrollbar-hide flex items-center justify-between hover:bg-slate-200">
        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
                <span className=" min-w-full cursor-pointer px-1 text-sm">{rcsb_id}</span>
            </HoverCardTrigger>
            <HoverCardContent className="" side="right">
                <ChainSelection chains={sc_dict[rcsb_id]} />
            </HoverCardContent>
        </HoverCard>
    </div>
}


export default function ChainPicker({ children, chains_by_struct }: { children?: React.ReactNode, chains_by_struct?: ChainsByStruct[]}) {
    return (
        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild >
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-4" side="right">
                <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                        <Input placeholder="Search" />
                    </div>
                    {Object.entries(sc_dict).map(([rcsb_id, chains]) => <StructureSelection rcsb_id={rcsb_id} key={rcsb_id} />)}
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