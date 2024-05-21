"use client"
import { useAppDispatch,useAppSelector } from '@/store/store';
import StoreProvider from './store_provider';
import StructureCatalogue from './structures/page';



export default function Home() {
  return (
    <StoreProvider >
        <StructureCatalogue />
    </StoreProvider>
  )
}

