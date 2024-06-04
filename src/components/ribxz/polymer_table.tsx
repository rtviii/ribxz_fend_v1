import { ExampleContext as MolstarAppContext } from "@/app/[rcsb_id]/page"
import { Badge } from "@/components/ui/badge"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
// import { create_ligand, create_ligand_surroundings, highlightChain, removeHighlight, selectChain } from "@/store/molstar/functions"
import { NonpolymericLigand, Polymer, Protein, Rna } from "@/store/ribxz_api/ribxz_api"
import { useAppSelector } from "@/store/store"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { useContext } from "react"


interface PolymerTableRowProps {
    polymer: Polymer | Rna | Protein,
    connect_to_molstar_ctx?: boolean
}

export const PolymerTableRow = (props: PolymerTableRowProps) => {
    // const ctx         = useAppSelector(state => state.molstar.ui_plugin)
    const polymer = props.polymer
    const ctx = useContext(MolstarAppContext)


    return <TableRow
        className    = "hover:bg-slate-100   hover:cursor-pointer"
        onClick      = {props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : ctx.select_chain(polymer.auth_asym_id) } : undefined}
        onMouseEnter = {props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : ctx.highlightChain(polymer.auth_asym_id) } : undefined}
        onMouseLeave = {props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : ctx.removeHighlight() } : undefined}
    >

        <TableCell>{polymer.parent_rcsb_id}</TableCell>
        <TableCell>{polymer.auth_asym_id}</TableCell>
        <TableCell><Badge variant="outline">{polymer.nomenclature}</Badge></TableCell>
        <TableCell className="whitespace-pre">{polymer.src_organism_names.join(',')}</TableCell>
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
        <ScrollArea className="max-h-[85vh] rounded-md border overflow-auto">
            <Table >
                <TableHeader>
                    <TableRow>
                        <TableHead>Parent Structure</TableHead>
                        <TableHead>Chain ID</TableHead>
                        <TableHead>Polymer Class</TableHead>
                        <TableHead>Source Organism</TableHead>
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

                                <TableHead className="font-bold text-base">Proteins</TableHead>
                            </TableRow>
                            {proteins.map(p => <PolymerTableRow key={p.parent_rcsb_id + p.auth_asym_id} polymer={p} connect_to_molstar_ctx={props.connect_to_molstar_ctx} />)}
                        </TableBody>
                    </>
                    : null}


                {rnas.length != 0 ?
                    <>
                        <TableBody >
                            <TableRow>

                                <TableHead className="font-bold text-base">RNA</TableHead>
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

function DeleteIcon(props) {
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