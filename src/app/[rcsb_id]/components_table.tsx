import { Badge } from "@/components/ui/badge"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { highlightChain, removeHighlight, selectChain } from "@/store/molstar/functions"
import { NonpolymericLigand, Polymer, Protein } from "@/store/ribxz_api/ribxz_api"
import { useAppSelector } from "@/store/store"
import Link from "next/link"


const PolymerTableRow = ({polymer}: {polymer:Polymer}) => {

    const ctx            = useAppSelector(state => state.molstar.ui_plugin)
    return <TableRow 
    className    = "hover:bg-gray-400 hover:text-white hover:cursor-pointer"
    onClick      = {()=>{selectChain(ctx!, polymer.auth_asym_id)}}
    onMouseEnter = {()=>{highlightChain(ctx!, polymer.auth_asym_id)}}
    onMouseLeave = {()=>{removeHighlight(ctx!)}}
    >
        <TableCell>{polymer.auth_asym_id}</TableCell>
        <TableCell><Badge variant="outline">{polymer.nomenclature}</Badge></TableCell>
        <TableCell className="whitespace-pre">{polymer.src_organism_names}</TableCell>
        <TableCell className="whitespace-pre">{polymer.entity_poly_seq_one_letter_code_can}</TableCell>
        <TableCell>
            <DeleteIcon className="h-5 w-5" />
        </TableCell>
    </TableRow>
}

const LigandTableRow = ({}: {}) => {
    return <TableRow>
        <TableCell>AX</TableCell>
        <TableCell>Erythromycin</TableCell>
        <TableCell>
            <Link href="#">Link</Link>
        </TableCell>
        <TableCell>
            <div className="flex items-center gap-2">
            </div>
        </TableCell>
    </TableRow>
}

export default function StructureComponents({ proteins, ligands, rnas }: { proteins: Protein[], ligands: NonpolymericLigand[], rnas: Polymer[] }) {
    return (
        <div className="border rounded-md">
            <Table className="m-2">
                <TableHeader>
                    <TableRow>
                        <TableHead>Chain ID</TableHead>
                        <TableHead>Polymer Class</TableHead>
                        <TableHead>Source Organism</TableHead>
                        <TableHead>Sequence</TableHead>
                        <TableHead className="w-12"/>
                    </TableRow>
                </TableHeader>

                <TableHeader>
                    <TableRow>
                        <TableHead className="font-bold text-base">Proteins</TableHead>
                    </TableRow>
                </TableHeader>


                <TableBody >
                    {proteins.map(p => <PolymerTableRow key={p.auth_asym_id} polymer={p} />)}
                </TableBody>
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-bold text-base">RNA</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody >
                    {rnas.map(r => <PolymerTableRow key={r.auth_asym_id} polymer={r} />)}
                </TableBody>
            </Table>

            <Table className="m-2">
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Chemical Name</TableHead>
                        <TableHead>DrugBank Id</TableHead>
                        <TableHead>Related Structures</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>

                    {[1, 2, 3].map(x => <LigandTableRow key={x} />)}


                </TableBody>
            </Table>
        </div>
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