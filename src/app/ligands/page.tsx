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
import { MolstarRibxz, ResidueList } from "@/components/mstar/molstar_wrapper_class"
import { MolstarNode } from "@/components/mstar/lib"
import Image from 'next/image'
import { MolstarContext } from "@/components/ribxz/molstar_context"
import { ScrollArea } from "@radix-ui/react-scroll-area"
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
import { TaxonomyDot } from "@/components/ribxz/taxonomy"
import { SidebarMenu } from "@/components/ribxz/sidebar_menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { TreeSelect } from "antd"
import { LigandInstances, set_current_ligand } from "@/store/slices/ui_state"
import { capitalize_only_first_letter_w } from "@/my_utils"
import { IconVisibilityOn, IconToggleSpin, IconVisibilityOff } from "@/components/ribxz/visibility_icon"


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
                <span style={{}}>{lig.chemicalName.length > 30 ? capitalize_only_first_letter_w(lig.chemicalName).slice(0, 40) + "..." : capitalize_only_first_letter_w(lig.chemicalName)}</span>
            </div>
        ),

        // `${lig.chemicalId} (${lig.chemicalName.length > 30 ?  capitalize_only_first_letter_w(lig.chemicalName).slice(0,30)+"..." : capitalize_only_first_letter_w(lig.chemicalName) })`,
        selectable: false,                                                                                                         // Make the parent node not selectable
        search_aggregator: (lig.chemicalName + lig.chemicalId + structs.reduce((acc: string, next) => acc + next.rcsb_id + next.tax_node.scientific_name, '')).toLowerCase(),
        children: structs.map((struct, index) => ({
            search_aggregator: (lig.chemicalName + lig.chemicalId + struct.rcsb_id + struct.tax_node.scientific_name).toLowerCase(),
            key: `${lig.chemicalId}_${struct.rcsb_id}`,
            value: `${lig.chemicalId}_${struct.rcsb_id}`,
            title: (
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span><span style={{ fontWeight: "bold" }}>{lig.chemicalId}</span> in <span style={{ fontWeight: "bold" }}>{struct.rcsb_id}</span></span>
                    <span style={{ fontStyle: 'italic' }}>{struct.tax_node.scientific_name}</span>
                </div>
            ),
            selectable: true                                                       // Make the child nodes selectable
        }))
    }));
}

