"use client"
import { Badge } from "@/components/ui/badge"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { BindingSite, BindingSiteChain, LigandTransposition, ribxz_api, useRoutersRouterStructListLigandsQuery } from "@/store/ribxz_api/ribxz_api"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
import { NonpolymericLigand, RibosomeStructure, useRoutersRouterStructStructureProfileQuery, useRoutersRouterStructStructurePtcQuery } from "@/store/ribxz_api/ribxz_api"
import _ from 'lodash'
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { MolstarRibxz, Residue, ResidueList } from "@/components/mstar/molstar_wrapper_class"
import { MolstarNode, MolstarNode_secondary } from "@/components/mstar/lib"
import Image from 'next/image'
import { MolstarContext } from "@/components/ribxz/molstar_context"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { Switch } from "@/components/ui/switch"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import React from 'react';
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
import { Input, InputNumber, TreeSelect } from "antd"
import { LigandInstances, fetchPredictionData, set_current_ligand, set_ligand_prediction_data, set_ligands_radius } from "@/store/slices/ui_reducer"
import { capitalize_only_first_letter_w, yield_nomenclature_map_profile } from "@/my_utils"
import { IconVisibilityOn, IconToggleSpin, IconVisibilityOff, DownloadIcon } from "@/components/ribxz/visibility_icon"
import { ResidueBadge } from "@/components/ribxz/residue_badge"
import { ImperativePanelHandle } from "react-resizable-panels"
import  { GlobalStructureSelection } from "@/components/ribxz/ribxz_structure_selection"
import { Spinner } from "@/components/ui/spinner"

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

/** This returns the link to the chemical structure image that rcsb stores. */
const chemical_structure_link = (ligand_id: string | undefined) => {
    if (ligand_id === undefined) { return '' };
    return `https://cdn.rcsb.org/images/ccd/labeled/${ligand_id.toUpperCase()[0]}/${ligand_id.toUpperCase()}.svg`
}

type LigandAssociatedTaxa = Array<[string, number]>
type LigandRowProps = [LigandInfo, LigandAssociatedStructure[], LigandAssociatedTaxa]
const LigandTableRow = (props: LigandRowProps) => {
    const ctx = useAppSelector(state => state.molstar.ui_plugin)
    return <TableRow
        className=" hover:bg-slate-100 "
    // onClick={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : selectChain(ctx!, polymer.auth_asym_id) } : undefined}
    // onMouseEnter={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : highlightChain(ctx, polymer.asym_ids[0]) } : undefined}
    // onMouseLeave={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : removeHighlight(ctx!) } : undefined} 
    >

    </TableRow>
}

const lig_data_to_tree = (lig_data: LigandInstances) => {

    return lig_data.map(([lig, structs]) => ({
        key: lig.chemicalId,
        value: lig.chemicalId,
        title: (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span className="font-semibold">{lig.chemicalId}</span>
                <span style={{}}>{lig.chemicalName.length > 30 ? capitalize_only_first_letter_w(lig.chemicalName).slice(0, 40) + "..." : capitalize_only_first_letter_w(lig.chemicalName)}</span>
            </div>
        ),

        // `${lig.chemicalId} (${lig.chemicalName.length > 30 ?  capitalize_only_first_letter_w(lig.chemicalName).slice(0,30)+"..." : capitalize_only_first_letter_w(lig.chemicalName) })`,
        selectable: false,                                                                                                                                               // Make the parent node not selectable
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
            selectable: true // Make the child nodes selectable
        }))
    }));
}


