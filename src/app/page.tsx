"use client"
import StoreProvider from './store_provider';
import DiceIcon from '../../public/dice.svg'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import Image from 'next/image';
import { ribxz_api, useRoutersRouterStructAllRcsbIdsQuery, useRoutersRouterStructFilterListQuery, useRoutersRouterStructListLignadsQuery, useRoutersRouterStructPolymerClassesNomenclatureQuery, useRoutersRouterStructPolymerClassesStatsQuery, useRoutersRouterStructRandomProfileQuery, useRoutersRouterStructStructureCompositionStatsQuery } from '@/store/ribxz_api/ribxz_api';
import Link from "next/link"
import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button"
import { SidebarMenu } from '@/components/ribxz/sidebar_menu';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { HoverCard, HoverCardContent, HoverCardTrigger, } from "@/components/ui/hover-card"
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { AsteriskTooltip } from '@/components/ribxz/asterisk_tooltip';
import MethodsBarchart from './stacked_barchart_expmethod';




const StructuresOverviewPanel = () => {

  return (
    // <div className="  rounded-md relative border border-gray-400 hover:shadow-lg   transition-all ">

    <div className="px-4 py-2 rounded-md relative border border-gray-400 hover:shadow-lg transition-all hover:cursor-pointer">
      {/* <StructStatsTable data={data} /> */}
      <h3 className='text-sm font-semibold '>1864 Atomic Structures</h3>
      <p className='text-xs'>Number of PDB Depositions since 2000 </p>
      <MethodsBarchart />
      <div className="flex flex-row justify-between px-4 mb-2">
        <p className='text-xs text-gray-700'>
          Last Update: 2024.06.14
        </p>
        <div>
          <p className='text-xs text-gray-700'>Added:
            {
              ["8V7X", "4AFX"].map(
                (id, i) => {
                  return (
                    <>
                      <Link key={i} href={``} className='ribxz-link'>
                        {id}
                      </Link>,
                    </>
                  )
                }
              )
            }
            ...
          </p>
        </div>
      </div>
    </div>
  )
}

function PolymerClassesHoverCard({ children, opens_to, class_names, table_label }: { table_label: string, children: React.ReactNode, opens_to: "right" | "left", class_names: string[] }) {
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger className='w-full hover:bg-muted rounded-md hover:cursor-pointer pl-2 pr-8 py-1' >
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 min-h-30 " side={opens_to}>
        <ScrollArea className='overflow-y-scroll max-h-60 '>
          <label className='italic '>{table_label}</label>
          <Separator className='my-2' />
          <div className="grid grid-flow-row-dense grid-cols-3   gap-1">
            {
              class_names.slice().sort((a, b) => Number(a > b)).map(
                (cl, i) => {
                  return (
                    <Link key={i} href={`/polymers?class=${cl}`} >
                      <p key={i} className='border min-w-20 rounded-sm p-1 text-center text-xs hover:bg-muted hover:cursor-pointer  hover:shadow-inner' >
                        {cl}
                      </p>
                    </Link>
                  )
                }
              )
            }
          </div>

        </ScrollArea>
      </HoverCardContent>
    </HoverCard>
  )
}

