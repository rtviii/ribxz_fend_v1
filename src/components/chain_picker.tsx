import { Button } from "@/components/ui/button"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"


const sc_dict = {
    "3j7z": ["A1", "BF"],
    "5afi": ["IK", "J4", "KL", "LM", "MN"],
    "5afs": ["IK", "J4", "KL", "LM", "MN"],
    "5af4": ["IK", "J4", "KL", "LM", "MN"],
    "5afg": ["IK", "J4", "KL", "LM", "MN"],
    "5asi": ["IK", "J4", "KL", "LM", "MN"],
    "5a4i": ["IK", "J4", "KL", "LM", "MN"],
    "54fi": ["IK", "J4", "KL", "LM", "MN"],
    "5vfi": ["IK", "J4", "KL", "LM", "MN"],
}


const ChainSelection = ({ chains }: { chains: string[] }) => {

    return <div className="grid gap-1">
        {chains.map(c => <div key={c} className="border rounded-sm p-0.5 px-2 text-xs">{c}</div>)}
    </div>

}

const StructureSelection = ({ rcsb_id }: { rcsb_id: string }) => {

    return <div className="border rounded-lg p-1 max-h-[500px] overflow-y-auto scrollbar-hide flex items-center justify-between  mb-2">


        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
                <span className="hover:bg-slate-400 min-w-full cursor-pointer px-1 text-sm">{rcsb_id}</span>
            </HoverCardTrigger>
            <HoverCardContent className="" side="right">
                <ChainSelection chains={sc_dict[rcsb_id]} />
            </HoverCardContent>
        </HoverCard>
    </div>
}


export default function ChainPicker({children}:{children?:React.ReactNode}) {
    return (
        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild >
                {/* <Button variant="link">Chain Picker</Button> */}
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-4" side="right">
                <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                        <Input placeholder="Search" />
                        <Button>Filter</Button>
                    </div>

                    {Object.entries(sc_dict).map(([rcsb_id, chains]) => <StructureSelection rcsb_id={rcsb_id} key={rcsb_id} />)}
                </div>
            </HoverCardContent>
        </HoverCard>
    )
}