"use client"
import { useAppDispatch, useAppSelector } from '@/store/store';
import StoreProvider from './store_provider';
import StructureCatalogue from './structures/page';
import { CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum, useRoutersRouterStructFilterListQuery } from '@/store/ribxz_api/ribxz_api';
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


export function HoverCardDemo({children, classes}:{children:React.ReactNode, classes:CytosolicRnaClassMitochondrialRnaClasstRnaElongationFactorClassInitiationFactorClassCytosolicProteinClassMitochondrialProteinClassUnionEnum[]}) {
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger >
        { children }
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side='left'>
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@nextjs</h4>
            <p className="text-sm">
              The React Framework – created and maintained by @vercel.
            </p>
            <div className="flex items-center pt-2">
              <span className="text-xs text-muted-foreground">
                Joined December 2021
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

const citation = `
@article{kushner2023riboxyz,
  title={RiboXYZ: a comprehensive database for visualizing and analyzing ribosome structures},
  author={Kushner, Artem and Petrov, Anton S and Dao Duc, Khanh},
  journal={Nucleic Acids Research},
  volume={51},
  number={D1},
  pages={D509--D516},
  year={2023},
  publisher={Oxford University Press}
}
`


const PolymersStatsTable = (props: { data: any }) => {

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
          <TableCell className='p-1 m-0'><HoverCardDemo> CytosolicProteins</HoverCardDemo></TableCell>
          <TableCell className='p-1 m-0'>Cytosolic rRNA</TableCell>
        </TableRow>
        <TableRow >
          <TableCell className='p-1 m-0'>Mitochondrial rProteins</TableCell>
          <TableCell className='p-1 m-0'>Mitochondrial rRNA</TableCell>
        </TableRow>
        <TableRow >
          <TableCell className='p-1 m-0'>E & I Factors</TableCell>
          <TableCell className='p-1 m-0'>tRNA</TableCell>
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
            <img src="/ribosome.gif" alt="Ribosome structure" className="w-60" />
            <div className="space-y-4">
              <p className="text-lg">
                ribosome.xyz provides organized access to atomic structures of the ribosome and their components.
              </p>
              <p className="text-sm">
                We implement standard nomenclatures for proteins, rRNA and multiple classes of factors and provide
                structural landmarks to facilitate the navigation of deposited models. per [Ban, Schmitt, Xu and others]
              </p>
              <p className="text-sm">An API is available at api.ribosome.xyz</p>
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
              {/* <h4 className=" leading-none hover:cursor-pointer hover:bg-blue-50 p-1 mb-2">Polymers</h4> */}
              <PolymersStatsTable data={{}} />


            </div>


          </div>

          {/* CITATION BIT */}
          {/* <div className="flex justify-center mt-10 w-full"> */}
          <div className="w-3/6 bg-slate-50-200 p-4 rounded-md relative border border-gray-400">
            <div className="text-xs font-medium mb-2">Developed by A. Kushner and K. Dao-Duc. Cite and reach out:</div>
            <div >
              <pre>
                <code className='text-xs'>{citation}</code>
              </pre>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={() => { navigator.clipboard.writeText(citation) }} >
              Copy
            </Button>
          </div>
          {/* </div> */}

          {/* CITATION BIT */}


        </div>









      </div>




    </StoreProvider>
  )
}

