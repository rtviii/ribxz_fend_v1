"use client"
import { useAppDispatch, useAppSelector } from '@/store/store';
import StoreProvider from './store_provider';
import StructureCatalogue from './structures/page';
import { useRoutersRouterStructFilterListQuery } from '@/store/ribxz_api/ribxz_api';
import { Card, CardContent } from "@/components/ui/card"
import { CaretSortIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { SidebarMenu } from '@/components/ribxz/sidebar_menu';
import { Separator } from '@/components/ui/separator';


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

// #TODO: 
// Move ligands and structure stats into one box 
// and polymers stats and classes into another box (both with links to the corresponding pages)


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


    <div className='w-3/6 bg-blue-200 relative'>


          <div className="w-full bg-slate-50-200 p-4 rounded-md relative border border-gray-400 bg-red-100">

            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none">1894 Atomic Structures</h4>
            </div>
            <Separator className="my-2" />
            <div className="flex h-5 flex-row justify-between  text-sm">
              <div className='flex mx-auto'>LSU & SSU: 1200</div>
              <Separator orientation='vertical' />
              <div className='flex mx-auto'>LSU: 740</div>
              <Separator orientation='vertical' />
              <div className='flex mx-auto'>SSU: 490</div>
            </div>

            <Separator orientation='horizontal' className='my-2' />
            <div className="flex flex-row h-5 justify-between w-full text-sm">
              <div className='flex mx-auto'>Mitoribosome: 94</div>
              <Separator orientation='vertical' />
              <div className='flex mx-auto'>Ligand Bound: 1243</div>
            </div>

            <Separator orientation='horizontal' className='my-2' />

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
            <Collapsible
              open={isOpen_polymers}
              onOpenChange={setIsOpen_polymers}
              className="space-y-2">

              <CollapsibleTrigger asChild>
                <div className="flex flex-row justify-between space-x-10 px-2 hover:bg-slate-200 hover:cursor-pointer rounded-sm">
                  <p className="font-semibold">Polymers</p>
                  <p className="font-semibold">1200000</p>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2">
                {[["Both Subunits", 1240], ["LSU Only", 800], ["SSU Only", 239], ["Mitochondrial", 94],].map(
                  (kvp) => <div key={kvp[0]} className="flex  flex-row ml-8 text-xs justify-between space-x-10 px-2">
                    <p className="text-gray-500">{kvp[0]}</p>
                    <p className="text-gray-500">{kvp[1]}</p>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
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

