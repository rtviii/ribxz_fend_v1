"use client"
import { Badge } from "@/components/ui/badge"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { NonpolymericLigand, ribxz_api, useRoutersRouterStructListLignadsQuery } from "@/store/ribxz_api/ribxz_api"
import { useAppSelector } from "@/store/store"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import StructureSelection from "@/components/ribxz/chain_picker"


interface TaxaDropdownProps {
    count: number
    species: string[]
}
export function LigandTaxonomyDropdown(props: { count:number, species:LigandAssociatedTaxa }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">{props.count}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" max-h-60 overflow-y-scroll">
                {props.species.toSorted().map((spec, i) => <DropdownMenuItem key={i}>{spec}</DropdownMenuItem>)}
                <DropdownMenuSeparator />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function LigandStructuresDropdown(props: {count:number, structures: LigandAssociatedStructure[], info: LigandInfo}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">{props.count}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" max-h-60 overflow-y-scroll">
                {props.structures.map((struct, i) => <DropdownMenuItem key={i}>{struct.parent_structure}</DropdownMenuItem>)}
                <DropdownMenuSeparator />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


interface LigandInfo {
    chemicalId           : string,
    chemicalName         : string,
    formula_weight       : number,
    pdbx_description     : string,
    drugbank_id         ?: string,
    drugbank_description?: string,
}
interface LigandAssociatedStructure {
    parent_structure : string,
    src_organism_ids  : number[],
    src_organism_names: string[],
    superkingdom      : 2 | 2157 | 2759
}
type LigandAssociatedTaxa  = string[]



type LigandRowProps = [LigandInfo, LigandAssociatedStructure[], LigandAssociatedTaxa]


const LigandTableRow = (props: LigandRowProps) => {
    const ctx        = useAppSelector(state => state.molstar.ui_plugin)
    const info       = props[0]
    const structures = props[1]
    const taxa       = props[2]

    return <TableRow
        className="hover:bg-slate-100   hover:cursor-pointer"
    // onClick={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : selectChain(ctx!, polymer.auth_asym_id) } : undefined}
    // onMouseEnter={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : highlightChain(ctx, polymer.asym_ids[0]) } : undefined}
    // onMouseLeave={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : removeHighlight(ctx!) } : undefined} 
    >
        <TableCell>{info.chemicalId}</TableCell>
        <TableCell>
            <LigandStructuresDropdown count={structures.length} structures={structures} info={info} />
        </TableCell>
        <TableCell>
            <LigandTaxonomyDropdown count={taxa.length} species={taxa} />
        </TableCell>
        <TableCell>{info.chemicalName.length > 40 ? info.chemicalName.slice(0, 10) + "..." : info.chemicalName}</TableCell>
        <TableCell className="whitespace-pre">
            {info.drugbank_id}
        </TableCell>

    </TableRow>
}

export default function Ligands() {

    const { data: ligands_data, isLoading, isError } = useRoutersRouterStructListLignadsQuery()


    useEffect(() => {
        console.log("got lig data");
        
        console.log(ligands_data);
    }, [ligands_data])

    return <ScrollArea className="border m-4 max-h-[95vh] rounded-md overflow-auto">
        <Table >
            <TableHeader>
                <TableRow>
                    <TableHead>Chemical Id</TableHead>
                    <TableHead># Host Structures</TableHead>
                    <TableHead># Host Species</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Drugbank ID</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    ligands_data?.map((ligand, i) => {
                        return <LigandTableRow key={i} {...ligand} />
                    })
                }
                <TableRow>

                </TableRow>
            </TableBody>
        </Table>
    </ScrollArea>
}