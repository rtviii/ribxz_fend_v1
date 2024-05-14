"use client"
import { useAppDispatch,useAppSelector } from '@/store/store';
import StoreProvider from './store_provider';
import StructureCatalogue from './structures/page';
import {actions} from '@/store/slices/counterSlice';



export default function Home() {
  const dispatch = useAppDispatch();
  const count    = useAppSelector((state) => state.counter.value)


  return (
    <StoreProvider >
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div>count:{count}</div>
        <button onClick={()=>dispatch(actions.increment())}>Increment</button>
        <button onClick={()=>dispatch(actions.incrementByAmount(2))}>incr by amount</button>
        <StructureCatalogue />
      </main>
    </StoreProvider>
  )
}

