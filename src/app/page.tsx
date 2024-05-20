"use client"
import { useAppDispatch,useAppSelector } from '@/store/store';
import StoreProvider from './store_provider';
import StructureCatalogue from './structures/page';



export default function Home() {
  return (
    <StoreProvider >
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <StructureCatalogue />
      </main>
    </StoreProvider>
  )
}

