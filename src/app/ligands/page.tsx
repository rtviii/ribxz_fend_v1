"use client"
import { Badge } from "@/components/ui/badge"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { NonpolymericLigand, ribxz_api, useRoutersRouterStructListLignadsQuery } from "@/store/ribxz_api/ribxz_api"
import { useAppSelector } from "@/store/store"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { useEffect } from "react"


interface LigandRowProps {
    ligandinfo        : {
        chemical_id     : string,
        chemical_name   : string,
        formula_weight  : number,
        pdbx_description: string,
    },
    associated_structs: string[],
}

// TODO: Ligands page (just a table) + small mention on each structure info page
//  const LigandTableRow = (props:LigandRowProps) => {
//     const ctx = useAppSelector(state => state.molstar.ui_plugin)
//     const polymer = props.polymer

//     return <TableRow
//         className="hover:bg-slate-100   hover:cursor-pointer"
//         onClick={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : selectChain(ctx!, polymer.auth_asym_id) } : undefined}
//         onMouseEnter={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : highlightChain(ctx, polymer.asym_ids[0]) } : undefined}
//         onMouseLeave={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : removeHighlight(ctx!) } : undefined} >
//         <TableCell>{polymer.parent_rcsb_id}</TableCell>
//         <TableCell>{polymer.auth_asym_id}</TableCell>
//         <TableCell><Badge variant   = "outline">{polymer.nomenclature}</Badge></TableCell>
//         <TableCell        className = "whitespace-pre">{polymer.src_organism_names.join(',')}</TableCell>
//         {/* <TableCell><DeleteIcon className="h-5 w-5" /></TableCell> */}
//     </TableRow>
// }

export default function Ligands() {
   
    const { data:ligands_data, isLoading, isError } = useRoutersRouterStructListLignadsQuery()
    useEffect(() => {
        console.log(ligands_data);
        


    },[ligands_data])

    return <Table>
        <TableBody>
            <TableRow>
                <TableCell>1</TableCell>
            </TableRow>
        </TableBody>
    </Table>
}