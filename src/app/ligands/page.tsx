"use client"
import { Badge } from "@/components/ui/badge"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { NonpolymericLigand, ribxz_api, useRoutersRouterStructListLignadsQuery } from "@/store/ribxz_api/ribxz_api"
import { useAppSelector } from "@/store/store"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { useEffect } from "react"

interface LigandRowProps {
    ligandinfo: {
        chemicalId           : string,
        chemicalName         : string,
        formula_weight       : number,
        pdbx_description     : string,
        drugbank_id         ?: string,
        drugbank_description?: string,
    },
    associated_structs: string[],
}


// TODO: Ligands page (just a table) + small mention on each structure info page
const LigandTableRow = (props: LigandRowProps) => {
    const ctx = useAppSelector(state => state.molstar.ui_plugin)

    const lig = props.ligandinfo
    return <TableRow
        className="hover:bg-slate-100   hover:cursor-pointer"
    // onClick={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : selectChain(ctx!, polymer.auth_asym_id) } : undefined}
    // onMouseEnter={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : highlightChain(ctx, polymer.asym_ids[0]) } : undefined}
    // onMouseLeave={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : removeHighlight(ctx!) } : undefined} 
    >
        <TableCell>{lig.chemicalId}</TableCell>
        <TableCell><Badge variant="outline">{props.associated_structs.length}</Badge></TableCell>
        <TableCell>{lig.chemicalName.length > 40 ? lig.chemicalName.slice(0,10) + "..." : lig.chemicalName  }</TableCell>
        <TableCell className="whitespace-pre">
            {lig.drugbank_id}
            </TableCell>

    </TableRow>
}

export default function Ligands() {

    const { data: ligands_data, isLoading, isError } = useRoutersRouterStructListLignadsQuery()


    useEffect(() => {
        console.log(ligands_data);
    }, [ligands_data])

    return <ScrollArea className="border m-4 max-h-[95vh] rounded-md overflow-auto">
        <Table >
            <TableHeader>
                <TableRow>
                    <TableHead>Chemical Id</TableHead>
                    <TableHead># Host Structures</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Drugbank ID</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    ligands_data?.map((ligand, i) => {
                        return <LigandTableRow key={i} ligandinfo={ligand[0]} associated_structs={ligand[1]} />
                    })
                }
                <TableRow>

                </TableRow>
            </TableBody>
        </Table>
    </ScrollArea>
}