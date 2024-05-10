"use client"
import { useAppDispatch,useAppSelector } from '@/store/store';
import { useEffect } from 'react';
import StoreProvider from './store_provider';
import Structures from './structures/page';
import { AppStore } from '@/store/store';



export default function Home() {
  const dispatch = useAppDispatch();
  const count = useAppSelector((state) => state.counter)


  return (
    <StoreProvider >
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
         <div> count is {count.value}</div>


        <Structures/>
        {/* <div>struct id:{structState.data.pdbid}</div>
        <div>struct authors:{structState.data.authors}</div>
        <div>struct title:{structState.data.title}</div>

        <button onClick={() => { console.log("increment"); dispatch(setCounter(counterState + 1)) }}>increment counter</button>
        counter :{counterState} */}
      </main>
    </StoreProvider>
  )
}

