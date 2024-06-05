"use client"
import { useAppDispatch, useAppSelector } from '@/store/store';
import StoreProvider from './store_provider';
import StructureCatalogue from './structures/page';
import { useRoutersRouterStructFilterListQuery } from '@/store/ribxz_api/ribxz_api';
import { Card, CardContent } from "@/components/ui/card"
import { } from '@/components/ribxz/home_plots'
import Link from "next/link"
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';



export default function Home() {
  const { data, isLoading, isError } = useRoutersRouterStructFilterListQuery({})



  return (
    <StoreProvider >

      <div className="flex flex-col items-center justify-center w-full mt-40">
        <div className="w-2/5 flex flex-col items-center justify-center">
          <div className="flex flex-row items-start justify-center space-x-10">
            <div className='flex flex-col'>
              <img src="/7K00.gif" alt="Ribosome structure"  />
              <div className=" flex justify-between w-full px-2 py-1 text-xs text-gray-600">
                <span>5AFI</span>
                <span>Myasnikov et al.</span>
              </div>
            </div>
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
          <div className="flex flex-row items-start justify-center space-x-10 mt-10">
            <Card className="w-[250px]">
              <CardContent>
                <p className="font-bold">Total Structures :1894</p>
                <p>Subunits:</p>
                <ul className="list-disc pl-4">
                  <li>lsu 1200</li>
                  <li>ssu 550</li>
                  <li>both 1272</li>
                </ul>
                <p className="pt-4">
                  [last updated: date structures added:{" "}
                  <Link href="#" className="text-blue-600" prefetch={false}>
                    8V7X
                  </Link>
                  , 9OGH]
                </p>
              </CardContent>
            </Card>
            <Card className="w-[250px]">
              <CardContent>
                <p className="font-bold">Ligands, nopolymers: 300 [*190]</p>
              </CardContent>
            </Card>
            <Card className="w-[250px]">
              <CardContent>
                <p className="font-bold">Species</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StoreProvider>
  )
}