export default function Ligands() {
    const dispatch = useAppDispatch();

    const [refetchParentStruct] = ribxz_api.endpoints.routersRouterStructStructureProfile.useLazyQuery()



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

    const [surroundingResidues, setSurroundingResidues] = useState<ResidueList>([])
    const [parentStructProfile, setParentStructProfile] = useState<RibosomeStructure>({} as RibosomeStructure)
    const [nomenclatureMap, setNomenclatureMap] = useState<{ [key: string]: string | undefined }>({})
    const [structRepresentation, setStructRepresentation] = useState<any>({})
    const [structVisibility, setStructVisibility] = useState<boolean>(true)

    const chemical_structure_link = (ligand_id: string | undefined) => {
        if (ligand_id === undefined) { return '' };
        return `https://cdn.rcsb.org/images/ccd/labeled/${ligand_id.toUpperCase()[0]}/${ligand_id.toUpperCase()}.svg`
    }


    useEffect(() => {
        if (current_ligand?.parent_structure.rcsb_id === undefined) { return }
        const fetchData = async () => {
            try {
                const result = await refetchParentStruct({
                    rcsbId: current_ligand?.parent_structure.rcsb_id
                }).unwrap();
                console.log("Got structure", result);

                setParentStructProfile(result);
            } catch (error) {
                console.error('Error fetching parent struct:', error);
            }
        };
        fetchData();
    }, [current_ligand])


    useEffect(() => {
        if (parentStructProfile.rcsb_id === undefined) { return }
        const residues = surroundingResidues
        var chain_ids = []
        for (let residue of residues) {
            chain_ids.push(residue.auth_asym_id)
        }
        var nom_map = {}
        for (let polymer of [...parentStructProfile.rnas, ...parentStructProfile.proteins]) {
            // console.log("polymer", polymer);
            if (chain_ids.includes(polymer.auth_asym_id)) {
                if (!Object.keys(nom_map).includes(polymer.auth_asym_id)) {
                    nom_map[polymer.auth_asym_id] = polymer.nomenclature[0]
                }
            }
        }
        setNomenclatureMap(nom_map)
    }, [surroundingResidues, parentStructProfile])

    useEffect(() => {
        if (current_ligand === undefined) { return }
        ctx?.download_struct(current_ligand?.parent_structure.rcsb_id!, true)
            .then(({
                ctx: molstar,
                struct_representation
            }) => {
                setStructRepresentation(struct_representation)
                return molstar.create_ligand_and_surroundings(current_ligand?.ligand.chemicalId)
            })
            .then((ctx) => ctx.toggleSpin())
            .then((ctx) => ctx.get_selection_constituents(current_ligand?.ligand.chemicalId))
            .then(residues => {
                setSurroundingResidues(residues)
            })
    }, [current_ligand])



    return <div className="flex flex-col h-screen w-screen overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className=" ">
            <ResizablePanel defaultSize={25} >
                <MolstarContext.Provider value={ctx}>
                    <div className="border-r">
                        <div className="p-4 space-y-1">
                            <TreeSelect
                                status={current_ligand === null ? "warning" : undefined}
                                showSearch={true}
                                treeNodeFilterProp='search_aggregator'                                                                                     // Changed from 'search_front' to 'title'
                                placeholder="Select ligand-structure pair..."
                                variant="outlined"
                                treeData={lig_data_to_tree(lig_state.data)}
                                className="w-full"
                                treeExpandAction="click"
                                showCheckedStrategy="SHOW_CHILD"
                                filterTreeNode={(input, treenode) => { return (treenode.search_aggregator as string).includes(input.toLowerCase()) }}
                                onChange={(value: string, _) => {
                                    var [chemId, rcsb_id_selected] = value.split("_")
                                    const lig_and_its_structs = lig_state.data.filter((kvp) => {
                                        var [lig, structs] = kvp; return lig.chemicalId == chemId;
                                    })
                                    const struct = lig_and_its_structs[0][1].filter((s) => s.rcsb_id == rcsb_id_selected)[0]
                                    dispatch(set_current_ligand({
                                        ligand: lig_and_its_structs[0][0],
                                        parent_structure: struct
                                    }))
                                }}
                            />
                            <div className="rounded-md shadow-sm " >
                                <button

                                    onMouseEnter={() => { ctx?.select_focus_ligand(current_ligand?.ligand.chemicalId, ['highlight']) }}
                                    onMouseLeave={() => { ctx?.removeHighlight() }}
                                    onClick={() => { ctx?.select_focus_ligand(current_ligand?.ligand.chemicalId, ['select', 'focus']) }}

                                    disabled={current_ligand === null}
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700 w-[40%]" >

                                    Ligand
                                </button>
                                <button

                                    onMouseEnter={() => { ctx?.select_focus_ligand_surroundings(current_ligand?.ligand.chemicalId, ['highlight']) }}
                                    onMouseLeave={() => { ctx?.removeHighlight() }}
                                    onClick={() => { ctx?.select_focus_ligand_surroundings(current_ligand?.ligand.chemicalId, ['select', 'focus']) }}
                                    disabled={current_ligand === null}
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-r border-gray-200 rounded-r-md hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700 w-[60%]" >
                                    Binding site 5 A
                                </button>
                            </div>
                            <div className="text-xs flex flex-row justify-between hover:bg-muted p-1 rounded-sm border hover:cursor-pointer"
                            onClick={() => { ctx?.toggle_visibility_by_ref(structRepresentation, structVisibility); setStructVisibility(!structVisibility) }} ><span>Toggle Structure Visibility</span> 
                            { !structVisibility ? <IconVisibilityOff /> : <IconVisibilityOn   /> }
                            </div>
                            <div className="text-xs flex flex-row justify-between hover:bg-muted p-1 rounded-sm border hover:cursor-pointer" onClick={()=>{ctx?.toggleSpin()}}>
                                <span>Toggle Spin</span>  
                                <IconToggleSpin/>
                            </div>

                            <ScrollArea className="h-[90vh] overflow-scroll  no-scrollbar">
                                <div>
                                    <Accordion type="single" collapsible defaultValue="item" disabled={current_ligand === null}>
                                        <AccordionItem value="item">
                                            {lig_state.current_ligand === null ?
                                                <AccordionTrigger className="text-xs" disabled={lig_state.current_ligand === null}>[<span className="italic">Chemical ID</span>] in [<span className="italic">PDB ID</span>]</AccordionTrigger>
                                                :
                                                <AccordionTrigger className="text-xs underline">{lig_state.current_ligand?.ligand.chemicalId} in {lig_state.current_ligand?.parent_structure.rcsb_id}</AccordionTrigger>
                                            }




                                            <AccordionContent >
                                                <div className="space-y-1 text-xs">
                                                    {surroundingResidues.length === 0 ? null :
                                                        surroundingResidues.map((residue, i) => {
                                                            return (
                                                                <div
                                                                    onClick={() => {
                                                                        ctx?.select_residueCluster([{
                                                                            res_seq_id: residue.label_seq_id,
                                                                            auth_asym_id: residue.auth_asym_id
                                                                        }])
                                                                    }}
                                                                    onMouseEnter={() => {
                                                                        ctx?.highlightResidueCluster([{
                                                                            res_seq_id: residue.label_seq_id,
                                                                            auth_asym_id: residue.auth_asym_id
                                                                        }])
                                                                    }}

                                                                    onMouseLeave={() => { ctx?.removeHighlight() }}
                                                                    key={i} className="ml-8 flex flex-row justify-between border hover:cursor-pointer hover:bg-muted rounded-sm p-1">
                                                                    {"*"}<span>{residue.label_comp_id} {residue.label_seq_id}</span>
                                                                    <span>{residue.auth_asym_id}</span>
                                                                    <span>{nomenclatureMap[residue.auth_asym_id]}</span>
                                                                    <span>{residue.rcsb_id}</span>
                                                                </div>
                                                            )
                                                        })

                                                    }
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>

                                    <Accordion type="single" collapsible defaultValue="item" disabled={current_ligand === null}>
                                        <AccordionItem value="item">
                                            <AccordionTrigger

                                                className="text-xs underline">{lig_state.current_ligand?.ligand.chemicalId} Chemical Structure</AccordionTrigger>
                                            {current_ligand ?
                                                <AccordionContent className="hover:cursor-pointer  border hover:shadow-inner shadow-lg">


                                                    <Image src={chemical_structure_link(lig_state.current_ligand?.ligand.chemicalId)} alt="ligand_chemical_structure.png"
                                                        width={400} height={400}
                                                        onMouseEnter={() => { ctx?.select_focus_ligand(current_ligand?.ligand.chemicalId, ['highlight']) }}
                                                        onMouseLeave={() => { ctx?.removeHighlight() }}
                                                        onClick={() => { ctx?.select_focus_ligand(current_ligand?.ligand.chemicalId, ['select', 'focus']) }}
                                                    />

                                                </AccordionContent>

                                                :
                                                null
                                            }
                                        </AccordionItem>
                                    </Accordion>




                                    <Accordion type="single" collapsible disabled={current_ligand === undefined || lig_state.current_ligand?.ligand.drugbank_id === undefined}>
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger className={`text-xs underline ${lig_state.current_ligand?.ligand.drugbank_id === undefined ? "text-gray-300" : ""
                                                }`}>

                                                <div className="flex flex-row justify-between">
                                                    {current_ligand === null ? null : <p className="col-span-2 text-sm ">{lig_state.current_ligand?.ligand.chemicalId}<span className=" text-xs text-gray-800">({capitalize_only_first_letter_w(lig_state.current_ligand?.ligand.chemicalName)})</span></p>}
                                                    {lig_state.current_ligand?.ligand.drugbank_id ? <Link href={`https://go.drugbank.com/drugs/${lig_state.current_ligand?.ligand.drugbank_id}`}> <p className="col-span-2 text-sm   hover:underline ribxz-link">{lig_state.current_ligand?.ligand.drugbank_id}</p> </Link> : null}
                                                </div>

                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-xs">

                                                    {lig_state.current_ligand?.ligand.drugbank_description}

                                                </p>

                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>





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