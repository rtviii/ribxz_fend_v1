"use client"
import { useAppDispatch,useAppSelector } from '@/store/store';
import StoreProvider from './store_provider';
import StructureCatalogue from './structures/page';
import { useRoutersRouterStructFilterListQuery } from '@/store/ribxz_api/ribxz_api';



export default function Home() {
  const {data, isLoading, isError} = useRoutersRouterStructFilterListQuery({})
  return (
    <StoreProvider >
        <StructureCatalogue />
    </StoreProvider>
  )
}

