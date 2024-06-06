"use client"
import { useAppDispatch, useAppSelector } from '@/store/store';
import StoreProvider from './store_provider';
import DiceIcon from '../../public/dice.svg'

import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import Image from 'next/image';
import StructureCatalogue from './structures/page';
import { CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum, ribxz_api, useRoutersRouterStructFilterListQuery, useRoutersRouterStructPolymerClassesNomenclatureQuery, useRoutersRouterStructRandomProfileQuery } from '@/store/ribxz_api/ribxz_api';
import { GearIcon, GitHubLogoIcon, ChatBubbleIcon } from '@radix-ui/react-icons'
import { Card, CardContent } from "@/components/ui/card"
import { CaretSortIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { ReactNode, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { SidebarMenu } from '@/components/ribxz/sidebar_menu';
import { Separator } from '@/components/ui/separator';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ScrollArea } from '@/components/ui/scroll-area';
import { TaxonomyDot } from '@/components/ribxz/taxonomy';


export function PolymerClassesHoverCard({ children, opens_to, class_names, table_label }: { table_label: string, children: React.ReactNode, opens_to: "right" | "left", class_names: CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum[] }) {
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger className='w-full hover:bg-blue-200 rounded-md hover:cursor-pointer pl-2 pr-8 py-1' >
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-60 " side={opens_to}>
        <ScrollArea className='overflow-y-scroll max-h-60 no-scrollbar'>
          <label className='italic '>{table_label}</label>
          <Separator className='my-2' />
          <div className="grid grid-cols-2 gap-1">
            {
              class_names
                .toSorted((a, b) => Number(a > b))
                .map(
                  (cl, i) => {
                    return (
                      <Link key={i} href={`/polymers?class=${cl}`} >
                        <p key={i} className='border w-20 rounded-sm p-1 text-center text-xs hover:bg-slate-200 hover:cursor-pointer  hover:shadow-inner' >
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

const PolymersStatsTable = (props: { data: any }) => {

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
    if (nomenclature_classes_backend === undefined) return
    var _ = {
      "MitochondrialRNA": nomenclature_classes_backend?.MitochondrialRNAClass,
      "CytosolicProteins": nomenclature_classes_backend?.CytosolicProteinClass,
      "MitochondrialProteins": nomenclature_classes_backend?.MitochondrialProteinClass,
      "CytosolicRNA": nomenclature_classes_backend?.CytosolicRNAClass,
      "E_I_Factors": [...nomenclature_classes_backend!.ElongationFactorClass, ...nomenclature_classes_backend!.InitiationFactorClass]
    }
    setClasses(_)
  }, [nomenclature_classes_backend])


  return (
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
  )
}

const StructStatsTable = (props: { data: any }) => {
  return (
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
          <TableCell >LSU &amp; SSU</TableCell>
          <TableCell className='text-center py-1' >1200</TableCell>
          <TableCell className='text-center py-1' >234</TableCell>
          <TableCell className='text-center py-1' >876</TableCell>
          <TableCell className='text-center py-1' >90</TableCell>
        </TableRow>
        <TableRow>
          <TableCell >LSU</TableCell>
          <TableCell className='text-center py-1'>740</TableCell>
          <TableCell className='text-center py-1'>156</TableCell>
          <TableCell className='text-center py-1'>512</TableCell>
          <TableCell className='text-center py-1'>72</TableCell>
        </TableRow>

        <TableRow>
          <TableCell >SSU</TableCell>
          <TableCell className='text-center py-1'>490</TableCell>
          <TableCell className='text-center py-1'>78</TableCell>
          <TableCell className='text-center py-1'>364</TableCell>
          <TableCell className='text-center py-1'>48</TableCell>
        </TableRow>

        <TableRow>
          <TableCell >Mitoribosome</TableCell>
          <TableCell className='text-center py-1'>94</TableCell>
          <TableCell className='text-center py-1'>12</TableCell>
          <TableCell className='text-center py-1'>82</TableCell>
          <TableCell className='text-center py-1'>0</TableCell>
        </TableRow>

        <TableRow>
          <TableCell >Ligand Bound</TableCell>
          <TableCell className='text-center py-1'>1243</TableCell>
          <TableCell className='text-center py-1'>287</TableCell>
          <TableCell className='text-center py-1'>856</TableCell>
          <TableCell className='text-center py-1'>100</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}


export default function Home() {
  const { data, isLoading, isError } = useRoutersRouterStructFilterListQuery({})
  const [isOpen_structs, setIsOpen_structs] = useState(false)
  const [isOpen_polymers, setIsOpen_polymers] = useState(false)




  return (
    <StoreProvider >
      <SidebarMenu />

      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-3/6 flex flex-col items-center justify-center mt-36">

          <div className="flex flex-row items-start justify-center space-x-10 relative">
            <Image src="/sping.gif" alt="Ribosome structure" className="w-60" width={60} height={120} />
            <div className="space-y-4">
              <p className="flex font-medium">
                <p className='mr-2'><code className='border font-medium border-gray-200 bg-gray-100 rounded-sm my-2'>ribosome.xyz</code> provides organized access to atomic structures of the ribosome.</p>
              </p>
              <p className="text-sm">
                We classify polymer chains of the ribosome and extra-ribosomal elements like tRNA and ligands. Structural landmarks and tools for visualization, alignment are provided for the navigation of deposited models.
              </p>
              <p className="text-sm"> API is available at <code className='border border-gray-200 bg-gray-100 rounded-sm my-2'>api.ribosome.xyz</code> for programmatic access to the data.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-row items-start justify-end space-x-10 mt-10 w-3/6">

          <div className='w-3/6  relative  flex-col flex gap-2'>
            <div className="w-full bg-slate-50-200 p-4 rounded-md relative border border-gray-400 hover:shadow-lg   transition-all ">

              <div className="space-y-1">
                <h4 className=" font-medium leading-none hover:cursor-pointer hover:bg-blue-50 p-1 mb-2">1894 Atomic Structures</h4>
              </div>
              <StructStatsTable data={data} />

              <div className="flex flex-row justify-between  mt-4">
                <p className='text-xs text-gray-700'>
                  Last Update: 2024.06.14
                </p>
                <div>
                  <p className='text-xs text-gray-700'>Added:
                    <Link href="#" className="text-blue-600" prefetch={false}>
                      8V7X
                    </Link>,
                    <Link href="#" className="text-blue-600" prefetch={false}>
                      4AFX
                    </Link>,
                    ...
                  </p>
                </div>
              </div>
            </div>


            <div className="bg-slate-50-200 p-4 rounded-md relative border border-gray-400">
              <PolymersStatsTable data={{}} />
            </div>
          </div>

          <div className="w-3/6 flex flex-col gap-4 justify-between  relative  ">


            <VisualizeRandom />

            <Citation />
          </div>






        </div>

      </div>




    </StoreProvider>
  )
}

function VisualizeRandom() {

  const { data: random_profile, isLoading: random_profile_IL, isError: random_profile_IE } = useRoutersRouterStructRandomProfileQuery()
  const [refetch_profile, _] = ribxz_api.endpoints.routersRouterStructRandomProfile.useLazyQuery()

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
              <Link href={`/structures/${random_profile?.rcsb_id}`}>
                <div className='w-4/5 flex  rounded-sm   mx-4 px-4 hover:bg-muted hover:cursor-pointer'>
                  <div className='text-2xl text-center align-middle justify-center items-center flex mr-4'>{random_profile?.rcsb_id}</div>
                  <div className="flex flex-col text-xs  justify-center">
                    <p>{random_profile?.citation_year}, {random_profile?.citation_rcsb_authors[0]}</p>
                    <p>{random_profile?.src_organism_names.join(",")}</p>
                  </div>
                </div>
              </Link>
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

const citation = `@article{kushner2023riboxyz,
  title={RiboXYZ: a comprehensive database for visualizing and analyzing ribosome structures},
  author={Kushner, Artem and Petrov, Anton S and Dao Duc, Khanh},
  journal={Nucleic Acids Research},
  volume={51}, number={D1}, pages={D509--D516},
  year={2023},
  publisher={Oxford University Press}
}`
export function Citation() {
  return <div className="bg-slate-50-200 p-2 rounded-md  relative border border-gray-400 h-50">
    <div className="text-xs   p-2 mb-2 flex">Developed by A. Kushner and K. Dao Duc. Cite and reach out.  </div>

    <div >
      <ScrollArea className='h-20 shadow-inner border rounded-sm'>
        <pre>
          <code className='text-xs p-2'>{citation}</code>
        </pre>
      </ScrollArea>
    </div>
    <Button
      variant="default"
      size="sm"
      className="absolute bottom-4 right-8"
      onClick={() => { navigator.clipboard.writeText(citation) }} >
      Copy
    </Button>

  </div>
}
