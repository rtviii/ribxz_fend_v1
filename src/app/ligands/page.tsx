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
import { TaxonomyDot } from "@/components/ribxz/taxonomy"
import { SidebarMenu } from "@/components/ribxz/sidebar_menu"
import Link from "next/link"


interface TaxaDropdownProps {
    count: number
    species: string[]
}
export function LigandTaxonomyDropdown(props: { count: number, species: LigandAssociatedTaxa }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-20">{props.count}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" max-h-60 overflow-y-scroll">
                <p className="italic ">

                    {props.species.toSorted().map((spec, i) =>
                        <DropdownMenuItem key={i}>{spec[1]}</DropdownMenuItem>
                    )}
                </p>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}



export function LigandStructuresDropdown(props: { count: number, structures: LigandAssociatedStructure[], info: LigandInfo }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-40">{props.count}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-80 overflow-y-scroll">
                {props.structures.toSorted((s1, s2) => Number(s1.src_organism_names[0] > s2.src_organism_names[0])).map((struct, i) =>
                    <DropdownMenuItem key={i} >
                        <Badge className="w-60 flex justify-between items-center cursor-pointer">
                            {struct.parent_structure}
                            <div className="italic text-white flex gap-2 flex-row">
                                {struct.src_organism_names[0].split(" ").slice(0, 2).join(" ")}
                                <TaxonomyDot className={`w-2 h-2 ${(() => {
                                    if (struct.superkingdom == 2) return "fill-green-500"
                                    else if (struct.superkingdom == 2157) return "fill-orange-500"
                                    else if (struct.superkingdom === 2759) return "fill-blue-500"
                                })()}`} />

                            </div>

                        </Badge>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

interface LigandInfo {
    chemicalId: string,
    chemicalName: string,
    formula_weight: number,
    pdbx_description: string,
    drugbank_id?: string,
    drugbank_description?: string,
}
interface LigandAssociatedStructure {
    parent_structure: string,
    src_organism_ids: number[],
    src_organism_names: string[],
    superkingdom: number
}
type LigandAssociatedTaxa = Array<[string, number]>



type LigandRowProps = [LigandInfo, LigandAssociatedStructure[], LigandAssociatedTaxa]


const LigandTableRow = (props: LigandRowProps) => {
    const ctx = useAppSelector(state => state.molstar.ui_plugin)
    const info = props[0]
    const structures = props[1]
    const taxa = props[2]

    return <TableRow
        className="hover:bg-slate-100  "
    // onClick={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : selectChain(ctx!, polymer.auth_asym_id) } : undefined}
    // onMouseEnter={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : highlightChain(ctx, polymer.asym_ids[0]) } : undefined}
    // onMouseLeave={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : removeHighlight(ctx!) } : undefined} 
    >
        <TableCell className="font-semibold ">{info.chemicalId}</TableCell>
        <TableCell>
            <LigandStructuresDropdown count={structures.length} structures={structures} info={info} />
        </TableCell>
        <TableCell>
            <LigandTaxonomyDropdown count={taxa.length} species={taxa} />
        </TableCell>
        <TableCell>{info.chemicalName.length > 40 ? info.chemicalName.slice(0, 10) + "..." : info.chemicalName}</TableCell>
        <TableCell className="whitespace-pre" >
            <Link href={`https://go.drugbank.com/drugs/${info.drugbank_id}`} className="hover:cursor-pointer font-bold text-blue-900" >
                {info.drugbank_id}
            </Link>
        </TableCell>

    </TableRow>
}

export default function Ligands() {

    const { data: ligands_data, isLoading, isError } = useRoutersRouterStructListLignadsQuery()


    useEffect(() => {

        console.log(ligands_data);
    }, [ligands_data])

    return <ScrollArea className="border m-4 max-h-[95vh] rounded-md overflow-auto">
        <SidebarMenu />
        <Table >
            <TableHeader>
                <TableRow>
                    <TableHead>Chemical Id</TableHead>
                    <TableHead><p># Host Structures </p>
                        <div className="flex flex-row"> (Eukarya<TaxonomyDot className={`w-2 h-2 fill-blue-500`} />|Bacteria<TaxonomyDot className={`w-2 h-2 fill-green-500`} />|Archaea<TaxonomyDot className={`w-2 h-2 fill-orange-500`} />)</div>
                    </TableHead>
                    <TableHead># Unique Host Species</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Drugbank ID</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {
                    (ligands_data as LigandRowProps[])?.toSorted((l1, l2) => Number(l1[1].length > l2[1].length))
                        .toReversed()
                        .filter(l => !["SF4"].includes(l[0].chemicalId))
                        .map((ligand, i) => {
                            return <LigandTableRow key={i} {...ligand} />
                        })
                }
                <TableRow>

                </TableRow>
            </TableBody>
        </Table>
    </ScrollArea>
}