const PolymersOverviewPanel = (props: { data: any }) => {

  const { data: nomenclature_classes_backend, isLoading: nomenclature_classes_is_loading } = useRoutersRouterStructPolymerClassesNomenclatureQuery();

  const [nom_classes, setClasses] = useState({
    'CytosolicProteins': [],
    'MitochondrialProteins': [],
    'CytosolicRNA': [],
    'MitochondrialRNA': [],
    'E_I_Factors': [],
  });

  useEffect(() => {
    console.log(nomenclature_classes_backend)
    if (nomenclature_classes_backend !== undefined) {

      var _ = {
        "MitochondrialRNA": nomenclature_classes_backend?.MitochondrialRNAClass,
        "CytosolicProteins": nomenclature_classes_backend?.CytosolicProteinClass,
        "MitochondrialProteins": nomenclature_classes_backend?.MitochondrialProteinClass,
        "CytosolicRNA": nomenclature_classes_backend?.CytosolicRNAClass,
        "E_I_Factors": [...nomenclature_classes_backend!.ElongationFactorClass, ...nomenclature_classes_backend!.InitiationFactorClass]
      }
      setClasses(_ as any)
    }
  }, [nomenclature_classes_backend])

  const { data: polymer_classes_stats, isLoading: polymer_classes_stats_L, isError: polymer_classes_stats_E } = useRoutersRouterStructPolymerClassesStatsQuery()
  return (
    <div className="px-4 py-2 rounded-md relative border border-gray-400 hover:shadow-lg transition-all hover:cursor-pointer">
      <div className="space-y-1">
        <div className='flex flex-row justify-between'><h3 className='text-sm font-semibold  mt-2'> {polymer_classes_stats === undefined || polymer_classes_stats === null ? 0 : polymer_classes_stats.length} Polymer Classes </h3><p className='text-xs  mt-2'>(10231 chains total)</p></div>

      </div>
      <Table className='text-xs'>
        <TableHeader >
          <TableRow >
            <TableHead className='p-1 text-start align-middle justify-start'>Polypeptides</TableHead>
            <TableHead className='p-1 text-start  align-middle justify-start'>Polynucleotides</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow >
            <TableCell className='p-1 m-0'><PolymerClassesHoverCard opens_to='left' table_label='Cytosolic Protein Classes' class_names={nom_classes.CytosolicProteins}> CytosolicProteins     </PolymerClassesHoverCard></TableCell>
            <TableCell className='p-1 m-0'><PolymerClassesHoverCard opens_to='right' table_label='Cytosolic RNA Classes' class_names={nom_classes.CytosolicRNA}> Cytosolic         rRNA</PolymerClassesHoverCard></TableCell>
          </TableRow>
          <TableRow >
            <TableCell className='p-1 m-0'> <PolymerClassesHoverCard opens_to='left' table_label='Mitochondrial Protein Classes' class_names={nom_classes.MitochondrialProteins}>Mitochondrial rProteins</PolymerClassesHoverCard></TableCell>
            <TableCell className='p-1 m-0'> <PolymerClassesHoverCard opens_to='right' table_label='Mitochondrial RNA Classes' class_names={nom_classes.MitochondrialRNA}>Mitochondrial rRNA     </PolymerClassesHoverCard></TableCell>
          </TableRow>
          <TableRow >
            <TableCell className='p-1 m-0'>
              <PolymerClassesHoverCard opens_to='left' table_label='Elongation & Initiation Factors' class_names={nom_classes.E_I_Factors}> E & I Factors</PolymerClassesHoverCard>
            </TableCell>
            <TableCell className='p-1 m-0'>
              <Link href={'/polymers?class=tRNA'} className='px-2'>
                tRNA
              </Link>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}


const LigandsOverviewPanel = (props: { data: any }) => {
  const { data, isLoading, isError } = useRoutersRouterStructListLignadsQuery()
  const [lig_stat, setLigStat] = useState<{ bact: 0, euk: 0, arch: 0, drugbank: 0 }>()
  useEffect(() => {
    const acc = data?.reduce((accumulator, current) => {
      if (current[0]['drugbank_id'] != null) {
        accumulator.drugbank += 1
      }
      for (var struct of current[1]) {
        switch (struct['tax_node']['ncbi_tax_id']) {
          case 2759:
            accumulator.euk += 1
          case 2157:
            accumulator.arch += 1
          case 2:
            accumulator.bact += 1
        }
      }
      return accumulator
    }, { bact: 0, euk: 0, arch: 0, drugbank: 0 })
    setLigStat(acc)
  }, [data])
  return (
    <div className="px-4 py-2 rounded-md relative border border-gray-400 hover:shadow-lg transition-all hover:cursor-pointer">
      <h3 className='text-sm font-semibold  mt-2'> {data?.length} Unique Ligands ({lig_stat?.drugbank} in Drugbank) </h3>
      <div className='flex flex-row justify-between text-center mt-2'>
        <p className='text-xs hover:bg-muted rounded-md w-full'> Archaea({lig_stat?.arch})</p>
        <p className='text-xs hover:bg-muted rounded-md w-full'> Bacteria({lig_stat?.bact})</p>
        <p className='text-xs hover:bg-muted rounded-md w-full'> Eukarya({lig_stat?.euk})</p>
      </div>
    </div>
  )

}




const StructStatsTable = (props: { data: any }) => {
  const { data, isLoading, isError } = useRoutersRouterStructStructureCompositionStatsQuery()
  const { data: all_rcsb_ids, isLoading: all_ids_loading, isError: all_ids_isError } = useRoutersRouterStructAllRcsbIdsQuery()
  return (
    <>
      <div className="space-y-1">
        <h4 className=" font-medium text-sm leading-none hover:cursor-pointer hover:bg-muted p-1 mb-2">{all_rcsb_ids?.length} Atomic Structures</h4>
      </div>
      <Table className='text-xs'>
        <TableHeader >
          <TableRow >
            <TableHead ></TableHead>
            <TableHead className=' italic '>Total</TableHead>
            <TableHead className=' italic '>Bacteria</TableHead>
            <TableHead className=' italic '>Eukarya</TableHead>
            <TableHead className=' italic '>Archaea</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell >LSU &amp; SSU



            </TableCell>
            <TableCell className='text-center py-1' >{data ? data?.bacteria.ssu_lsu + data?.eukaryota.ssu_lsu + data?.archaea.ssu_lsu : ""} </TableCell>
            <TableCell className='text-center py-1' >{data?.bacteria.ssu_lsu}</TableCell>
            <TableCell className='text-center py-1' >{data?.eukaryota.ssu_lsu}</TableCell>
            <TableCell className='text-center py-1' >{data?.archaea.ssu_lsu}</TableCell>
          </TableRow>

          <TableRow>

            <TableCell >LSU
              <AsteriskTooltip className='text-red-500'>
                <p>LSU is considered present if any of [<code className='bg-gray-300 px-1 text-black rounded-sm'>mtrRNA16S,5.8SrRNA,5SrRNA,23SrRNA,25SrRNA,25sRNA </code>] are present.</p>
              </AsteriskTooltip>


            </TableCell>
            <TableCell className='text-center py-1'>{data ? data?.archaea.lsu_only + data?.bacteria.lsu_only + data?.eukaryota.lsu_only : ""} </TableCell>
            <TableCell className='text-center py-1'>{data?.bacteria.lsu_only}</TableCell>
            <TableCell className='text-center py-1'>{data?.eukaryota.lsu_only}</TableCell>
            <TableCell className='text-center py-1'>{data?.archaea.lsu_only}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell >SSU

              <AsteriskTooltip className='text-red-500'>
                <p>SSU is considered present if any of [<code className='bg-gray-300 px-1 text-black rounded-sm'>mtrRNA12S,16SrRNA,18SrRNA </code>] are present.</p >
              </AsteriskTooltip>

            </TableCell>
            <TableCell className='text-center py-1'>{data ? data?.archaea.ssu_only + data?.bacteria.ssu_only + data?.eukaryota.ssu_only : ""}</TableCell>
            <TableCell className='text-center py-1'>{data?.bacteria.ssu_only}</TableCell>
            <TableCell className='text-center py-1'>{data?.eukaryota.ssu_only}</TableCell>
            <TableCell className='text-center py-1'>{data?.archaea.ssu_only}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell >Mitoribosome</TableCell>
            <TableCell className='text-center py-1'>{data ? data?.archaea.mitochondrial + data?.bacteria.mitochondrial + data?.eukaryota.mitochondrial : " "}</TableCell>
            <TableCell className='text-center py-1'>{data?.bacteria.mitochondrial}</TableCell>
            <TableCell className='text-center py-1'>{data?.eukaryota.mitochondrial}</TableCell>
            <TableCell className='text-center py-1'>{data?.archaea.mitochondrial}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell >Ligand Bound</TableCell>
            <TableCell className='text-center py-1'>{data ? data?.archaea.drugbank_compounds + data?.eukaryota.drugbank_compounds + data?.bacteria.drugbank_compounds : " "}</TableCell>
            <TableCell className='text-center py-1'>{data?.bacteria.drugbank_compounds}</TableCell>
            <TableCell className='text-center py-1'>{data?.eukaryota.drugbank_compounds}</TableCell>
            <TableCell className='text-center py-1'>{data?.archaea.drugbank_compounds}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

    </>
  )
}

export default function Home() {

  const { data, isLoading, isError } = useRoutersRouterStructFilterListQuery({})
  const [isOpen_structs, setIsOpen_structs] = useState(false)
  const [isOpen_polymers, setIsOpen_polymers] = useState(false)
  const { data: random_profile, isLoading: random_profile_IL, isError: random_profile_IE } = useRoutersRouterStructRandomProfileQuery()

  return (
    <StoreProvider >
      <SidebarMenu />
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-3/6 flex flex-col items-center justify-center mt-20">
          <div className="flex flex-row items-start justify-center space-x-10 relative">
            <Image src="/ribxz_logo_black.png" alt="Ribosome structure" className="w-60" width={60} height={120} />
            <div className="space-y-4">
              <p className="flex font-medium">
                <p className='mr-2'>
                  {/* <code className='border ribxz-link font-medium border-gray-200 bg-gray-100 rounded-sm my-2'>ribosome.xyz</code> provides  */}
                  Organized access to atomic structures of the ribosome.</p>
              </p>
              <p className="text-sm">
                Why not just use the <Link className='ribxz-link' href={"https://pdb101.rcsb.org"}>PDB</Link>?
                <p> - classify RNA/protein chains across models [citations]  </p>
                <p> - provide structural landmarks : PTC, exit tunnel, ligands etc. </p>
                <p> - integrated tools for visualization, structural alignment  </p>
              </p>

              <p className="text-sm">API is available at <code className='border ribxz-link border-gray-200 bg-gray-100 rounded-sm my-2'>api.ribosome.xyz</code> for programmatic access to the data.</p>
              <div className='border rounded-md p-2 border-blue-800 hover:cursor-pointer   hover:shadow-lg'>
                <p className="text-xs font-semibold">RiboXYZ: a comprehensive database for visualizing and analyzing ribosome structures</p>
                <p className='text-xs italic'> Nucleic Acids Research, Volume 51, Issue D1, 6 January 2023</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-start justify-end space-x-10 mt-10 w-3/6">
          <div className='w-3/6  relative  flex-col flex gap-2'>

            <StructuresOverviewPanel />


            <PolymersOverviewPanel data={{}} />
            <LigandsOverviewPanel data={{}} />
          </div>

          <div className="w-3/6 flex flex-col gap-4 justify-between  relative  ">

            <p className='font-bold'> Tools Links</p>
            <Image src={"/logo_hmmer.png"} alt='ubclogo' width={40} height={40} />
            <Image src={"/logo_rcsb.png"} alt='ubclogo' width={40} height={40} />
            <Image src={"/logo_molstar.png"} alt='ubclogo' width={40} height={40} />
            <Image src={"/logo_neo4j.png"} alt='ubclogo' width={40} height={40} />

            <p>muscle5 logo or mention</p>
            <Citation />
          </div>

        </div>

      </div>
    </StoreProvider>
  )
}



const citation = `@article{kushner2023riboxyz,
  title={RiboXYZ: a comprehensive database for visualizing and analyzing ribosome structures},
  author={Kushner, Artem and Petrov, Anton S and Dao Duc, Khanh},
  journal={Nucleic Acids Research},
  volume={51}, number={D1}, pages={D509--D516},
  year={2023},
  publisher={Oxford University Press}
}`
function Citation() {
  return <div className=" p-2 rounded-md  relative border border-gray-400 h-50">
    <div >
      <div className='grid grid-cols-7'>

      <div className="text-xs   p-2 mb-2  col-span-6"> Developed  by <Link className='ribxz-link  px-1' href={"https://rtviii.xyz"}>A. Kushner</Link> and <Link className='text-accent1  ribxz-link pl-1' href='https://kdaoduc.com/'>K. Dao Duc</Link> . Cite and reach out.  </div>
      <div >
        <Image src={"/logo_ubc.png"} alt='ubclogo' width={40} height={40} />
      </div>
</div>
      <ScrollArea className='h-20 shadow-inner border rounded-sm'>
        <pre>
          <code className='text-xs p-2'>{citation}</code>
        </pre>
      </ScrollArea>
    </div>
    <Button
      // variant="outline"
      size="sm"
      className="absolute  hover:bg-transparent hover:text-black border border-black bottom-4 right-8 text-xs p-1 px-2"
      onClick={() => { navigator.clipboard.writeText(citation) }} >
      Copy
    </Button>

  </div>
}
function VisualizeRandom() {

  const [refetch_profile, _] = ribxz_api.endpoints.routersRouterStructRandomProfile.useLazyQuery()
  const router = useRouter()
  const { data: random_profile, isLoading: random_profile_IL, isError: random_profile_IE } = useRoutersRouterStructRandomProfileQuery()


  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <div className="bg-white  rounded-lg border  p-2 group  border-gray-400 ">
          <TooltipTrigger asChild  >
            <div className="flex justify-between  ">
              <div className="flex items-center justify-between w-1/5 ">
                <Image
                  onClick={() => { refetch_profile() }}
                  src={DiceIcon} className='w-12 h-12 rounded-sm border p-1 dice-image hover:cursor-pointer hover:bg-muted' alt="some" />
                <Separator orientation='vertical' className='ml-4' />
              </div>
              <div className='flex  rounded-sm   w-full px-4 hover:bg-muted justify-between hover:cursor-pointer' onClick={() => {
                router.push(`/structures/${random_profile?.rcsb_id}`)
              }}>
                <div className='text-2xl text-center align-middle justify-center items-center flex mr-4 text-blue-700'>{random_profile?.rcsb_id}</div>
                <div className="flex flex-col text-xs  justify-center w-full">
                  <p>{random_profile?.citation_year ? random_profile.citation_year + ", " + (random_profile.citation_rcsb_authors ? random_profile?.citation_rcsb_authors[0] : " ") + " et al." : (random_profile?.citation_rcsb_authors ? random_profile?.citation_rcsb_authors[0] : "") + " et al."}</p>
                  <p>{random_profile?.src_organism_names[0]}</p>
                </div>
              </div>
            </div>
          </TooltipTrigger>
        </div>
        <TooltipContent side="top">
          <p>Visualize random structure</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}