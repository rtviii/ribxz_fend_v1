'use client'
import { MolstarContext as MolstarAppContext } from "@/components/ribxz/molstar_context"
import { Badge } from "@/components/ui/badge"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
// import { create_ligand, create_ligand_surroundings, highlightChain, removeHighlight, selectChain } from "@/store/molstar/functions"
import { NonpolymericLigand, Polymer, Protein, Rna, ribxz_api } from "@/store/ribxz_api/ribxz_api"
import { useAppSelector } from "@/store/store"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { useContext, useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Separator } from "../ui/separator"


interface PolymerTableRowProps {
    polymer                : Polymer | Rna | Protein,
    connect_to_molstar_ctx?: boolean,
    classification_report  : []

}

export const PolymerTableRow = (props: PolymerTableRowProps) => {
    const polymer = props.polymer
    const ctx = useContext(MolstarAppContext)


    const [trigger, result, lastPromiseInfo] = ribxz_api.useLazyRoutersRouterStructPolymerClassificationReportQuery();

    const [classification_report, setClassificationReport] = useState()


    useEffect(()=>{
        console.log(result);
    },[result])

    return <TableRow
        // className="  hover:cursor-pointer"
        onClick={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : ctx.select_chain(polymer.auth_asym_id) } : undefined}
        onMouseEnter={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : ctx.highlightChain(polymer.auth_asym_id) } : undefined}
        onMouseLeave={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : ctx.removeHighlight() } : undefined}>

        <TableCell className="mt-1 text-xs text-center">{polymer.parent_rcsb_id}</TableCell>
        <TableCell className="mt-1 text-xs text-center">{polymer.auth_asym_id}</TableCell>
        <TableCell className="mt-1 text-xs text-center">
                        <Badge variant="outline" className="hover:bg-muted hover:cursor-pointer" 
                        // onMouseEnter={() => { trigger({ authAsymId: polymer.auth_asym_id, rcsbId: polymer.parent_rcsb_id, }); }}
                        >
                            {polymer.nomenclature}
                        </Badge>

        {/* TODO: When classification reports are generated: plug them in here */}
            {/* <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger  >

                    </TooltipTrigger>

                    <TooltipContent side="top">
                        <p>E-value consensus sse</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider> */}
        </TableCell>




        <TableCell className="mt-1 text-xs whitespace-pre">{polymer.src_organism_names.join(',')}</TableCell>
    </TableRow>
}

interface PolymersTableProps {
    proteins: Protein[],
    rnas: Rna[],
    connect_to_molstar_ctx?: boolean
    if_empty_prompt?: React.ReactNode
}

export default function PolymersTable(props: PolymersTableProps) {
    const proteins = props.proteins
    const rnas = props.rnas
    return (
        <ScrollArea className="max-h-[80vh] rounded-md border overflow-auto no-scrollbar">
            <Table >
                <TableHeader>
                    <TableRow>
                        <TableHead className="py-1 font-normal text-xs bg-muted border-b-2 border-black">Parent Structure</TableHead>
                        <TableHead className="py-1 font-normal text-xs bg-muted border-b-2 border-black">Chain ID</TableHead>
                        <TableHead className="py-1 font-normal text-xs bg-muted border-b-2 border-black">Polymer Class</TableHead>
                        <TableHead className="py-1 font-normal text-xs bg-muted border-b-2 border-black">Source Organism</TableHead>
                    </TableRow>
                </TableHeader>
                {
                    proteins.length == 0 && rnas.length == 0 ?
                        <TableBody>
                            <TableRow>
                                <TableCell className="text-center w-full"> {"<---"} Select Polymer Class</TableCell>
                            </TableRow>
                        </TableBody>
                        : null
                }

                {proteins.length != 0 ?
                    <>
                        <TableBody >
                            <TableRow>

                                <TableHead className=" font-normal">Proteins</TableHead>
                            </TableRow>
                            {proteins.map(p => <PolymerTableRow key={p.parent_rcsb_id + p.auth_asym_id} polymer={p} connect_to_molstar_ctx={props.connect_to_molstar_ctx} />)}
                        </TableBody>
                    </>
                    : null}


                {rnas.length != 0 ?
                    <>
                        <TableBody >
                            <TableRow>

                                <TableHead className=" text-base">RNA</TableHead>
                            </TableRow>
                            {rnas.map(r => <PolymerTableRow key={r.parent_rcsb_id + r.auth_asym_id} polymer={r} connect_to_molstar_ctx={props.connect_to_molstar_ctx} />)}
                        </TableBody>
                    </>
                    : null
                }
            </Table>

        </ScrollArea>
    )
}

function DeleteIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
            <line x1="18" x2="12" y1="9" y2="15" />
            <line x1="12" x2="18" y1="9" y2="15" />
        </svg>
    )
}