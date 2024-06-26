"use client"
import { Badge } from "@/components/ui/badge"
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ribxz_api, useRoutersRouterStructListLigandsQuery } from "@/store/ribxz_api/ribxz_api"
import { useAppSelector } from "@/store/store"
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
import { Separator } from "@/components/ui/separator"
import Image from 'next/image'
import { MolstarContext } from "@/components/ribxz/molstar_context"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { ExpMethodBadge } from "@/components/ribxz/exp_method_badge"
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
                                query   : { ligand: props.info.chemicalId },
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
    const ctx        = useAppSelector(state => state.molstar.ui_plugin)
    console.log("row got props:", props);
    
    // const info       = props[0]
    // const structures = props[1]
    // const taxa       = props[2]

    return <TableRow
        className="hover:bg-slate-100  "
    // onClick={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : selectChain(ctx!, polymer.auth_asym_id) } : undefined}
    // onMouseEnter={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : highlightChain(ctx, polymer.asym_ids[0]) } : undefined}
    // onMouseLeave={props.connect_to_molstar_ctx ? () => { ctx == undefined ? console.log("Plugin is still loading") : removeHighlight(ctx!) } : undefined} 
    >
        {/* <TableCell className="font-semibold ">{info.chemicalId}</TableCell>
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
        </TableCell> */}

    </TableRow>
}

export default function Ligands() {

    const { data: ligands_data, isLoading, isError } = useRoutersRouterStructListLigandsQuery()
    const chemical_structure_link = (ligand_id:string) =>{  var ligand_id = ligand_id.toUpperCase(); return `https://cdn.rcsb.org/images/ccd/labeled/{ligand_id[0]}/{ligand_id}.svg` }
    
    const molstarNodeRef = useRef<HTMLDivElement>(null);
    const [ctx, setCtx] = useState<MolstarRibxz | null>(null)
    useEffect(() => {
        console.log("Page mounted. Initializing Molstar Plugin UI Context");
        (async () => {
            const x = new MolstarRibxz
            await x.init(molstarNodeRef.current!)
            setCtx(x)
        })()
    }, [])

    useEffect(() => {
        console.log("Gotligands data")
        console.log(ligands_data);
    }, [ligands_data])

    return <div className="flex flex-col h-screen w-screen overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className=" ">
                <ResizablePanel defaultSize={25} >

                        <MolstarContext.Provider value={ctx}>
 <div className="border-r">
        <div className="p-4 space-y-4">
          <Input type="search" placeholder="Search" className="w-full mb-4" />
          <Card className="p-4 space-y-2">
            <div className="flex justify-between">
              <span>ISOLEUCINE</span>
              <span>ILE</span>
            </div>
            <div>
              <p>formula_weight: 0.131</p>
              <p>number_of_Instances: 2</p>
              <img src="/placeholder.svg" alt="Ligand" className="w-12 h-12" />
              <p>drugbank_id: "DB00167"</p>
              <p>
                drugbank_description: "An essential branched-chain aliphatic\n amino acid found in many proteins. It is
                an isomer of leucine.\n It is important in hemoglobin synthesis and regulation of blood\n sugar and
                energy levels."
              </p>
            </div>
          </Card>
          <Card className="p-4 space-y-2">
            <p>ILE interface in in [3J7Z E. coli]</p>
            <p>μL4, uL22, uL13, 23S rRNA</p>
          </Card>
          <Card className="p-4 space-y-2">
            <p>Also Present In :</p>
          </Card>
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