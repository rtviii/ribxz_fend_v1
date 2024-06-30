"use client"
import { Badge } from "@/components/ui/badge"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ribxz_api, useRoutersRouterStructListLigandsQuery } from "@/store/ribxz_api/ribxz_api"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { Button } from "@/components/ui/button"
import { CardTitle, CardHeader, CardContent, CardFooter, Card, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
import { NonpolymericLigand, RibosomeStructure, useRoutersRouterStructStructureProfileQuery, useRoutersRouterStructStructurePtcQuery } from "@/store/ribxz_api/ribxz_api"
import { useParams, useSearchParams } from 'next/navigation'
import PolymersTable from "@/components/ribxz/polymer_table"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { MolstarRibxz } from "@/components/mstar/molstar_wrapper_class"
import { MolstarNode } from "@/components/mstar/lib"
import { FaceIcon, ImageIcon, SunIcon } from '@radix-ui/react-icons'
import { Separator } from "@/components/ui/separator"
import Image from 'next/image'
import { MolstarContext } from "@/components/ribxz/molstar_context"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { ExpMethodBadge } from "@/components/ribxz/exp_method_badge"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"


import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import StructureSelection from "@/components/ribxz/chain_picker"
import { TaxonomyDot } from "@/components/ribxz/taxonomy"
import { SidebarMenu } from "@/components/ribxz/sidebar_menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { TreeSelect } from "antd"
import { LigandInstances, set_current_ligand } from "@/store/slices/ui_state"
import { capitalize_only_first_letter_w } from "@/my_utils"
import { HelpTooltip } from "@/components/ribxz/help_icon"


interface TaxaDropdownProps {
    count: number
    species: string[]
}
function LigandTaxonomyDropdown(props: { count: number, species: LigandAssociatedTaxa }) {
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



function LigandStructuresDropdown(props: { count: number, structures: LigandAssociatedStructure[], info: LigandInfo }) {
    const router = useRouter()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-40">{props.count}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-80 overflow-y-scroll">
                {props.structures.toSorted((s1, s2) => Number(s1.src_organism_names[0] > s2.src_organism_names[0])).map((struct, i) =>
                    <DropdownMenuItem key={i} >
                        <Link href={{
                            pathname: `/structures/${struct.parent_structure}`,
                            query: { ligand: props.info.chemicalId },
                        }}>
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
                        </Link>
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
    return <TableRow
        className="hover:bg-slate-100  "
    // onClick={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : selectChain(ctx!, polymer.auth_asym_id) } : undefined}
    // onMouseEnter={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : highlightChain(ctx, polymer.asym_ids[0]) } : undefined}
    // onMouseLeave={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : removeHighlight(ctx!) } : undefined} 
    >

    </TableRow>
}

const lig_data_to_tree = (lig_data: LigandInstances) => {
    return lig_data.map(([lig, structs]) => ({
        key: lig.chemicalId,
        value: lig.chemicalId,                                                                                                // Changed from chemicalName to chemicalId ()
        title: (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span className="font-semibold">{lig.chemicalId}</span>
                <span style={{  }}>{lig.chemicalName.length > 30 ? capitalize_only_first_letter_w(lig.chemicalName).slice(0, 40) + "..." : capitalize_only_first_letter_w(lig.chemicalName)}</span>
            </div>
        ),

        // `${lig.chemicalId} (${lig.chemicalName.length > 30 ?  capitalize_only_first_letter_w(lig.chemicalName).slice(0,30)+"..." : capitalize_only_first_letter_w(lig.chemicalName) })`,
        selectable: false,                                                                                                         // Make the parent node not selectable
        search_aggregator: (lig.chemicalName + lig.chemicalId + structs.reduce((acc: string, next) => acc + next.rcsb_id + next.tax_node.scientific_name, '')).toLowerCase(),
        children: structs.map((struct, index) => ({
            search_aggregator: (lig.chemicalName + lig.chemicalId + struct.rcsb_id + struct.tax_node.scientific_name).toLowerCase(),
            key              : `${lig.chemicalId}_${struct.rcsb_id}`,
            value            : `${lig.chemicalId}_${struct.rcsb_id}`,
            title            : (
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span><span style={{fontWeight:"bold"}}>{lig.chemicalId}</span> in <span style={{fontWeight:"bold"}}>{struct.rcsb_id}</span></span>
                    <span style={{ fontStyle: 'italic' }}>{struct.tax_node.scientific_name}</span>
                </div>
            ),
            selectable: true                                                       // Make the child nodes selectable
        }))
    }));
}

export default function Ligands() {
    const dispatch = useAppDispatch();
    const molstarNodeRef = useRef<HTMLDivElement>(null);
    const [ctx, setCtx] = useState<MolstarRibxz | null>(null)
    useEffect(() => {
        (async () => {
            const x = new MolstarRibxz
            await x.init(molstarNodeRef.current!)
            setCtx(x)
        })()
    }, [])


    const lig_state = useAppSelector(state => state.ui.ligands_page)
    const current_ligand = useAppSelector(state => state.ui.ligands_page.current_ligand)

    const [surroundingResidues, setSurroundingResidues] = useState<{
        label_seq_id: number,
        label_comp_id: string,
        chain_id: string,
        rcsb_id: string,
    }[]>([])

    const chemical_structure_link = (ligand_id: string | undefined) => {
        if (ligand_id === undefined) { return '' };
        return `https://cdn.rcsb.org/images/ccd/labeled/${ligand_id.toUpperCase()[0]}/${ligand_id.toUpperCase()}.svg`
    }


    useEffect(() => {
        if (current_ligand === undefined) { return }
        ctx?.download_struct(current_ligand?.parent_structure.rcsb_id, true)
            .then((ctx) => ctx.create_ligand_and_surroundings(current_ligand?.ligand.chemicalId))
            .then((ctx) => ctx.get_selection_constituents(current_ligand?.ligand.chemicalId))
            .then(residues => { setSurroundingResidues(residues) })
    }, [current_ligand])


    return <div className="flex flex-col h-screen w-screen overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className=" ">
            <ResizablePanel defaultSize={25} >
                <MolstarContext.Provider value={ctx}>
                    <div className="border-r">
                        <div className="p-4 space-y-4">
                            <TreeSelect
                                status              = {current_ligand === null ? "warning" : undefined}
                                showSearch          = {true}
                                treeNodeFilterProp  = 'search_aggregator'                                                                                     // Changed from 'search_front' to 'title'
                                placeholder         = "Select ligand-structure pair..."
                                variant             = "outlined"
                                treeData            = {lig_data_to_tree(lig_state.data)}
                                className           = "w-full"
                                treeExpandAction    = "click"
                                showCheckedStrategy = "SHOW_CHILD"
                                filterTreeNode      = {(input, treenode) => { return (treenode.search_aggregator as string).includes(input.toLowerCase()) }}
                                onChange            = {(value: string, _) => {
                                    var [chemId, rcsb_id_selected] = value.split("_")
                                    const lig_and_its_structs = lig_state.data.filter((kvp) => {
                                        var [lig, structs] = kvp;
                                        return lig.chemicalId == chemId;
                                    })
                                    const struct = lig_and_its_structs[0][1].filter((s) => s.rcsb_id == rcsb_id_selected)[0]
                                    dispatch(set_current_ligand({
                                        ligand: lig_and_its_structs[0][0],
                                        parent_structure: struct
                                    }))
                                }}
                            />
                            {/* <Card className="p-4 space-y-2"> */}
                            <ScrollArea className="h-[90vh] overflow-scroll  no-scrollbar">
                                <div className="flex flex-row justify-between">
                                    {current_ligand === null ? null :

                                        <p className="col-span-2 text-sm ">{lig_state.current_ligand?.ligand.chemicalId}<span className=" text-xs text-gray-800">({capitalize_only_first_letter_w(lig_state.current_ligand?.ligand.chemicalName)})</span></p>

                                    }

                                    {
                                        lig_state.current_ligand?.ligand.drugbank_id ?
                                            <Link href={`https://go.drugbank.com/drugs/${lig_state.current_ligand?.ligand.drugbank_id}`}>
                                                <p className="col-span-2 text-sm   hover:underline ribxz-link">{lig_state.current_ligand?.ligand.drugbank_id}</p>
                                            </Link> : null
                                    }
                                </div>
                                <div className="flex flex-row justify-between">

                                </div>
                                <div>
                                    <Accordion type="single" collapsible defaultValue="item" disabled={current_ligand === null}>
                                        <AccordionItem value="item">
                                            <AccordionTrigger

                                                className="text-xs underline">{lig_state.current_ligand?.ligand.chemicalId} in {lig_state.current_ligand?.parent_structure.rcsb_id}</AccordionTrigger>
                                            <AccordionContent className="hover:stroke-red-500">
                                                
                                                Ligand Nbhd
                                                {surroundingResidues.length === 0 ? <p>Loading...</p> : 
                                                surroundingResidues.map((residue, i) => {
                                                    return (
                                                        <div 
                                                        onMouseEnter={() => { ctx?.highlightResidueCluster([{
                                                            res_seq_id: residue.label_seq_id,
                                                            auth_asym_id: residue.chain_id
                                                        }])}}

                                                        onMouseLeave={() => { ctx?.removeHighlight() }}
                                                        key={i} className="flex flex-row justify-between border hover:cursor-pointer hover:bg-muted rounded-sm">
                                                            <span>{residue.label_comp_id} {residue.label_seq_id}</span>
                                                            <span>{residue.chain_id}</span>
                                                            <span>{residue.rcsb_id}</span>
                                                        </div>
                                                    )
                                                })
                                                
                                                }
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>

                                    <Accordion type="single" collapsible defaultValue="item" disabled={current_ligand === null}>
                                        <AccordionItem value="item">
                                            <AccordionTrigger

                                                className="text-xs underline">{lig_state.current_ligand?.ligand.chemicalId} Chemical Structure</AccordionTrigger>
                                            <AccordionContent className="hover:stroke-red-500">
                                                <Image src={chemical_structure_link(lig_state.current_ligand?.ligand.chemicalId)} alt="ligand_chemical_structure.png"
                                                    width={400} height={400} className="hover:stroke-red-600 hover:cursor-pointer"

                                                />
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>




                                    <Accordion type="single" collapsible disabled={current_ligand === undefined || lig_state.current_ligand?.ligand.drugbank_id === undefined}>
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger className={`text-xs underline ${lig_state.current_ligand?.ligand.drugbank_id === undefined ? "text-gray-300" : ""
                                                }`}>Drugbank Description</AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-xs">

                                                    {lig_state.current_ligand?.ligand.drugbank_description}

                                                </p>

                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>





                                    <Button onClick={() => { ctx?.toggle_visibility() }}> Log info</Button>



                                </div>
                                {/* <Separator /> */}
                                {/* <p>ILE interface in in [3J7Z E. coli]</p>
                                <p>μL4, uL22, uL13, 23S rRNA</p>
                                <p>Also Present In :</p> */}
                            </ScrollArea>
                            {/* </Card> */}






                        </div>
                    </div>
                </MolstarContext.Provider>


            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={75}>
                <div className="flex flex-col gap-4">
                    <MolstarNode ref={molstarNodeRef} />
                </div>
            </ResizablePanel>



        </ResizablePanelGroup>
        <SidebarMenu />
    </div>
}