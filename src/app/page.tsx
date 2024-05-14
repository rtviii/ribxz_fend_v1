"use client"
import { useAppDispatch,useAppSelector } from '@/store/store';
import {useRoutersRouterStructListStructuresQuery} from '@/store/ribxz_api/ribxz_api';
import { useEffect } from 'react';
import StoreProvider from './store_provider';
import StructureCatalogue from './structures/page';
import { AppStore } from '@/store/store';
import { increment, incrementByAmount } from '@/store/slices/counterSlice';



export default function Home() {
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) => state.counter.value)


  return (
    <StoreProvider >
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div>count:{count}</div>
        <button onClick={()=>dispatch(increment())}>Increment</button>
        <button onClick={()=>dispatch(incrementByAmount(2))}>incr by amount</button>
        <StructureCatalogue />
      </main>
    </StoreProvider>
  )
}