const DownloadDropdown = ({ residues, disabled, filename }: { residues: Residue[], disabled: boolean, filename: string }) => {
    const handleDownloadCSV = () => {

        var data = residues.map((residue) => { return [residue.auth_seq_id, residue.label_comp_id, residue.auth_asym_id, residue.polymer_class, residue.rcsb_id] })

        const csvContent = data.map(row => row.join(',')).join('\n');

        // Create a Blob with the CSV content
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        // Create a download link
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <DropdownMenu >
            <DropdownMenuTrigger asChild >
                <Button variant="outline" size="sm" disabled={disabled}>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Download
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={handleDownloadCSV}>
                    CSV
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};



const LigandPredictionNucleotides = (lp: LigandTransposition): any[] => {
    if (lp === null) { return [] }
    var chain_residue_tuples = []
    for (var chain of lp.constituent_chains) {
        for (let res of chain.target.target_bound_residues) {
            chain_residue_tuples.push({ auth_asym_id: chain.target.auth_asym_id, auth_seq_id: res.auth_seq_id })
        }
    }

    return chain_residue_tuples
}


export default function Ligands() {
    const dispatch = useAppDispatch();

    const [refetchParentStruct] = ribxz_api.endpoints.routersRouterStructStructureProfile.useLazyQuery()

    const molstarNodeRef = useRef<HTMLDivElement>(null);
    const molstarNodeRef_secondary = useRef<HTMLDivElement>(null);

    const [ctx, setCtx] = useState<MolstarRibxz | null>(null)
    const [ctx_secondary, setCtx_secondary] = useState<MolstarRibxz | null>(null)


    const [predictionMode, setPredictionMode] = useState(false)


    useEffect(() => {
        (async () => {
            const x = new MolstarRibxz();
            await x.init(molstarNodeRef.current!)
            setCtx(x)

            const y = new MolstarRibxz()
            await y.init(molstarNodeRef_secondary.current!)
            setCtx_secondary(y)
        })()
    }, [])



    const lig_state = useAppSelector(state => state.ui.ligands_page)
    const current_ligand = useAppSelector(state => state.ui.ligands_page.current_ligand)

    const [surroundingResidues, setSurroundingResidues] = useState<ResidueList>([])
    const [parentStructProfile, setParentStructProfile] = useState<RibosomeStructure>({} as RibosomeStructure)
    const [nomenclatureMap, setNomenclatureMap] = useState<Record<string, string | undefined>>({})
    const [structRepresentation, setStructRepresentation] = useState<any>({})
    const [structVisibility, setStructVisibility] = useState<boolean>(true)


    useEffect(() => {
        if (current_ligand?.parent_structure.rcsb_id === undefined) { return }
        const fetchData = async () => {
            try {
                const result = await refetchParentStruct({ rcsbId: current_ligand?.parent_structure.rcsb_id }).unwrap();
                setParentStructProfile(result);
            } catch (error) {
                console.error('Error fetching parent struct:', error);
            }
        };
        fetchData();
    }, [current_ligand])


    useEffect(() => {
        if (parentStructProfile.rcsb_id === undefined) { return }
        const nom_map = yield_nomenclature_map_profile(parentStructProfile)
        setNomenclatureMap(nom_map)
    }, [surroundingResidues, parentStructProfile])

    useEffect(() => {
        if (parentStructProfile.rcsb_id === undefined) { return }
        const residues = surroundingResidues
        var chain_ids = []
        for (let residue of residues) {
            chain_ids.push(residue.auth_asym_id)
        }
        var nom_map: any = {}
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


    // -------------------------------------
    useEffect(() => {
        if (current_ligand === undefined) { return }
        ctx?.download_struct(current_ligand?.parent_structure.rcsb_id!, true)
            .then(({
                ctx: molstar,
                struct_representation
            }) => {
                setStructRepresentation(struct_representation)
                return molstar.create_ligand_and_surroundings(current_ligand?.ligand.chemicalId, lig_state.radius)
            })
            .then((ctx) => ctx.get_selection_constituents(current_ligand?.ligand.chemicalId, lig_state.radius))
            .then(residues => { setSurroundingResidues(residues) })
    }, [current_ligand])

    const [checked, setChecked] = useState(false)


    const [showLowerPanel, setShowLowerPanel] = useState(false)
    const lowerPanelRef = React.useRef<ImperativePanelHandle>(null)
    const upperPanelRef = React.useRef<ImperativePanelHandle>(null)
    useEffect(() => {
        // Collapse the lower panel on initial render
        if (lowerPanelRef.current) {
            lowerPanelRef.current.collapse()
        }
        // Expand the upper panel to 100% on initial render
        if (upperPanelRef.current) {
            upperPanelRef.current.resize(100)
        }
    }, [])
    const toggleLowerPanel = () => {
        setShowLowerPanel(prev => !prev)
        if (lowerPanelRef.current && upperPanelRef.current) {
            if (showLowerPanel) {
                lowerPanelRef.current.collapse()
                upperPanelRef.current.resize(100)
            } else {
                lowerPanelRef.current.expand()
                upperPanelRef.current.resize(50)
                lowerPanelRef.current.resize(50)
            }
        }
    }

    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

    useEffect(() => {
        if (predictionMode) {
            setIsAccordionOpen(true);
        }
    }, [predictionMode]);


    // const { data: prediction_data, error: prediction_error, isLoading: prediction_isloading, refetch: prediction_refetch } = ribxz_api.useRoutersRouterLigLigTransposeQuery(
    //     {
    //         chemicalId: current_ligand?.ligand.chemicalId,
    //         sourceStructure: current_ligand?.parent_structure.rcsb_id,
    //         targetStructure: current_selected_target?.rcsb_id,
    //         radius : lig_state.radius
    //     },
    //     { skip: current_ligand === null || current_selected_target === null, refetchOnMountOrArgChange: true,
    //     }
    // );
    const current_selected_target = useAppSelector(state => state.homepage_overview.selected)
    useEffect(() => {
        if (current_selected_target !== null) {
            ctx_secondary?.download_struct(current_selected_target.rcsb_id, true)

        }
        dispatch(set_ligand_prediction_data(null))
    }, [current_selected_target])

    // useEffect(() => {}, [prediction_data])

    const ligands_state = useAppSelector(state => state.ui.ligands_page)

    const [radChanged, setRadChanged] = useState(false);



    return <div className="flex flex-col h-screen w-screen overflow-hidden">

        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full p-4">
                    <MolstarContext.Provider value={ctx}>
                        <div className="border-r">
                            <div className="p-4 space-y-2">
                                <div className="flex flex-row space-x-4">

                                    <TreeSelect status={current_ligand === null ? "warning" : undefined} showSearch={true}
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
                                    <InputNumber addonAfter="Å" className={`w-[30%] ${radChanged ? " outline-green-200 shadow-md shadow-green-400   rounded-md transition-all duration-200" : null}`} max={20} min={2} placeholder="Radius" value={ligands_state.radius} onChange={v => { if (v === null) { return } { dispatch(set_ligands_radius(v)); setRadChanged(true) } }} />
                                </div>

                                <div className="flex flex-row w-full justify-between">

                                    <Button
                                        onClick={() => {
                                            setRadChanged(false)
                                            if (current_ligand === null || ctx === null) { return }
                                            ctx.create_ligand_and_surroundings(current_ligand?.ligand.chemicalId, lig_state.radius)
                                                .then((ctx) => ctx.get_selection_constituents(current_ligand?.ligand.chemicalId, lig_state.radius))
                                                .then(residues => { setSurroundingResidues(residues) })
                                        }}

                                        variant={"outline"}
                                        disabled={current_ligand === null}
                                        className={` px-4 py-2 text-sm font-medium text-gray-900 bg-white border  hover:bg-gray-100 rounded-l-lg  focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700 ${radChanged ? " outline-green-200 shadow-md shadow-green-400 rounded-sm   transition-all duration-200" : null}  `} >
                                        Render
                                    </Button>
                                    <Button
                                        onMouseEnter={() => { ctx?.select_focus_ligand(current_ligand?.ligand.chemicalId, ['highlight']) }}
                                        onMouseLeave={() => { ctx?.removeHighlight() }}
                                        onClick={() => { ctx?.select_focus_ligand(current_ligand?.ligand.chemicalId, ['select', 'focus']) }}
                                        variant={"secondary"}
                                        disabled={current_ligand === null}
                                        className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border  hover:bg-gray-100 rounded-l-lg  focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700 " >
                                        Ligand
                                    </Button>

                                    <Button
                                        variant={"secondary"}
                                        onMouseEnter={() => { ctx?.select_focus_ligand_surroundings(current_ligand?.ligand.chemicalId, lig_state.radius, ['highlight']) }}
                                        onMouseLeave={() => { ctx?.removeHighlight() }}
                                        onClick={() => { ctx?.select_focus_ligand_surroundings(current_ligand?.ligand.chemicalId, lig_state.radius, ['select', 'focus']) }}
                                        disabled={current_ligand === null}
                                        className="px-4 py-2 text-sm font-medium text-gray-900 bg-white hover:bg-gray-100 border-t border-b border-r  rounded-r-md  focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700 " >
                                        Binding Site
                                    </Button>

                                    <Button
                                        variant={"secondary"}
                                        className="text-xs  text-gray-900 bg-white border  hover:bg-gray-100 "
                                        onClick={() => { ctx?.toggle_visibility_by_ref(structRepresentation, structVisibility); setStructVisibility(!structVisibility) }} >
                                        <div className=" flex-row p-1 rounded-sm flex items-center content-center align-middle justify-center gap-2 ">
                                            <span>Toggle Structure Visibility</span>
                                            <div>
                                                {!structVisibility ? <div> < IconVisibilityOff className="w-6 h-6" /></div> : <div ><IconVisibilityOn className="w-6 h-6" /></div>}
                                            </div>
                                        </div>

                                    </Button>
                                    <Button
                                        variant={"secondary"}
                                        className="text-xs   text-gray-900 bg-white border  hover:bg-gray-100 " onClick={() => { ctx?.toggleSpin() }}>
                                        <div className="flex items-center content-center align-middle  flex-row p-1 rounded-sm justify-between gap-2 ">
                                            <span>Toggle Spin</span>
                                            <div>
                                                <IconToggleSpin className="w-6 h-6 flex items-center content-center align-middle justify-center" />
                                            </div>
                                        </div>
                                    </Button>
                                </div>

                                <ScrollArea className="h-[90vh] overflow-scroll  no-scrollbar space-y-4 mt-16">
                                    <Accordion type="single" collapsible
                                        defaultValue="none" disabled={current_ligand === null}>
                                        <AccordionItem value="item">
                                            <AccordionTrigger className="text-xs rounded-sm hover:cursor-pointer hover:bg-muted border p-1">{lig_state.current_ligand?.ligand.chemicalId} Chemical Structure</AccordionTrigger>
                                            {current_ligand ? <AccordionContent className="hover:cursor-pointer  border hover:shadow-inner shadow-lg">
                                                <Image src={chemical_structure_link(lig_state.current_ligand?.ligand.chemicalId)} alt="ligand_chemical_structure.png"
                                                    width={400} height={400}
                                                    onMouseEnter={() => { ctx?.select_focus_ligand(current_ligand?.ligand.chemicalId, ['highlight']) }}
                                                    onMouseLeave={() => { ctx?.removeHighlight() }}
                                                    onClick={() => { ctx?.select_focus_ligand(current_ligand?.ligand.chemicalId, ['select', 'focus']) }}
                                                />
                                            </AccordionContent> : null
                                            }
                                        </AccordionItem>
                                    </Accordion>


                                    <Accordion type="single" collapsible defaultValue="none" disabled={current_ligand === undefined}>
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger className="text-xs rounded-sm flex flex-roww justify-between  hover:cursor-pointer hover:bg-muted border p-1">

                                                <span className="text-xs text-gray-800">Drugbank Info</span>
                                                <div>
                                                    {lig_state.current_ligand?.ligand.drugbank_id ?
                                                        <Link className="" href={`https://go.drugbank.com/drugs/${lig_state.current_ligand?.ligand.drugbank_id}`}>
                                                            <p className="text-sm   hover:underline ribxz-link">{lig_state.current_ligand?.ligand.drugbank_id}</p>
                                                        </Link> :
                                                        null
                                                    }
                                                </div>



                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-xs">
                                                    {lig_state.current_ligand?.ligand.drugbank_description}
                                                </p>

                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>

                                    <Accordion type="single" collapsible defaultValue="item" className="border p-1 rounded-md">
                                        <AccordionItem value="item">
                                            <AccordionTrigger className="text-xs rounded-sm hover:cursor-pointer hover:bg-muted  ">
                                                <div className="flex flex-row justify-between w-full pr-4">
                                                    <span> {lig_state.current_ligand === null ? <span className="font-light italic">Select Ligand...</span> : lig_state.current_ligand?.ligand.chemicalId + " in " + lig_state.current_ligand?.parent_structure.rcsb_id}</span>
                                                    <span className="font-light">Binding Pocket Details</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="flex items-center space-x-2 text-xs p-1 border-b mb-2">
                                                    <DownloadDropdown
                                                        residues={surroundingResidues.map(r => ({ ...r, polymer_class: nomenclatureMap[r.auth_asym_id] }))}
                                                        disabled={!(surroundingResidues.length > 0)}
                                                        filename={`${lig_state.current_ligand?.ligand.chemicalId}_${lig_state.current_ligand?.parent_structure.rcsb_id}_binding_site.csv`}

                                                    />
                                                </div>
                                                <div className="flex flex-wrap ">
                                                    {surroundingResidues.length === 0 ? null :
                                                        Object.entries(surroundingResidues.reduce((acc: Record<string, Residue[]>, next: Residue) => {
                                                            if (Object.keys(acc).includes(next.auth_asym_id)) {
                                                                acc[next.auth_asym_id].push(next)
                                                            }
                                                            else {
                                                                acc[next.auth_asym_id] = [next]
                                                            }
                                                            return acc
                                                        }, {})).map(entry =>
                                                            <Accordion type="single" collapsible className="border p-1 rounded-md w-full h-fit my-1" key={entry[0]}>
                                                                <AccordionItem value={"other"}>
                                                                    <AccordionTrigger >

                                                                        <div className="flex flex-row justify-start w-64 border-dashed border p-1 rounded-md border-black hover:bg-pink-300"
                                                                            onMouseEnter={() => ctx?.highlightChain(entry[0])}
                                                                            onMouseLeave={() => ctx?.removeHighlight()}


                                                                            onClick={e => {
                                                                                e.stopPropagation()
                                                                                ctx?.select_chain(entry[0])
                                                                            }


                                                                            }>
                                                                            <span className="font-light w-8">{entry[0]}</span>{" "}<span className="px-4">{nomenclatureMap[entry[0]]}</span>
                                                                        </div>
                                                                    </AccordionTrigger>
                                                                    <AccordionContent className="flex flex-wrap">
                                                                        {entry[1].map((residue, i) => {
                                                                            return <ResidueBadge
                                                                                molstar_ctx={ctx} residue={{
                                                                                    auth_asym_id: entry[0],
                                                                                    auth_seq_id: residue.auth_seq_id,
                                                                                    label_comp_id: residue?.label_comp_id,
                                                                                    label_seq_id: residue?.label_seq_id,
                                                                                    rcsb_id: residue.rcsb_id,
                                                                                    polymer_class: nomenclatureMap[entry[0]]
                                                                                }}
                                                                                show_parent_chain={checked} key={i} />
                                                                        })}
                                                                    </AccordionContent>
                                                                </AccordionItem>


                                                            </Accordion>
                                                        )

                                                    }
                                                </div>


                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                    <div className="flex items-center space-x-2 p-2 rounded-md border ">
                                        <Switch id="show-lower-panel" checked={predictionMode} onCheckedChange={() => { toggleLowerPanel(); setPredictionMode(!predictionMode) }} disabled={current_ligand === null} />
                                        <Label htmlFor="show-lower-panel" className="w-full cursor-pointer">
                                            <div className="flex flex-row justify-between">
                                                Binding Pocket Prediction
                                                {current_ligand !== null ?
                                                    <span className="font-light text-xs italic">
                                                        Using <span className="font-semibold">{current_ligand.parent_structure.rcsb_id}/{current_ligand.ligand.chemicalId}</span> as source.
                                                    </span> : null
                                                }
                                            </div>
                                        </Label>
                                    </div>
                                    <Accordion type="single" collapsible value={predictionMode ? "prediction" : undefined} onValueChange={(value) => setIsAccordionOpen(value === "prediction")} className="border p-1 rounded-md">

                                        <AccordionItem value="prediction" >
                                            <AccordionTrigger className="text-xs rounded-sm hover:cursor-pointer hover:bg-muted  ">

                                                <div className="flex flex-row justify-between  pr-4 w-full text-center content-center align-middle">
                                                    <span className="text-center">
                                                        Prediction Target

                                                    </span>

                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>

                                                <GlobalStructureSelection />

                                                <div className="flex items-center space-x-2 text-xs p-1 border-b mb-2">
                                                    <Button variant={"outline"} 
                                                    onClick={() => {
                                                        if (current_selected_target === null || current_ligand === null) { return }
                                                        dispatch(fetchPredictionData(
                                                            {
                                                                chemid: current_ligand?.ligand.chemicalId,
                                                                src   : current_ligand?.parent_structure.rcsb_id,
                                                                tgt   : current_selected_target?.rcsb_id,
                                                                radius: lig_state.radius
                                                            }
                                                        ))
                                                    }}> {ligands_state.prediction_pending ? <><Spinner/> <span className="mx-2">Calculating</span></> : "Render Prediction"}</Button>

                                                    <Button variant={"outline"} disabled={ligands_state.prediction_data === undefined || _.isEmpty(ligands_state.prediction_data)} onClick={() => {
                                                        if (ligands_state.prediction_data === undefined || ligands_state.prediction_data === null) { return }
                                                        ctx_secondary?.highlightResidueCluster(LigandPredictionNucleotides(ligands_state.prediction_data))
                                                        ctx_secondary?.select_residueCluster(LigandPredictionNucleotides(ligands_state.prediction_data))
                                                    }}> Display Prediction</Button>
                                                    <DownloadDropdown
                                                        residues={ligands_state.prediction_data?.purported_binding_site.chains
                                                            .map(chain => {
                                                                return chain.bound_residues.map(r => {
                                                                    var newres: Residue = {
                                                                        auth_asym_id : chain.auth_asym_id,
                                                                        auth_seq_id  : r.auth_seq_id,
                                                                        label_comp_id: r.label_comp_id,
                                                                        label_seq_id : r.label_seq_id,
                                                                        rcsb_id      : r.rcsb_id,
                                                                        polymer_class: chain.nomenclature[0]
                                                                    }
                                                                    return newres
                                                                })
                                                            }).reduce((acc: Residue[], next: Residue[]) => {
                                                                return [...acc, ...next]
                                                            }, []) as Residue[]}


                                                        disabled={!(surroundingResidues.length > 0)}
                                                        filename={`${lig_state.current_ligand?.ligand.chemicalId}_${lig_state.current_ligand?.parent_structure.rcsb_id}_binding_site.csv`}

                                                    />
                                                </div>

                                                {ligands_state.prediction_data === undefined ? null :
                                                    ligands_state.prediction_data?.constituent_chains.map((chain, i) =>
                                                        <Accordion type="single" collapsible className="border p-1 rounded-md w-full my-2" key={i}>
                                                            <AccordionItem value={"other"}>

                                                                <AccordionTrigger >
                                                                    <div className="flex flex-row justify-start w-64 border-dashed border p-1 rounded-md border-black hover:bg-pink-300"
                                                                        onMouseEnter={() => ctx_secondary?.highlightChain(chain.target.auth_asym_id)}
                                                                        onMouseLeave={() => ctx_secondary?.removeHighlight()}


                                                                        onClick={e => {
                                                                            e.stopPropagation()
                                                                            ctx_secondary?.select_chain(chain.target.auth_asym_id)
                                                                        }


                                                                        }>
                                                                        <span className="font-light w-8">{chain.target.auth_asym_id}</span>{" "}<span className="px-4">{chain.polymer_class}</span>
                                                                    </div>

                                                                </AccordionTrigger>
                                                                <AccordionContent className="flex flex-wrap">
                                                                    {chain.target.target_bound_residues.map((residue, i) => {
                                                                        return <ResidueBadge
                                                                            molstar_ctx={ctx_secondary} residue={{
                                                                                auth_asym_id: chain.target.auth_asym_id,
                                                                                auth_seq_id: residue.auth_seq_id,
                                                                                label_comp_id: residue?.label_comp_id,
                                                                                label_seq_id: residue?.label_seq_id,
                                                                                rcsb_id: residue.rcsb_id,
                                                                                polymer_class: nomenclatureMap[chain.target.auth_asym_id]
                                                                            }}
                                                                            show_parent_chain={checked} key={i} />
                                                                    })}
                                                                </AccordionContent>
                                                            </AccordionItem>


                                                        </Accordion>
                                                    )

                                                }




                                                {/* </div> */}
                                            </AccordionContent>
                                        </AccordionItem>

                                    </Accordion>

                                </ScrollArea>

                            </div>
                        </div>
                    </MolstarContext.Provider>
                </div>
            </ResizablePanel >
            <ResizableHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
                <ResizablePanelGroup direction="vertical" >
                    <ResizablePanel defaultSize={50} minSize={20} ref={upperPanelRef} >
                        <div className="h-full bg-background p-2 ">
                            <MolstarNode ref={molstarNodeRef} />
                        </div>
                    </ResizablePanel>
                    <ResizableHandle className="h-2 bg-gray-200 hover:bg-gray-300 transition-colors" />
                    <ResizablePanel ref={lowerPanelRef} defaultSize={50} minSize={0} collapsible onCollapse={() => setShowLowerPanel(false)} onExpand={() => setShowLowerPanel(true)} >
                        <div className="h-full  p-2">
                            <MolstarNode_secondary ref={molstarNodeRef_secondary} />
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
        </ResizablePanelGroup >

        <SidebarMenu />
    </div >
}