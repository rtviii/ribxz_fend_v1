'use client'
import { MolstarContext as MolstarAppContext } from "@/components/ribxz/molstar_context"
import { Badge } from "@/components/ui/badge"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { NonpolymericLigand, Polymer, Protein, Rna, ribxz_api } from "@/store/ribxz_api/ribxz_api"
import { useAppSelector } from "@/store/store"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { useContext, useEffect, useMemo, useState } from "react"
import SequencePopover from "./sequence_popover"


interface PolymerTableRowProps {
    polymer: Polymer,
    connect_to_molstar_ctx?: boolean,
    classification_report?: []
}

interface PolymersTableProps {
    polymers: Polymer[],
    connect_to_molstar_ctx?: boolean
    if_empty_prompt?: React.ReactNode
}

export const PolymerTableRow = (props: PolymerTableRowProps) => {
    const polymer                                          = props.polymer
    const ctx                                              = useContext(MolstarAppContext)
    const [trigger, result, lastPromiseInfo]               = ribxz_api.useLazyRoutersRouterStructPolymerClassificationReportQuery();
    const [classification_report, setClassificationReport] = useState()
    const taxid_dict                                       = useAppSelector(state => state.ui.taxid_dict)

    return <TableRow

        className    = "cursor-pointer"
        onClick      = {props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : ctx.select_chain(polymer.auth_asym_id) } : undefined}
        onMouseEnter = {props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : ctx.highlightChain(polymer.auth_asym_id) } : undefined}
        onMouseLeave = {props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : ctx.removeHighlight() } : undefined}>

        <TableCell className="mt-1 text-xs text-center">{polymer.auth_asym_id}</TableCell>
        <TableCell className="mt-1 text-xs text-center">
            <Badge variant="outline" className="hover:bg-muted hover:cursor-pointer" >
                {polymer.nomenclature}
            </Badge>
        </TableCell>
        <TableCell className="mt-1 text-xs whitespace-pre text-center">
            <SequencePopover
                seqType={polymer.entity_poly_polymer_type === 'Protein' ? 'amino' : 'rna'}
                sequence={polymer.entity_poly_seq_one_letter_code_can} />
        </TableCell>
    </TableRow>
}


const sort_by_polymer_class = (a: Polymer, b: Polymer): number => {
    var poly_class_a = a.nomenclature.length > 0 ? a.nomenclature[0] : null;
    var poly_class_b = b.nomenclature.length > 0 ? b.nomenclature[0] : null;

    if (poly_class_a === poly_class_b) {
        return 0;
    } if (poly_class_a === null) {
        return 1;
    }
    else if (poly_class_b === null) {
        return -1;
    }


    const [, prefixA, numberA] = poly_class_a.match(/([a-zA-Z]+)(\d*)/) || [];
    const [, prefixB, numberB] = poly_class_b.match(/([a-zA-Z]+)(\d*)/) || [];

    if (prefixA !== prefixB) {
        return prefixA.localeCompare(prefixB);
    }

    const numA = numberA ? parseInt(numberA, 10) : 0;
    const numB = numberB ? parseInt(numberB, 10) : 0;
    return numA - numB;
};


export default function PolymersTable(props: PolymersTableProps) {

    const proteins = props.polymers.filter(p => p.entity_poly_polymer_type == "Protein")
    const rnas     = props.polymers.filter(p => p.entity_poly_polymer_type == "RNA")

    // const [filter, setFilter]         = useState('');
    // const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    // useEffect(() => {
    //     console.log(sortConfig);
    // },[sortConfig])


    // const handleSort = (key:string|null) => {
    //     setSortConfig((prevConfig) => ({
    //         key,
    //         direction:
    //             prevConfig.key === key && prevConfig.direction === 'ascending'
    //                 ? 'descending'
    //                 : 'ascending',
    //     }));
    // };

    // const filteredAndSortedPolymers = useMemo(() => {
    //     let result = [...proteins, ...rnas];
    //     if (filter) {
    //         result = result.filter((polymer) =>
    //             Object.values(polymer).some((value) =>
    //                 String(value).toLowerCase().includes(filter.toLowerCase())
    //             )
    //         );
    //     }
    //     if (sortConfig.key== 'polymer_class') {
    //         result.sort((a:Polymer, b:Polymer) => {
    //             if (a.nomenclature[0] < b.nomenclature[0]) return sortConfig.direction === 'ascending' ? -1 : 1;
    //             if (a.nomenclature[0] > b.nomenclature[0]) return sortConfig.direction === 'ascending' ? 1 : -1;
    //             return 0;
    //         });
    //     }
    //     return result;
    // }, [proteins, rnas, filter, sortConfig]);

    return (
        <div>
            <ScrollArea className="max-h-[80vh] rounded-md border overflow-auto no-scrollbar">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {[['auth_asym_id', 'auth_asym_id'], ['Polymer Class', 'polymer_class'], ["Sequence", "sequence"]].map((ColumnName) => (
                                <TableHead key={ColumnName[0]} className="py-1 font-normal text-xs bg-muted border-b-2 border-black">
                                    {ColumnName[0] === 'auth_asym_id' ? <code>{ColumnName[0]}</code> : ColumnName[0]}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {props.polymers.toSorted(sort_by_polymer_class).map(p =>
                            <PolymerTableRow key={p.parent_rcsb_id + p.auth_asym_id} polymer={p} connect_to_molstar_ctx={props.connect_to_molstar_ctx} />
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>

    )

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
                {proteins.length == 0 && rnas.length == 0 ? <TableBody> <TableRow> <TableCell className="text-center w-full"> {"<---"} Select Polymer Class</TableCell> </TableRow> </TableBody> : null}

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