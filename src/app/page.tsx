"use client"
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import StoreProvider from './store_provider';
import Structures from './structures/page';


interface CounterState {
  count: number
}

export default function Home() {


  return (
    <StoreProvider >
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
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

