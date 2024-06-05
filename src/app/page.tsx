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



export default function Home() {
  const { data, isLoading, isError } = useRoutersRouterStructFilterListQuery({})


  const [isOpen_structs, setIsOpen_structs] = useState(false)
  const [isOpen_polymers, setIsOpen_polymers] = useState(false)


  return (
    <StoreProvider >

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
          <div className="w-3/6 bg-slate-50-200 p-4 rounded-md relative border border-gray-400">


            <Collapsible
              open={isOpen_structs}
              onOpenChange={setIsOpen_structs}
              className="space-y-2">

              <CollapsibleTrigger asChild>
                <div className="flex flex-row justify-between space-x-10 px-2 hover:bg-slate-200 hover:cursor-pointer rounded-sm">
                  <p className="font-semibold">Structures </p>
                  <p className="font-semibold">1984</p>
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

            <hr className="my-4" />

            <div className="flex flex-row justify-between space-x-10 ">

              <p>
                Last Update: 2024.06.14

              </p>

              <div>

                <p>Added:
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
          <div className="w-3/6 bg-slate-50-200 p-4 rounded-md relative border border-gray-400">
            <p className="font-bold">Ligands, nopolymers: 300 [*190]</p>
            <p className="font-bold pt-4">Species</p>
          </div>
        </div>



        <div className="flex justify-center mt-10 w-full">
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
        </div>
      </div>
    </StoreProvider>
  )
}

